import { db } from "@/lib/db";
import { getMealSchedule, findScheduledMeal } from "@/lib/data/meal-schedule";
import { mondayOf, DAYS_OF_WEEK, MEAL_SLOTS } from "@/lib/weekly-menu-constants";
import type { Prisma } from "@/generated/prisma/client";

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

const selectionWithMeal = {
  include: {
    meal: {
      include: {
        recipe: { include: { ingredients: { include: { ingredient: true } } } },
      },
    },
  },
} satisfies Prisma.CustomerMealSelectionDefaultArgs;

export async function getWeeklyIngredientRequirements(): Promise<WeeklyIngredientPlan> {
  const weekStartDate = mondayOf(new Date());
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  const [selections, activeCustomers, schedule] = await Promise.all([
    db.customerMealSelection.findMany({
      where: { weekStartDate, customerProfile: { status: "ACTIVE" } },
      ...selectionWithMeal,
    }),
    db.customerProfile.findMany({
      where: { status: "ACTIVE" },
      select: { id: true },
    }),
    getMealSchedule(),
  ]);

  const totals = new Map<string, IngredientRequirement>();

  function addMeal(meal: {
    recipe: { ingredients: { ingredient: { id: string; name: string; unit: string }; quantity: number }[] } | null;
  }) {
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

  for (const { id: customerProfileId } of activeCustomers) {
    for (const dayOfWeek of DAYS_OF_WEEK) {
      for (const mealSlot of MEAL_SLOTS) {
        const selection = selections.find(
          (s) =>
            s.customerProfileId === customerProfileId &&
            s.dayOfWeek === dayOfWeek &&
            s.mealSlot === mealSlot
        );
        const meal = selection?.meal ?? findScheduledMeal(schedule, dayOfWeek, mealSlot)?.meal;
        if (meal) addMeal(meal);
      }
    }
  }

  const requirements = Array.from(totals.values()).sort(
    (a, b) => b.totalQuantity - a.totalQuantity
  );

  return {
    weekLabel: `${weekStartDate.toLocaleDateString()} – ${weekEndDate.toLocaleDateString()}`,
    requirements,
  };
}
