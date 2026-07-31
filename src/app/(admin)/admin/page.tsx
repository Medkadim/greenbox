import { BarChart3 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getAdminOverviewStats } from "@/lib/data/admin-overview";

const PLACEHOLDER_KPI_LABELS = [
  "New subscriptions",
  "Average meal rating",
  "Most popular meals",
];

export default async function AdminOverviewPage() {
  const stats = await getAdminOverviewStats();

  const liveKpis = [
    { label: "Active subscribers", value: stats.activeSubscribers },
    { label: "Meals prepared today", value: stats.mealsToday },
    { label: "Deliveries today", value: stats.deliveriesToday },
    { label: "Revenue", value: `${stats.totalRevenue.toFixed(2)} MAD` },
  ];

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
        {PLACEHOLDER_KPI_LABELS.map((label) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={BarChart3}
                title="No data yet"
                description="Available once the analytics module ships."
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
