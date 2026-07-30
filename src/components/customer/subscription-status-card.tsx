"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { cancelSubscription, renewSubscription } from "@/lib/actions/subscription";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SubscriptionStatus } from "@/generated/prisma/client";

export function SubscriptionStatusCard({
  subscriptionId,
  planName,
  status,
  remainingMeals,
  endDate,
}: {
  subscriptionId: string;
  planName: string;
  status: SubscriptionStatus;
  remainingMeals: number;
  endDate: Date;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(action: (id: string) => Promise<void>, successMessage: string) {
    startTransition(async () => {
      try {
        await action(subscriptionId);
        toast.success(successMessage);
        router.refresh();
      } catch {
        toast.error("Could not update your subscription.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{planName}</p>
          <p className="text-muted-foreground text-sm">
            Ends {endDate.toLocaleDateString()}
          </p>
        </div>
        <Badge variant={status === "ACTIVE" ? "default" : "secondary"}>
          {status.toLowerCase()}
        </Badge>
      </div>
      <p className="text-sm">
        <span className="text-muted-foreground">Remaining meals: </span>
        {remainingMeals}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => run(renewSubscription, "Subscription renewed.")}
        >
          Renew
        </Button>
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
