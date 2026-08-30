import { z } from "zod";

import { dayOfWeekEnum, mealSlotEnum } from "@/lib/validations/meal-selection";

export const setScheduleMealSchema = z.object({
  dayOfWeek: dayOfWeekEnum,
  mealSlot: mealSlotEnum,
  mealId: z.string().min(1),
});

export type SetScheduleMealInput = z.infer<typeof setScheduleMealSchema>;

export const clearScheduleMealSchema = z.object({
  dayOfWeek: dayOfWeekEnum,
  mealSlot: mealSlotEnum,
});

export type ClearScheduleMealInput = z.infer<typeof clearScheduleMealSchema>;
