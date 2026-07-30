"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { toggleSubscriptionPlanActive } from "@/lib/actions/subscription";
import { Switch } from "@/components/ui/switch";

export function PlanActiveToggle({
  planId,
  isActive,
}: {
  planId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      checked={isActive}
      disabled={isPending}
      onCheckedChange={(checked) =>
        startTransition(async () => {
          try {
            await toggleSubscriptionPlanActive(planId, checked);
            router.refresh();
          } catch {
            toast.error("Could not update the plan.");
          }
        })
      }
    />
  );
}
