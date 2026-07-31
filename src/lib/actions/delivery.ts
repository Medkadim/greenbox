"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireDeliveryStaff } from "@/lib/auth-guards";
import {
  updateDeliveryStatusSchema,
  type UpdateDeliveryStatusInput,
} from "@/lib/validations/delivery";
import { dayOfWeekFromDate, MEAL_SLOTS } from "@/lib/weekly-menu-constants";

export async function generateTodayDeliveries() {
  await requireDeliveryStaff();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const today = dayOfWeekFromDate(new Date());

  const menu = await db.weeklyMenu.findFirst({
    where: {
      status: { in: ["PUBLISHED", "LOCKED"] },
      weekEndDate: { gte: todayStart },
    },
    orderBy: { weekStartDate: "asc" },
    include: {
      menuItems: {
        where: { dayOfWeek: today, isRecommended: true },
      },
    },
  });
  if (!menu) return;

  const [activeSubscriptions, existingSelections] = await Promise.all([
    db.subscription.findMany({
      where: { status: "ACTIVE" },
      include: { customerProfile: true },
    }),
    db.customerMealSelection.findMany({
      where: { weeklyMenuId: menu.id, menuItem: { dayOfWeek: today } },
      include: { menuItem: true },
    }),
  ]);

  for (const { customerProfile: profile } of activeSubscriptions) {
    for (const slot of MEAL_SLOTS) {
      let selection = existingSelections.find(
        (s) => s.customerProfileId === profile.id && s.menuItem.mealSlot === slot
      );

      if (!selection) {
        const recommendedItem = menu.menuItems.find((mi) => mi.mealSlot === slot);
        if (!recommendedItem) continue;

        selection = await db.customerMealSelection.create({
          data: {
            customerProfileId: profile.id,
            weeklyMenuId: menu.id,
            menuItemId: recommendedItem.id,
            source: "RECOMMENDED",
          },
          include: { menuItem: true },
        });
      }

      await db.delivery.upsert({
        where: { customerMealSelectionId: selection.id },
        create: {
          customerMealSelectionId: selection.id,
          customerProfileId: profile.id,
          scheduledDate: todayStart,
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

export async function updateDeliveryStatus(input: UpdateDeliveryStatusInput) {
  await requireDeliveryStaff();
  const data = updateDeliveryStatusSchema.parse(input);

  await db.delivery.update({
    where: { id: data.deliveryId },
    data: {
      status: data.status,
      deliveredAt: data.status === "DELIVERED" ? new Date() : undefined,
    },
  });

  revalidatePath("/delivery");
}
