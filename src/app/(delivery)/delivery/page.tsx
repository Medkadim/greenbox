import { Truck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DeliveryCard } from "@/components/delivery/delivery-card";
import { GenerateDeliveriesButton } from "@/components/delivery/generate-deliveries-button";
import { getTodayDeliveries } from "@/lib/data/delivery";
import { MEAL_SLOTS, SLOT_LABEL } from "@/lib/weekly-menu-constants";

export default async function DeliveryDashboardPage() {
  const deliveries = await getTodayDeliveries();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Today&apos;s deliveries</h1>
          <p className="text-muted-foreground text-sm">
            Customer address, GPS location, preferred time and delivery
            status.
          </p>
        </div>
        <GenerateDeliveriesButton />
      </div>

      {deliveries.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={Truck}
              title="No deliveries yet"
              description="Click Refresh deliveries to pull in today's active subscribers."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {MEAL_SLOTS.map((slot) => {
            const slotDeliveries = deliveries.filter((d) => d.mealSlot === slot);
            if (slotDeliveries.length === 0) return null;

            return (
              <div key={slot} className="space-y-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">{SLOT_LABEL[slot]}</h2>
                  <Badge variant="secondary">{slotDeliveries.length} deliveries</Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {slotDeliveries.map((delivery) => (
                    <DeliveryCard
                      key={delivery.id}
                      deliveryId={delivery.id}
                      customerName={`${delivery.customerProfile.firstName} ${delivery.customerProfile.lastName}`}
                      phoneNumber={delivery.customerProfile.user.phoneNumber}
                      address={delivery.addressSnapshot}
                      latitude={delivery.latitude}
                      longitude={delivery.longitude}
                      preferredTimeStart={delivery.preferredTimeStart}
                      preferredTimeEnd={delivery.preferredTimeEnd}
                      mealName={delivery.customerMealSelection.menuItem.meal.name}
                      status={delivery.status}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
