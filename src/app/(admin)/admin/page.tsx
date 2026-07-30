import { BarChart3 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

const KPI_LABELS = [
  "Active subscribers",
  "New subscriptions",
  "Meals prepared today",
  "Deliveries today",
  "Revenue",
  "Average meal rating",
];

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-muted-foreground text-sm">
          Customers, subscriptions, meals, menus, kitchen and delivery
          management.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {KPI_LABELS.map((label) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState icon={BarChart3} title="No data yet" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
