"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guards";
import {
  setMealSelectionSchema,
  clearMealSelectionSchema,
  type SetMealSelectionInput,
  type ClearMealSelectionInput,
} from "@/lib/validations/meal-selection";

export async function setCustomerMealSelection(input: SetMealSelectionInput) {
  await requireAdmin();
  const data = setMealSelectionSchema.parse(input);

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

export async function clearCustomerMealSelection(input: ClearMealSelectionInput) {
  await requireAdmin();
  const data = clearMealSelectionSchema.parse(input);

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
