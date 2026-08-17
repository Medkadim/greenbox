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

// Most weeks repeat the same plan — this copies last week's meals/notes into
// the target week instead of the admin re-entering them from scratch. Only
// overwrites the cells that exist in last week's plan; anything already set
// for a different day/slot in the target week is left alone.
export async function copyPreviousWeekMealPlan(
  customerProfileId: string,
  weekStartDate: Date
): Promise<{ error: string } | void> {
  await requireAdmin();

  const previousWeekStart = new Date(weekStartDate);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);

  const previousSelections = await db.customerMealSelection.findMany({
    where: { customerProfileId, weekStartDate: previousWeekStart },
  });

  if (previousSelections.length === 0) {
    return { error: "No plan found for the previous week." };
  }

  await db.$transaction(
    previousSelections.map((selection) =>
      db.customerMealSelection.upsert({
        where: {
          customerProfileId_weekStartDate_dayOfWeek_mealSlot: {
            customerProfileId,
            weekStartDate,
            dayOfWeek: selection.dayOfWeek,
            mealSlot: selection.mealSlot,
          },
        },
        create: {
          customerProfileId,
          weekStartDate,
          dayOfWeek: selection.dayOfWeek,
          mealSlot: selection.mealSlot,
          mealId: selection.mealId,
          note: selection.note,
        },
        update: {
          mealId: selection.mealId,
          note: selection.note,
        },
      })
    )
  );

  revalidatePath(`/admin/customers/${customerProfileId}`);
  revalidatePath("/kitchen");
  revalidatePath("/admin/kitchen");
}
