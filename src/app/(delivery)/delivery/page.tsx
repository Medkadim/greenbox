import Link from "next/link";
import { ChevronLeft, ChevronRight, Truck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DeliveryCard } from "@/components/delivery/delivery-card";
import { DriverFilterSelect } from "@/components/delivery/driver-filter-select";
import { DeliveryDatePicker } from "@/components/delivery/delivery-date-picker";
import { GenerateDeliveriesButton } from "@/components/delivery/generate-deliveries-button";
import { getDeliveriesForDate } from "@/lib/data/delivery";
import { listDrivers, getDriverByUserId } from "@/lib/data/driver";
import { getServerSession, getUserRole } from "@/lib/session";
import {
  MEAL_SLOTS,
  SLOT_LABEL,
  formatDateParam,
  parseDateParam,
} from "@/lib/weekly-menu-constants";

export default async function DeliveryDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ driver?: string; date?: string }>;
}) {
  const session = await getServerSession();
  const isAdmin = getUserRole(session!.user) === "ADMIN";
  const { driver: driverFilter, date } = await searchParams;
  const targetDate = parseDateParam(date);

  const ownDriver = isAdmin ? null : await getDriverByUserId(session!.user.id);

  const [deliveries, drivers] = await Promise.all([
    isAdmin
      ? getDeliveriesForDate(
          targetDate,
          driverFilter === "__unassigned__"
            ? { unassignedOnly: true }
            : driverFilter
              ? { driverId: driverFilter }
              : undefined
        )
      : getDeliveriesForDate(targetDate, { driverId: ownDriver?.id ?? "__none__" }),
    isAdmin ? listDrivers() : Promise.resolve([]),
  ]);
  const driverOptions = drivers.map((d) => ({
    id: d.id,
    name: d.user.name ?? d.user.phoneNumber ?? "Driver",
  }));

  const dayLabel = targetDate.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const prevDate = new Date(targetDate);
  prevDate.setDate(prevDate.getDate() - 1);
  const nextDate = new Date(targetDate);
  nextDate.setDate(nextDate.getDate() + 1);
  const dateQuery = (d: Date) =>
    driverFilter ? `?date=${formatDateParam(d)}&driver=${driverFilter}` : `?date=${formatDateParam(d)}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Deliveries — {dayLabel}</h1>
          <p className="text-muted-foreground text-sm">
            Customer address, phone, GPS location, preferred time and
            delivery status.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={dateQuery(prevDate)}>
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <DeliveryDatePicker date={formatDateParam(targetDate)} />
          <Button asChild variant="outline" size="sm">
            <Link href={dateQuery(nextDate)}>
              <ChevronRight className="size-4" />
            </Link>
          </Button>
          {isAdmin && (
            <DriverFilterSelect value={driverFilter} drivers={driverOptions} />
          )}
          <GenerateDeliveriesButton date={formatDateParam(targetDate)} />
        </div>
      </div>

      {deliveries.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={Truck}
              title="No deliveries"
              description="Click Refresh deliveries to pull in this day's active customers, or try a different driver filter."
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
                      phoneNumber={delivery.customerProfile.phoneNumber}
                      address={delivery.addressSnapshot}
                      latitude={delivery.latitude}
                      longitude={delivery.longitude}
                      preferredTimeStart={delivery.preferredTimeStart}
                      preferredTimeEnd={delivery.preferredTimeEnd}
                      mealName={delivery.customerMealSelection.meal.name}
                      status={delivery.status}
                      driverAssignment={
                        isAdmin
                          ? {
                              drivers: driverOptions,
                              currentDriverId: delivery.driverId,
                            }
                          : undefined
                      }
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
