import { Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getAdminOverviewStats } from "@/lib/data/admin-overview";
import type { DeliveryStatus } from "@/generated/prisma/client";

const STATUS_LABEL: Record<DeliveryStatus, string> = {
  PENDING: "Pending",
  PREPARING: "Preparing",
  READY: "Ready",
  ON_THE_WAY: "On the way",
  DELIVERED: "Delivered",
  FAILED: "Failed",
};

export default async function AdminOverviewPage() {
  const stats = await getAdminOverviewStats();

  const kpis = [
    { label: "Active customers", value: stats.activeCustomers },
    { label: "Meals prepared today", value: stats.mealsToday },
    { label: "Deliveries today", value: stats.deliveriesToday },
  ];

  const statusEntries = Object.entries(stats.deliveryStatusBreakdown) as [
    DeliveryStatus,
    number,
  ][];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-muted-foreground text-sm">
          Customers, meal planning, kitchen and delivery management.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {kpis.map((kpi) => (
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

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Today&apos;s deliveries by status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statusEntries.length === 0 ? (
            <EmptyState icon={Truck} title="No deliveries yet today" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {statusEntries.map(([status, count]) => (
                <Badge key={status} variant="secondary">
                  {STATUS_LABEL[status]}: {count}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
