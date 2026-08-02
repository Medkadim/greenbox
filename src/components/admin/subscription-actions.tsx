"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  cancelSubscription,
  confirmSubscriptionPayment,
  pauseSubscription,
  renewSubscription,
  resumeSubscription,
} from "@/lib/actions/subscription";
import { Button } from "@/components/ui/button";
import type { SubscriptionStatus } from "@/generated/prisma/client";

export function SubscriptionActions({
  subscriptionId,
  status,
  pendingPaymentId,
}: {
  subscriptionId: string;
  status: SubscriptionStatus;
  pendingPaymentId?: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(action: (id: string) => Promise<void>, id: string) {
    startTransition(async () => {
      try {
        await action(id);
        router.refresh();
      } catch {
        toast.error("Could not update the subscription.");
      }
    });
  }

  if (pendingPaymentId) {
    return (
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => run(confirmSubscriptionPayment, pendingPaymentId)}
        >
          Confirm payment
        </Button>
        {status === "PENDING_PAYMENT" && (
          <Button
            size="sm"
            variant="destructive"
            disabled={isPending}
            onClick={() => run(cancelSubscription, subscriptionId)}
          >
            Cancel
          </Button>
        )}
      </div>
    );
  }

  if (status === "ACTIVE") {
    return (
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => run(renewSubscription, subscriptionId)}>
          Renew
        </Button>
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => run(pauseSubscription, subscriptionId)}>
          Pause
        </Button>
        <Button size="sm" variant="destructive" disabled={isPending} onClick={() => run(cancelSubscription, subscriptionId)}>
          Cancel
        </Button>
      </div>
    );
  }

  if (status === "PAUSED") {
    return (
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => run(resumeSubscription, subscriptionId)}>
          Resume
        </Button>
        <Button size="sm" variant="destructive" disabled={isPending} onClick={() => run(cancelSubscription, subscriptionId)}>
          Cancel
        </Button>
      </div>
    );
  }

  return null;
}
