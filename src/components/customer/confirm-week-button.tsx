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
          try {
            await confirmWeekSelections(weeklyMenuId);
            toast.success("Your week is confirmed.");
            router.refresh();
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Could not confirm."
            );
          }
        })
      }
    >
      Confirm my week
    </Button>
  );
}
