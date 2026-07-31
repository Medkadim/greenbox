import { db } from "@/lib/db";
import { getDailyProduction } from "@/lib/data/kitchen";

export async function getAdminOverviewStats() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const [activeSubscribers, deliveriesToday, revenueAgg, production] =
    await Promise.all([
      db.subscription.count({ where: { status: "ACTIVE" } }),
      db.delivery.count({
        where: { scheduledDate: { gte: todayStart, lt: todayEnd } },
      }),
      db.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
      getDailyProduction(),
    ]);

  const mealsToday = production
    ? Object.values(production.slots).reduce((sum, s) => sum + s.totalMeals, 0)
    : 0;

  return {
    activeSubscribers,
    mealsToday,
    deliveriesToday,
    totalRevenue: Number(revenueAgg._sum.amount ?? 0),
  };
}
