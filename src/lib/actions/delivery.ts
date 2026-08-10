"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireDeliveryStaff } from "@/lib/auth-guards";
import { parseInput } from "@/lib/parse-input";
import {
  updateDeliveryStatusSchema,
  type UpdateDeliveryStatusInput,
} from "@/lib/validations/delivery";
import { dayOfWeekFromDate, mondayOf } from "@/lib/weekly-menu-constants";

export async function generateTodayDeliveries() {
  await requireDeliveryStaff();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const dayOfWeek = dayOfWeekFromDate(todayStart);
  const weekStartDate = mondayOf(todayStart);

  const selections = await db.customerMealSelection.findMany({
    where: {
      weekStartDate,
      dayOfWeek,
      customerProfile: { status: "ACTIVE" },
    },
    include: { customerProfile: true },
  });

  for (const selection of selections) {
    const profile = selection.customerProfile;
    await db.delivery.upsert({
      where: { customerMealSelectionId: selection.id },
      create: {
        customerMealSelectionId: selection.id,
        customerProfileId: profile.id,
        scheduledDate: todayStart,
        mealSlot: selection.mealSlot,
        addressSnapshot: profile.address ?? "No address on file",
        latitude: profile.latitude,
        longitude: profile.longitude,
        preferredTimeStart: profile.preferredDeliveryStart,
        preferredTimeEnd: profile.preferredDeliveryEnd,
      },
      update: {},
    });
  }

  revalidatePath("/delivery");
}

export async function updateDeliveryStatus(
  input: UpdateDeliveryStatusInput
): Promise<{ error: string } | void> {
  await requireDeliveryStaff();
  const parsed = parseInput(updateDeliveryStatusSchema, input);
  if (!parsed.success) return { error: parsed.error };
  const data = parsed.data;

  await db.delivery.update({
    where: { id: data.deliveryId },
    data: {
      status: data.status,
      deliveredAt: data.status === "DELIVERED" ? new Date() : undefined,
    },
  });

  revalidatePath("/delivery");
}
