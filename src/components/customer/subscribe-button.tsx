"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { subscribeToPlan } from "@/lib/actions/subscription";
import { Button } from "@/components/ui/button";

export function SubscribeButton({ planId }: { planId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      className="w-full"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await subscribeToPlan(planId);
          if (result?.error) {
            toast.error(result.error);
            return;
          }
          toast.success("Subscription requested — awaiting payment confirmation.");
          router.refresh();
        })
      }
    >
      Subscribe
    </Button>
  );
}
