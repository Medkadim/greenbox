import { db } from "@/lib/db";
import type { DayOfWeek, MealSlot, Prisma } from "@/generated/prisma/client";

const scheduleWithMeal = {
  include: {
    meal: {
      include: {
        recipe: { include: { ingredients: { include: { ingredient: true } } } },
      },
    },
  },
} satisfies Prisma.MealScheduleDefaultArgs;

export type ScheduleEntry = Prisma.MealScheduleGetPayload<typeof scheduleWithMeal>;

export function getMealSchedule(): Promise<ScheduleEntry[]> {
  return db.mealSchedule.findMany(scheduleWithMeal);
}

export function findScheduledMeal(
  schedule: ScheduleEntry[],
  dayOfWeek: DayOfWeek,
  mealSlot: MealSlot
): ScheduleEntry | null {
  return schedule.find((s) => s.dayOfWeek === dayOfWeek && s.mealSlot === mealSlot) ?? null;
}
