import { db } from "@/lib/db";
import { dayOfWeekFromDate, mondayOf, MEAL_SLOTS } from "@/lib/weekly-menu-constants";
import type { MealSlot, Prisma } from "@/generated/prisma/client";

export type OrderTicket = {
  customerName: string;
  mealId: string;
  mealName: string;
  deliveryTimeStart: string | null;
  deliveryTimeEnd: string | null;
  note: string | null;
  allergies: { name: string; notes: string | null }[];
  otherAllergies: string | null;
  preferences: { type: string; label: string }[];
  tags: string[];
};

export type MealSummary = {
  mealId: string;
  mealName: string;
  portions: number;
  instructions: string | null;
  ingredients: { name: string; quantity: number; unit: string }[];
  hasAllergyAlert: boolean;
};

export type DailyProduction = {
  dayLabel: string;
  slots: Record<MealSlot, { totalMeals: number; tickets: OrderTicket[]; meals: MealSummary[] }>;
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

function sortByDeliveryTime(a: OrderTicket, b: OrderTicket) {
  if (a.deliveryTimeStart && b.deliveryTimeStart) {
    return a.deliveryTimeStart.localeCompare(b.deliveryTimeStart);
  }
  if (a.deliveryTimeStart) return -1;
  if (b.deliveryTimeStart) return 1;
  return a.customerName.localeCompare(b.customerName);
}

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
    MEAL_SLOTS.map((slot) => [
      slot,
      { totalMeals: 0, tickets: [] as OrderTicket[], meals: [] as MealSummary[] },
    ])
  ) as DailyProduction["slots"];

  for (const slot of MEAL_SLOTS) {
    const slotSelections = selections.filter((s) => s.mealSlot === slot);

    const tickets: OrderTicket[] = slotSelections.map((selection) => {
      const profile = selection.customerProfile;
      return {
        customerName: `${profile.firstName} ${profile.lastName}`,
        mealId: selection.meal.id,
        mealName: selection.meal.name,
        deliveryTimeStart: profile.preferredDeliveryStart,
        deliveryTimeEnd: profile.preferredDeliveryEnd,
        note: selection.note,
        allergies: profile.allergies.map((a) => ({
          name: a.allergy.name,
          notes: a.notes,
        })),
        otherAllergies: profile.otherAllergies,
        preferences: profile.preferences.map((p) => ({ type: p.type, label: p.label })),
        tags: profile.tags.map((t) => t.tag),
      };
    });
    tickets.sort(sortByDeliveryTime);

    const byMeal = new Map<string, { meal: (typeof slotSelections)[number]["meal"]; portions: number }>();
    for (const selection of slotSelections) {
      const entry = byMeal.get(selection.meal.id) ?? { meal: selection.meal, portions: 0 };
      entry.portions += 1;
      byMeal.set(selection.meal.id, entry);
    }

    const meals: MealSummary[] = Array.from(byMeal.entries()).map(([mealId, { meal, portions }]) => ({
      mealId,
      mealName: meal.name,
      portions,
      instructions: meal.recipe?.instructions ?? null,
      ingredients:
        meal.recipe?.ingredients.map((ri) => ({
          name: ri.ingredient.name,
          quantity: ri.quantity,
          unit: ri.unit,
        })) ?? [],
      hasAllergyAlert: tickets.some(
        (t) => t.mealId === mealId && (t.allergies.length > 0 || Boolean(t.otherAllergies))
      ),
    }));
    meals.sort((a, b) => b.portions - a.portions);

    slots[slot] = { totalMeals: tickets.length, tickets, meals };
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
