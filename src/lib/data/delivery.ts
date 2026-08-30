import { db } from "@/lib/db";

export function getDeliveriesForDate(
  date: Date,
  filter?: { driverId?: string; unassignedOnly?: boolean }
) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  return db.delivery.findMany({
    where: {
      scheduledDate: { gte: dayStart, lt: dayEnd },
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
