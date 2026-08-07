import { db } from "@/lib/db";
import { getDailyProduction } from "@/lib/data/kitchen";

export async function getAdminOverviewStats() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const [activeCustomers, deliveriesToday, deliveryStatusGroups, production] =
    await Promise.all([
      db.customerProfile.count({ where: { status: "ACTIVE" } }),
      db.delivery.count({
        where: { scheduledDate: { gte: todayStart, lt: todayEnd } },
      }),
      db.delivery.groupBy({
        by: ["status"],
        where: { scheduledDate: { gte: todayStart, lt: todayEnd } },
        _count: { _all: true },
      }),
      getDailyProduction(),
    ]);

  const mealsToday = Object.values(production.slots).reduce(
    (sum, s) => sum + s.totalMeals,
    0
  );

  const deliveryStatusBreakdown = Object.fromEntries(
    deliveryStatusGroups.map((g) => [g.status, g._count._all])
  );

  return { activeCustomers, mealsToday, deliveriesToday, deliveryStatusBreakdown };
}
