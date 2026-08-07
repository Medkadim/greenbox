import { z } from "zod";

export const dayOfWeekEnum = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

export const mealSlotEnum = z.enum(["BREAKFAST", "LUNCH", "DINNER"]);

export const setMealSelectionSchema = z.object({
  customerProfileId: z.string().min(1),
  weekStartDate: z.coerce.date(),
  dayOfWeek: dayOfWeekEnum,
  mealSlot: mealSlotEnum,
  mealId: z.string().min(1),
  note: z.string().max(300).optional().or(z.literal("")),
});

export type SetMealSelectionInput = z.infer<typeof setMealSelectionSchema>;

export const clearMealSelectionSchema = z.object({
  customerProfileId: z.string().min(1),
  weekStartDate: z.coerce.date(),
  dayOfWeek: dayOfWeekEnum,
  mealSlot: mealSlotEnum,
});

export type ClearMealSelectionInput = z.infer<typeof clearMealSelectionSchema>;
