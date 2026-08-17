import { db } from "@/lib/db";

export function getTodayDeliveries(filter?: { driverId?: string; unassignedOnly?: boolean }) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  return db.delivery.findMany({
    where: {
      scheduledDate: { gte: todayStart, lt: todayEnd },
      ...(filter?.driverId ? { driverId: filter.driverId } : {}),
      ...(filter?.unassignedOnly ? { driverId: null } : {}),
    },
    include: {
      customerProfile: true,
      customerMealSelection: { include: { meal: true } },
    },
    orderBy: [
      { mealSlot: "asc" },
      { preferredTimeStart: { sort: "asc", nulls: "last" } },
      { createdAt: "asc" },
    ],
  });
}
