import { db } from "@/lib/db";
import { DAYS_OF_WEEK, MEAL_SLOTS } from "@/lib/weekly-menu-constants";
import type { DayOfWeek, MealSlot, Prisma } from "@/generated/prisma/client";

export type IngredientRequirement = {
  ingredientId: string;
  name: string;
  unit: string;
  totalQuantity: number;
};

export type WeeklyIngredientPlan = {
  weekLabel: string;
  requirements: IngredientRequirement[];
};

const mealWithRecipe = {
  include: {
    recipe: { include: { ingredients: { include: { ingredient: true } } } },
  },
} satisfies Prisma.MealDefaultArgs;

export async function getWeeklyIngredientRequirements(): Promise<WeeklyIngredientPlan | null> {
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
        where: { isRecommended: true },
        include: { meal: mealWithRecipe },
      },
    },
  });
  if (!menu) return null;

  const [activeSubscriptions, selections] = await Promise.all([
    db.subscription.findMany({
      where: { status: "ACTIVE" },
      select: { customerProfileId: true },
    }),
    db.customerMealSelection.findMany({
      where: { weeklyMenuId: menu.id },
      include: { menuItem: { include: { meal: mealWithRecipe } } },
    }),
  ]);

  const totals = new Map<string, IngredientRequirement>();

  function addMeal(meal: { recipe: { ingredients: { ingredient: { id: string; name: string; unit: string }; quantity: number }[] } | null }) {
    if (!meal.recipe) return;
    for (const ri of meal.recipe.ingredients) {
      const existing = totals.get(ri.ingredient.id);
      if (existing) {
        existing.totalQuantity += ri.quantity;
      } else {
        totals.set(ri.ingredient.id, {
          ingredientId: ri.ingredient.id,
          name: ri.ingredient.name,
          unit: ri.ingredient.unit,
          totalQuantity: ri.quantity,
        });
      }
    }
  }

  for (const { customerProfileId } of activeSubscriptions) {
    for (const day of DAYS_OF_WEEK as DayOfWeek[]) {
      for (const slot of MEAL_SLOTS as MealSlot[]) {
        const selection = selections.find(
          (s) =>
            s.customerProfileId === customerProfileId &&
            s.menuItem.dayOfWeek === day &&
            s.menuItem.mealSlot === slot
        );
        const meal = selection
          ? selection.menuItem.meal
          : menu.menuItems.find(
              (mi) => mi.dayOfWeek === day && mi.mealSlot === slot
            )?.meal;
        if (meal) addMeal(meal);
      }
    }
  }

  const requirements = Array.from(totals.values()).sort(
    (a, b) => b.totalQuantity - a.totalQuantity
  );

  return {
    weekLabel: `${menu.weekStartDate.toLocaleDateString()} – ${menu.weekEndDate.toLocaleDateString()}`,
    requirements,
  };
}
