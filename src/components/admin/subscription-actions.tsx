"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  cancelSubscription,
  pauseSubscription,
  renewSubscription,
  resumeSubscription,
} from "@/lib/actions/subscription";
import { Button } from "@/components/ui/button";
import type { SubscriptionStatus } from "@/generated/prisma/client";

export function SubscriptionActions({
  subscriptionId,
  status,
}: {
  subscriptionId: string;
  status: SubscriptionStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(action: (id: string) => Promise<void>) {
    startTransition(async () => {
      try {
        await action(subscriptionId);
        router.refresh();
      } catch {
        toast.error("Could not update the subscription.");
      }
    });
  }

  if (status === "ACTIVE") {
    return (
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => run(renewSubscription)}>
          Renew
        </Button>
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => run(pauseSubscription)}>
          Pause
        </Button>
        <Button size="sm" variant="destructive" disabled={isPending} onClick={() => run(cancelSubscription)}>
          Cancel
        </Button>
      </div>
    );
  }

  if (status === "PAUSED") {
    return (
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => run(resumeSubscription)}>
          Resume
        </Button>
        <Button size="sm" variant="destructive" disabled={isPending} onClick={() => run(cancelSubscription)}>
          Cancel
        </Button>
      </div>
    );
  }

  return null;
}
