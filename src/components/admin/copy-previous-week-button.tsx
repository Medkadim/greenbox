"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { copyPreviousWeekMealPlan } from "@/lib/actions/meal-selection";
import { Button } from "@/components/ui/button";

export function CopyPreviousWeekButton({
  customerProfileId,
  weekStartDate,
}: {
  customerProfileId: string;
  weekStartDate: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const result = await copyPreviousWeekMealPlan(
        customerProfileId,
        new Date(weekStartDate)
      );
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Copied last week's plan.");
      router.refresh();
    });
  }

  return (
    <Button variant="outline" size="sm" disabled={isPending} onClick={onClick}>
      <Copy className="size-4" />
      Copy last week
    </Button>
  );
}
