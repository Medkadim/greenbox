"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guards";
import { parseInput } from "@/lib/parse-input";
import {
  setScheduleMealSchema,
  clearScheduleMealSchema,
  type SetScheduleMealInput,
  type ClearScheduleMealInput,
} from "@/lib/validations/meal-schedule";

function revalidateScheduleConsumers() {
  revalidatePath("/admin/schedule");
  revalidatePath("/kitchen");
  revalidatePath("/admin/kitchen");
}

export async function setScheduleMeal(
  input: SetScheduleMealInput
): Promise<{ error: string } | void> {
  await requireAdmin();
  const parsed = parseInput(setScheduleMealSchema, input);
  if (!parsed.success) return { error: parsed.error };
  const data = parsed.data;

  await db.mealSchedule.upsert({
    where: {
      dayOfWeek_mealSlot: { dayOfWeek: data.dayOfWeek, mealSlot: data.mealSlot },
    },
    create: { dayOfWeek: data.dayOfWeek, mealSlot: data.mealSlot, mealId: data.mealId },
    update: { mealId: data.mealId },
  });

  revalidateScheduleConsumers();
}

export async function clearScheduleMeal(
  input: ClearScheduleMealInput
): Promise<{ error: string } | void> {
  await requireAdmin();
  const parsed = parseInput(clearScheduleMealSchema, input);
  if (!parsed.success) return { error: parsed.error };
  const data = parsed.data;

  await db.mealSchedule.deleteMany({
    where: { dayOfWeek: data.dayOfWeek, mealSlot: data.mealSlot },
  });

  revalidateScheduleConsumers();
}
