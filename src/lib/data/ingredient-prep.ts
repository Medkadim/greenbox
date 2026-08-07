import { db } from "@/lib/db";
import { mondayOf } from "@/lib/weekly-menu-constants";
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

  const selections = await db.customerMealSelection.findMany({
    where: { weekStartDate, customerProfile: { status: "ACTIVE" } },
    ...selectionWithMeal,
  });

  const totals = new Map<string, IngredientRequirement>();

  for (const selection of selections) {
    if (!selection.meal.recipe) continue;
    for (const ri of selection.meal.recipe.ingredients) {
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

  const requirements = Array.from(totals.values()).sort(
    (a, b) => b.totalQuantity - a.totalQuantity
  );

  return {
    weekLabel: `${weekStartDate.toLocaleDateString()} – ${weekEndDate.toLocaleDateString()}`,
    requirements,
  };
}
