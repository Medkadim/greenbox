import { z } from "zod";

export const weeklyMenuSchema = z.object({
  weekStartDate: z.string().min(1, "Pick a start date"),
  selectionDeadline: z.string().min(1, "Pick a deadline"),
});

export type WeeklyMenuInput = z.infer<typeof weeklyMenuSchema>;

export const dayOfWeekEnum = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

export const mealSlotEnum = z.enum(["LUNCH", "DINNER"]);

export const setMenuItemSchema = z.object({
  weeklyMenuId: z.string().min(1),
  dayOfWeek: dayOfWeekEnum,
  mealSlot: mealSlotEnum,
  mealId: z.string().min(1),
});

export type SetMenuItemInput = z.infer<typeof setMenuItemSchema>;
