import { db } from "@/lib/db";
import { dayOfWeekFromDate, MEAL_SLOTS } from "@/lib/weekly-menu-constants";
import type { MealSlot, Prisma } from "@/generated/prisma/client";

export type ProductionCustomer = {
  name: string;
  requests: string[];
  allergies: { name: string; notes: string | null }[];
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
  weekLabel: string;
  slots: Record<MealSlot, { totalMeals: number; meals: ProductionMeal[] }>;
};

const mealWithRecipe = {
  include: {
    recipe: { include: { ingredients: { include: { ingredient: true } } } },
  },
} satisfies Prisma.MealDefaultArgs;

type MealWithRecipe = Prisma.MealGetPayload<typeof mealWithRecipe>;

export async function getDailyProduction(): Promise<DailyProduction | null> {
  const today = dayOfWeekFromDate(new Date());
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  const menu = await db.weeklyMenu.findFirst({
    where: {
      status: { in: ["PUBLISHED", "LOCKED"] },
      weekEndDate: { gte: todayMidnight },
    },
    orderBy: { weekStartDate: "asc" },
    include: {
      menuItems: {
        where: { dayOfWeek: today, isRecommended: true },
        include: { meal: mealWithRecipe },
      },
    },
  });
  if (!menu) return null;

  const [activeSubscriptions, selections] = await Promise.all([
    db.subscription.findMany({
      where: { status: "ACTIVE" },
      include: {
        customerProfile: {
          include: { allergies: { include: { allergy: true } }, tags: true },
        },
      },
    }),
    db.customerMealSelection.findMany({
      where: { weeklyMenuId: menu.id, menuItem: { dayOfWeek: today } },
      include: {
        menuItem: { include: { meal: mealWithRecipe } },
        customizations: true,
      },
    }),
  ]);

  const slots = Object.fromEntries(
    MEAL_SLOTS.map((slot) => [slot, { totalMeals: 0, meals: [] as ProductionMeal[] }])
  ) as DailyProduction["slots"];

  for (const slot of MEAL_SLOTS) {
    const recommendedItem = menu.menuItems.find((mi) => mi.mealSlot === slot);
    const byMeal = new Map<
      string,
      { meal: MealWithRecipe; customers: ProductionCustomer[] }
    >();

    for (const subscription of activeSubscriptions) {
      const profile = subscription.customerProfile;
      const selection = selections.find(
        (s) =>
          s.customerProfileId === profile.id && s.menuItem.mealSlot === slot
      );

      const meal = selection ? selection.menuItem.meal : recommendedItem?.meal;
      if (!meal) continue;

      const customer: ProductionCustomer = {
        name: `${profile.firstName} ${profile.lastName}`,
        requests: selection ? selection.customizations.map((c) => c.note) : [],
        allergies: profile.allergies.map((a) => ({
          name: a.allergy.name,
          notes: a.notes,
        })),
        tags: profile.tags.map((t) => t.tag),
      };

      const entry = byMeal.get(meal.id) ?? { meal, customers: [] };
      entry.customers.push(customer);
      byMeal.set(meal.id, entry);
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
        hasAllergyAlert: customers.some((c) => c.allergies.length > 0),
      })
    );

    meals.sort((a, b) => b.portions - a.portions);
    slots[slot] = {
      totalMeals: meals.reduce((sum, m) => sum + m.portions, 0),
      meals,
    };
  }

  return {
    weekLabel: `${menu.weekStartDate.toLocaleDateString()} – ${menu.weekEndDate.toLocaleDateString()}`,
    slots,
  };
}
