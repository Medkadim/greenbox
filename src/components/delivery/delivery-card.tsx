"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Navigation, Phone } from "lucide-react";
import { toast } from "sonner";

import { updateDeliveryStatus } from "@/lib/actions/delivery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DeliveryStatus } from "@/generated/prisma/client";

const STATUS_LABEL: Record<DeliveryStatus, string> = {
  PENDING: "Pending",
  PREPARING: "Preparing",
  READY: "Ready",
  ON_THE_WAY: "On the way",
  DELIVERED: "Delivered",
  FAILED: "Failed",
};

const NEXT_STATUS: Record<DeliveryStatus, DeliveryStatus | null> = {
  PENDING: "PREPARING",
  PREPARING: "READY",
  READY: "ON_THE_WAY",
  ON_THE_WAY: "DELIVERED",
  DELIVERED: null,
  FAILED: null,
};

const STATUS_VARIANT: Record<
  DeliveryStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  PENDING: "outline",
  PREPARING: "secondary",
  READY: "secondary",
  ON_THE_WAY: "default",
  DELIVERED: "default",
  FAILED: "destructive",
};

export function DeliveryCard({
  deliveryId,
  customerName,
  phoneNumber,
  address,
  latitude,
  longitude,
  preferredTimeStart,
  preferredTimeEnd,
  mealName,
  status,
}: {
  deliveryId: string;
  customerName: string;
  phoneNumber: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  preferredTimeStart: string | null;
  preferredTimeEnd: string | null;
  mealName: string;
  status: DeliveryStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const navigationUrl =
    latitude != null && longitude != null
      ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  const nextStatus = NEXT_STATUS[status];

  function setStatus(next: DeliveryStatus) {
    startTransition(async () => {
      try {
        await updateDeliveryStatus({ deliveryId, status: next });
        router.refresh();
      } catch {
        toast.error("Could not update the delivery.");
      }
    });
  }

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium">{customerName}</p>
            <p className="text-muted-foreground text-sm">{mealName}</p>
          </div>
          <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
        </div>

        <div className="text-sm">
          <p>{address}</p>
          {(preferredTimeStart || preferredTimeEnd) && (
            <p className="text-muted-foreground">
              Preferred: {preferredTimeStart ?? "—"} – {preferredTimeEnd ?? "—"}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={navigationUrl} target="_blank" rel="noopener noreferrer">
              <Navigation className="size-4" />
              Open navigation
            </a>
          </Button>
          {phoneNumber && (
            <Button asChild variant="outline" size="sm">
              <a href={`tel:${phoneNumber}`}>
                <Phone className="size-4" />
                Call customer
              </a>
            </Button>
          )}
        </div>

        {nextStatus && (
          <div className="flex gap-2 pt-1">
            <Button size="sm" disabled={isPending} onClick={() => setStatus(nextStatus)}>
              {nextStatus === "DELIVERED"
                ? "Confirm delivery"
                : `Mark as ${STATUS_LABEL[nextStatus]}`}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={() => setStatus("FAILED")}
            >
              Mark failed
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
