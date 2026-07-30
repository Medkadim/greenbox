import { z } from "zod";

import { dayOfWeekEnum, mealSlotEnum } from "@/lib/validations/weekly-menu";

export const selectMealSchema = z.object({
  weeklyMenuId: z.string().min(1),
  dayOfWeek: dayOfWeekEnum,
  mealSlot: mealSlotEnum,
  mealId: z.string().min(1),
});

export type SelectMealInput = z.infer<typeof selectMealSchema>;

export const mealRequestSchema = z.object({
  customerMealSelectionId: z.string().min(1),
  note: z.string().min(1, "Describe the request").max(200),
});

export type MealRequestInput = z.infer<typeof mealRequestSchema>;
