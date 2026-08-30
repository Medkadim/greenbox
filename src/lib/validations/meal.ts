import { z } from "zod";

export const ingredientSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  unit: z.string().min(1, "Unit is required").max(20),
});

export type IngredientInput = z.infer<typeof ingredientSchema>;

export const mealSchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  description: z.string().min(1, "Description is required").max(1000),
  photoUrl: z.string().max(500).optional().or(z.literal("")),
  category: z.string().max(60).optional().or(z.literal("")),
  calories: z.coerce.number().int().min(0).max(5000).optional().nullable(),
  protein: z.coerce.number().min(0).max(500).optional().nullable(),
  carbs: z.coerce.number().min(0).max(500).optional().nullable(),
  fat: z.coerce.number().min(0).max(500).optional().nullable(),
  isActive: z.boolean(),
});

export type MealInput = z.infer<typeof mealSchema>;

export const recipeIngredientSchema = z.object({
  ingredientId: z.string().min(1),
  quantity: z.coerce.number().min(0.01).max(10000),
  unit: z.string().min(1).max(20),
});

export const recipeSchema = z.object({
  instructions: z.string().max(4000).optional().or(z.literal("")),
  ingredients: z.array(recipeIngredientSchema),
});

export type RecipeInput = z.infer<typeof recipeSchema>;
