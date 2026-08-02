"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { cancelSubscription, renewSubscription } from "@/lib/actions/subscription";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SubscriptionStatus } from "@/generated/prisma/client";

const STATUS_LABEL: Partial<Record<SubscriptionStatus, string>> = {
  PENDING_PAYMENT: "awaiting payment",
};

export function SubscriptionStatusCard({
  subscriptionId,
  planName,
  status,
  remainingMeals,
  endDate,
  hasPendingPayment,
}: {
  subscriptionId: string;
  planName: string;
  status: SubscriptionStatus;
  remainingMeals: number;
  endDate: Date;
  hasPendingPayment: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(action: (id: string) => Promise<void>, successMessage: string) {
    startTransition(async () => {
      try {
        await action(subscriptionId);
        toast.success(successMessage);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not update your subscription."
        );
      }
    });
  }

  const isPendingActivation = status === "PENDING_PAYMENT";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{planName}</p>
          <p className="text-muted-foreground text-sm">
            {isPendingActivation
              ? "Starts once payment is confirmed"
              : `Ends ${endDate.toLocaleDateString()}`}
          </p>
        </div>
        <Badge variant={status === "ACTIVE" ? "default" : "secondary"}>
          {STATUS_LABEL[status] ?? status.toLowerCase()}
        </Badge>
      </div>
      {!isPendingActivation && (
        <p className="text-sm">
          <span className="text-muted-foreground">Remaining meals: </span>
          {remainingMeals}
        </p>
      )}
      {hasPendingPayment && (
        <p className="text-muted-foreground text-sm">
          {isPendingActivation
            ? "Awaiting payment confirmation from GreenBox."
            : "Renewal requested — awaiting payment confirmation."}
        </p>
      )}
      <div className="flex gap-2">
        {!isPendingActivation && (
          <Button
            variant="outline"
            size="sm"
            disabled={isPending || hasPendingPayment}
            onClick={() => run(renewSubscription, "Renewal requested.")}
          >
            Renew
          </Button>
        )}
        <Button
          variant="destructive"
          size="sm"
          disabled={isPending}
          onClick={() => run(cancelSubscription, "Subscription cancelled.")}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
