import { BarChart3, Star, Utensils } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getAdminOverviewStats } from "@/lib/data/admin-overview";
import {
  getAverageMealRating,
  getMostPopularMeals,
  getNewSubscriptionsTrend,
} from "@/lib/data/analytics";

export default async function AdminOverviewPage() {
  const [stats, trend, avgRating, popularMeals] = await Promise.all([
    getAdminOverviewStats(),
    getNewSubscriptionsTrend(),
    getAverageMealRating(),
    getMostPopularMeals(),
  ]);

  const liveKpis = [
    { label: "Active subscribers", value: stats.activeSubscribers },
    { label: "Meals prepared today", value: stats.mealsToday },
    { label: "Deliveries today", value: stats.deliveriesToday },
    { label: "Revenue", value: `${stats.totalRevenue.toFixed(2)} MAD` },
  ];

  const maxTrendCount = Math.max(1, ...trend.map((week) => week.count));
  const newSubscriptionsTotal = trend.reduce((sum, week) => sum + week.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-muted-foreground text-sm">
          Customers, subscriptions, meals, menus, kitchen and delivery
          management.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {liveKpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              New subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {newSubscriptionsTotal === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No new subscriptions yet"
                description="Last 8 weeks."
              />
            ) : (
              <div className="space-y-2">
                <p className="text-2xl font-semibold">{newSubscriptionsTotal}</p>
                <p className="text-muted-foreground text-xs">Last 8 weeks</p>
                <div className="flex h-20 gap-1.5">
                  {trend.map((week) => (
                    <div
                      key={week.weekStart}
                      className="flex h-full flex-1 flex-col items-center justify-end"
                      title={`Week of ${week.weekStart}: ${week.count}`}
                    >
                      <div
                        className="bg-primary w-full rounded-t"
                        style={{
                          height: `${Math.max(4, (week.count / maxTrendCount) * 100)}%`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Average meal rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            {avgRating.count === 0 ? (
              <EmptyState icon={Star} title="No ratings yet" />
            ) : (
              <div className="space-y-2">
                <p className="text-2xl font-semibold">
                  {avgRating.average!.toFixed(1)}
                  <span className="text-muted-foreground text-base font-normal">
                    {" "}
                    / 5
                  </span>
                </p>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      className={
                        value <= Math.round(avgRating.average!)
                          ? "fill-primary text-primary size-4"
                          : "text-muted-foreground size-4"
                      }
                    />
                  ))}
                </div>
                <p className="text-muted-foreground text-xs">
                  Based on {avgRating.count} rating
                  {avgRating.count === 1 ? "" : "s"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Most popular meals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {popularMeals.length === 0 ? (
              <EmptyState icon={Utensils} title="No meals selected yet" />
            ) : (
              <ol className="space-y-2">
                {popularMeals.map((meal, index) => (
                  <li
                    key={meal.name}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span>
                      <span className="text-muted-foreground mr-2">
                        {index + 1}.
                      </span>
                      {meal.name}
                    </span>
                    <Badge variant="secondary">{meal.count}</Badge>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
