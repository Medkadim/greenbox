"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireDeliveryStaff } from "@/lib/auth-guards";
import { createNotification } from "@/lib/notifications";
import {
  updateDeliveryStatusSchema,
  type UpdateDeliveryStatusInput,
} from "@/lib/validations/delivery";
import { dayOfWeekFromDate, MEAL_SLOTS } from "@/lib/weekly-menu-constants";

const STATUS_MESSAGE: Partial<Record<UpdateDeliveryStatusInput["status"], string>> = {
  PREPARING: "Your meal is being prepared.",
  READY: "Your meal is ready and will be on its way shortly.",
  ON_THE_WAY: "Your delivery is on its way.",
};

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

  const delivery = await db.delivery.update({
    where: { id: data.deliveryId },
    data: {
      status: data.status,
      deliveredAt: data.status === "DELIVERED" ? new Date() : undefined,
    },
    include: { customerProfile: { select: { userId: true } } },
  });

  const userId = delivery.customerProfile.userId;
  const statusMessage = STATUS_MESSAGE[data.status];
  if (statusMessage) {
    await createNotification({
      userId,
      type: "DELIVERY_UPDATE",
      title: "Delivery update",
      body: statusMessage,
    });
  }
  if (data.status === "DELIVERED") {
    await createNotification({
      userId,
      type: "ENJOY_YOUR_MEAL",
      title: "Enjoy your meal!",
      body: "Your GreenBox meal has been delivered.",
    });
    await createNotification({
      userId,
      type: "RATING_REQUEST",
      title: "How was it?",
      body: "Let us know what you thought of today's meal.",
    });
  }

  revalidatePath("/delivery");
}
