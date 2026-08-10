import { db } from "@/lib/db";
import { dayOfWeekFromDate, mondayOf, MEAL_SLOTS } from "@/lib/weekly-menu-constants";
import type { MealSlot, Prisma } from "@/generated/prisma/client";

export type ProductionCustomer = {
  name: string;
  note: string | null;
  allergies: { name: string; notes: string | null }[];
  otherAllergies: string | null;
  preferences: { type: string; label: string }[];
  tags: string[];
};

export type ProductionMeal = {
  mealId: string;
  mealName: string;
  portions: number;
  instructions: string | null;
  ingredients: { name: string; quantity: number; unit: string }[];
  customers: ProductionCustomer[];
  hasAllergyAlert: boolean;
};

export type DailyProduction = {
  dayLabel: string;
  slots: Record<MealSlot, { totalMeals: number; meals: ProductionMeal[] }>;
};

const selectionWithMeal = {
  include: {
    meal: {
      include: {
        recipe: { include: { ingredients: { include: { ingredient: true } } } },
      },
    },
    customerProfile: {
      include: {
        allergies: { include: { allergy: true } },
        preferences: true,
        tags: true,
      },
    },
  },
} satisfies Prisma.CustomerMealSelectionDefaultArgs;

type SelectionWithMeal = Prisma.CustomerMealSelectionGetPayload<typeof selectionWithMeal>;

export async function getDailyProduction(date: Date = new Date()): Promise<DailyProduction> {
  const dayOfWeek = dayOfWeekFromDate(date);
  const weekStartDate = mondayOf(date);

  const selections = await db.customerMealSelection.findMany({
    where: {
      weekStartDate,
      dayOfWeek,
      customerProfile: { status: "ACTIVE" },
    },
    ...selectionWithMeal,
  });

  const slots = Object.fromEntries(
    MEAL_SLOTS.map((slot) => [slot, { totalMeals: 0, meals: [] as ProductionMeal[] }])
  ) as DailyProduction["slots"];

  for (const slot of MEAL_SLOTS) {
    const byMeal = new Map<
      string,
      { meal: SelectionWithMeal["meal"]; customers: ProductionCustomer[] }
    >();

    for (const selection of selections.filter((s) => s.mealSlot === slot)) {
      const profile = selection.customerProfile;
      const customer: ProductionCustomer = {
        name: `${profile.firstName} ${profile.lastName}`,
        note: selection.note,
        allergies: profile.allergies.map((a) => ({
          name: a.allergy.name,
          notes: a.notes,
        })),
        otherAllergies: profile.otherAllergies,
        preferences: profile.preferences.map((p) => ({ type: p.type, label: p.label })),
        tags: profile.tags.map((t) => t.tag),
      };

      const entry = byMeal.get(selection.meal.id) ?? { meal: selection.meal, customers: [] };
      entry.customers.push(customer);
      byMeal.set(selection.meal.id, entry);
    }

    const meals: ProductionMeal[] = Array.from(byMeal.entries()).map(
      ([mealId, { meal, customers }]) => ({
        mealId,
        mealName: meal.name,
        portions: customers.length,
        instructions: meal.recipe?.instructions ?? null,
        ingredients:
          meal.recipe?.ingredients.map((ri) => ({
            name: ri.ingredient.name,
            quantity: ri.quantity,
            unit: ri.unit,
          })) ?? [],
        customers,
        hasAllergyAlert: customers.some(
          (c) => c.allergies.length > 0 || Boolean(c.otherAllergies)
        ),
      })
    );

    meals.sort((a, b) => b.portions - a.portions);
    slots[slot] = {
      totalMeals: meals.reduce((sum, m) => sum + m.portions, 0),
      meals,
    };
  }

  return {
    dayLabel: date.toLocaleDateString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
    slots,
  };
}
