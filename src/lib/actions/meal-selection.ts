"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guards";
import { parseInput } from "@/lib/parse-input";
import {
  setMealSelectionSchema,
  clearMealSelectionSchema,
  type SetMealSelectionInput,
  type ClearMealSelectionInput,
} from "@/lib/validations/meal-selection";

export async function setCustomerMealSelection(
  input: SetMealSelectionInput
): Promise<{ error: string } | void> {
  await requireAdmin();
  const parsed = parseInput(setMealSelectionSchema, input);
  if (!parsed.success) return { error: parsed.error };
  const data = parsed.data;

  await db.customerMealSelection.upsert({
    where: {
      customerProfileId_weekStartDate_dayOfWeek_mealSlot: {
        customerProfileId: data.customerProfileId,
        weekStartDate: data.weekStartDate,
        dayOfWeek: data.dayOfWeek,
        mealSlot: data.mealSlot,
      },
    },
    create: {
      customerProfileId: data.customerProfileId,
      weekStartDate: data.weekStartDate,
      dayOfWeek: data.dayOfWeek,
      mealSlot: data.mealSlot,
      mealId: data.mealId,
      note: data.note || null,
    },
    update: {
      mealId: data.mealId,
      note: data.note || null,
    },
  });

  revalidatePath(`/admin/customers/${data.customerProfileId}`);
  revalidatePath("/kitchen");
  revalidatePath("/admin/kitchen");
}

export async function clearCustomerMealSelection(
  input: ClearMealSelectionInput
): Promise<{ error: string } | void> {
  await requireAdmin();
  const parsed = parseInput(clearMealSelectionSchema, input);
  if (!parsed.success) return { error: parsed.error };
  const data = parsed.data;

  await db.customerMealSelection.deleteMany({
    where: {
      customerProfileId: data.customerProfileId,
      weekStartDate: data.weekStartDate,
      dayOfWeek: data.dayOfWeek,
      mealSlot: data.mealSlot,
    },
  });

  revalidatePath(`/admin/customers/${data.customerProfileId}`);
  revalidatePath("/kitchen");
  revalidatePath("/admin/kitchen");
}
