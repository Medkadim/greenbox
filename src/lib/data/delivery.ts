import { db } from "@/lib/db";

export function getTodayDeliveries() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  return db.delivery.findMany({
    where: { scheduledDate: { gte: todayStart, lt: todayEnd } },
    include: {
      customerProfile: {
        include: { user: { select: { phoneNumber: true } } },
      },
      customerMealSelection: {
        include: { menuItem: { include: { meal: true } } },
      },
    },
    orderBy: [{ mealSlot: "asc" }, { createdAt: "asc" }],
  });
}
