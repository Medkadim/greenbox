"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { confirmWeekSelections } from "@/lib/actions/menu-selection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ConfirmWeekButton({
  weeklyMenuId,
  hasSelections,
  allConfirmed,
  disabled,
}: {
  weeklyMenuId: string;
  hasSelections: boolean;
  allConfirmed: boolean;
  disabled: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (allConfirmed) {
    return <Badge>Week confirmed</Badge>;
  }

  return (
    <Button
      disabled={disabled || !hasSelections || isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await confirmWeekSelections(weeklyMenuId);
          if (result?.error) {
            toast.error(result.error);
            return;
          }
          toast.success("Your week is confirmed.");
          router.refresh();
        })
      }
    >
      Confirm my week
    </Button>
  );
}
