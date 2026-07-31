import { db } from "@/lib/db";

export async function getNewSubscriptionsTrend(weeks = 8) {
  const rangeStart = new Date();
  rangeStart.setHours(0, 0, 0, 0);
  rangeStart.setDate(rangeStart.getDate() - weeks * 7);

  const subscriptions = await db.subscription.findMany({
    where: { createdAt: { gte: rangeStart } },
    select: { createdAt: true },
  });

  const buckets: { weekStart: string; count: number }[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const count = subscriptions.filter(
      (s) => s.createdAt >= weekStart && s.createdAt < weekEnd
    ).length;
    buckets.push({ weekStart: weekStart.toISOString().slice(0, 10), count });
  }
  return buckets;
}

export async function getAverageMealRating() {
  const agg = await db.rating.aggregate({
    _avg: { score: true },
    _count: { _all: true },
  });
  return { average: agg._avg.score, count: agg._count._all };
}

export async function getMostPopularMeals(limit = 5) {
  const selections = await db.customerMealSelection.findMany({
    select: { menuItem: { select: { mealId: true, meal: { select: { name: true } } } } },
  });

  const counts = new Map<string, { name: string; count: number }>();
  for (const { menuItem } of selections) {
    const existing = counts.get(menuItem.mealId);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(menuItem.mealId, { name: menuItem.meal.name, count: 1 });
    }
  }

  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}
