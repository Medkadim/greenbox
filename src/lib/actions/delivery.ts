"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireDeliveryStaff } from "@/lib/auth-guards";
import { parseInput } from "@/lib/parse-input";
import { getMealSchedule, findScheduledMeal } from "@/lib/data/meal-schedule";
import {
  updateDeliveryStatusSchema,
  type UpdateDeliveryStatusInput,
} from "@/lib/validations/delivery";
import { dayOfWeekFromDate, mondayOf, MEAL_SLOTS } from "@/lib/weekly-menu-constants";

export async function generateDeliveriesForDate(date: Date) {
  await requireDeliveryStaff();

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayOfWeek = dayOfWeekFromDate(dayStart);
  const weekStartDate = mondayOf(dayStart);

  const [selections, activeCustomers, schedule] = await Promise.all([
    db.customerMealSelection.findMany({
      where: { weekStartDate, dayOfWeek, customerProfile: { status: "ACTIVE" } },
      include: { customerProfile: true },
    }),
    db.customerProfile.findMany({ where: { status: "ACTIVE" } }),
    getMealSchedule(),
  ]);

  for (const slot of MEAL_SLOTS) {
    const selectionByCustomer = new Map(
      selections.filter((s) => s.mealSlot === slot).map((s) => [s.customerProfileId, s])
    );
    const scheduled = findScheduledMeal(schedule, dayOfWeek, slot);

    for (const profile of activeCustomers) {
      let selection = selectionByCustomer.get(profile.id);

      // No explicit choice for this customer/day/slot — fall back to the
      // default schedule, materializing a selection row so the Delivery
      // below has something to point its required FK at.
      if (!selection && scheduled) {
        selection = await db.customerMealSelection.upsert({
          where: {
            customerProfileId_weekStartDate_dayOfWeek_mealSlot: {
              customerProfileId: profile.id,
              weekStartDate,
              dayOfWeek,
              mealSlot: slot,
            },
          },
          create: {
            customerProfileId: profile.id,
            weekStartDate,
            dayOfWeek,
            mealSlot: slot,
            mealId: scheduled.mealId,
          },
          update: {},
          include: { customerProfile: true },
        });
      }
      if (!selection) continue;

      await db.delivery.upsert({
        where: { customerMealSelectionId: selection.id },
        create: {
          customerMealSelectionId: selection.id,
          customerProfileId: profile.id,
          scheduledDate: dayStart,
          mealSlot: slot,
          addressSnapshot: profile.address ?? "No address on file",
          latitude: profile.latitude,
          longitude: profile.longitude,
          preferredTimeStart: profile.preferredDeliveryStart,
          preferredTimeEnd: profile.preferredDeliveryEnd,
        },
        update: {},
      });
    }
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
