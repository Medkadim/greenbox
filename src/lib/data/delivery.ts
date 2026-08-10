import { db } from "@/lib/db";

export function getTodayDeliveries(driverId?: string) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  return db.delivery.findMany({
    where: {
      scheduledDate: { gte: todayStart, lt: todayEnd },
      ...(driverId ? { driverId } : {}),
    },
    include: {
      customerProfile: true,
      customerMealSelection: { include: { meal: true } },
    },
    orderBy: [{ mealSlot: "asc" }, { createdAt: "asc" }],
  });
}
