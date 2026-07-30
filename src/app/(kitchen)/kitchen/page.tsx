import { ChefHat } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function KitchenDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Daily production</h1>
        <p className="text-muted-foreground text-sm">
          Portions to prepare today, per meal, with customer requests and
          allergy alerts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s production</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={ChefHat}
            title="No production planned yet"
            description="Available once the kitchen dashboard module ships."
          />
        </CardContent>
      </Card>
    </div>
  );
}
