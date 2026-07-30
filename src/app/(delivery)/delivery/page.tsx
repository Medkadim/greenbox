import { Truck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function DeliveryDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Today&apos;s deliveries</h1>
        <p className="text-muted-foreground text-sm">
          Customer address, GPS location, preferred time and delivery status.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery route</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Truck}
            title="No deliveries assigned yet"
            description="Available once the delivery dashboard module ships."
          />
        </CardContent>
      </Card>
    </div>
  );
}
