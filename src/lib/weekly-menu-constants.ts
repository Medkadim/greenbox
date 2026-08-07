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

export const MEAL_SLOTS: MealSlot[] = ["BREAKFAST", "LUNCH", "DINNER"];

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
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
};

// JS Date#getDay(): 0 = Sunday ... 6 = Saturday
export function dayOfWeekFromDate(date: Date): DayOfWeek {
  const jsDay = date.getDay();
  return DAYS_OF_WEEK[(jsDay + 6) % 7];
}

// Monday of the week containing `date`, normalized to local midnight — the
// key CustomerMealSelection.weekStartDate is stored under.
export function mondayOf(date: Date): Date {
  const jsDay = date.getDay();
  const diff = (jsDay + 6) % 7; // days since Monday
  const monday = new Date(date);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - diff);
  return monday;
}
