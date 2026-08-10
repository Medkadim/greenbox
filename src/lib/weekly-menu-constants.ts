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

// "YYYY-MM-DD" <-> Date, for ?date= query params (local time, not UTC).
export function formatDateParam(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateParam(value: string | undefined): Date {
  if (!value) return new Date();
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return new Date();
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}
