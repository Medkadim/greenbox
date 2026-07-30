"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guards";
import {
  ingredientSchema,
  mealSchema,
  recipeSchema,
  type IngredientInput,
  type MealInput,
  type RecipeInput,
} from "@/lib/validations/meal";

export async function createIngredient(input: IngredientInput) {
  await requireAdmin();
  const data = ingredientSchema.parse(input);

  await db.ingredient.create({ data });

  revalidatePath("/admin/ingredients");
}

export async function createMeal(input: MealInput) {
  await requireAdmin();
  const data = mealSchema.parse(input);

  const meal = await db.meal.create({
    data: {
      name: data.name,
      description: data.description || null,
      photoUrl: data.photoUrl || null,
      category: data.category || null,
      calories: data.calories ?? null,
      protein: data.protein ?? null,
      carbs: data.carbs ?? null,
      fat: data.fat ?? null,
      isActive: data.isActive,
    },
  });

  revalidatePath("/admin/meals");

  return meal.id;
}

export async function updateMeal(mealId: string, input: MealInput) {
  await requireAdmin();
  const data = mealSchema.parse(input);

  await db.meal.update({
    where: { id: mealId },
    data: {
      name: data.name,
      description: data.description || null,
      photoUrl: data.photoUrl || null,
      category: data.category || null,
      calories: data.calories ?? null,
      protein: data.protein ?? null,
      carbs: data.carbs ?? null,
      fat: data.fat ?? null,
      isActive: data.isActive,
    },
  });

  revalidatePath("/admin/meals");
  revalidatePath(`/admin/meals/${mealId}`);
}

export async function toggleMealActive(mealId: string, isActive: boolean) {
  await requireAdmin();

  await db.meal.update({ where: { id: mealId }, data: { isActive } });

  revalidatePath("/admin/meals");
}

export async function upsertRecipe(mealId: string, input: RecipeInput) {
  await requireAdmin();
  const data = recipeSchema.parse(input);

  await db.$transaction(async (tx) => {
    const recipe = await tx.recipe.upsert({
      where: { mealId },
      create: { mealId, instructions: data.instructions || null },
      update: { instructions: data.instructions || null },
    });

    await tx.recipeIngredient.deleteMany({ where: { recipeId: recipe.id } });

    if (data.ingredients.length > 0) {
      await tx.recipeIngredient.createMany({
        data: data.ingredients.map((ingredient) => ({
          recipeId: recipe.id,
          ingredientId: ingredient.ingredientId,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
        })),
      });
    }
  });

  revalidatePath(`/admin/meals/${mealId}`);
}
