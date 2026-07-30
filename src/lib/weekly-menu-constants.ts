import type { DayOfWeek, MealSlot } from "@/generated/prisma/client";

export const DAYS_OF_WEEK: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export const MEAL_SLOTS: MealSlot[] = ["LUNCH", "DINNER"];

export const DAY_LABEL: Record<DayOfWeek, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export const SLOT_LABEL: Record<MealSlot, string> = {
  LUNCH: "Lunch",
  DINNER: "Dinner",
};

// JS Date#getDay(): 0 = Sunday ... 6 = Saturday
export function dayOfWeekFromDate(date: Date): DayOfWeek {
  const jsDay = date.getDay();
  return DAYS_OF_WEEK[(jsDay + 6) % 7];
}
