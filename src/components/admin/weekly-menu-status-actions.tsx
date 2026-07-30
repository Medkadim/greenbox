"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { lockWeeklyMenu, publishWeeklyMenu } from "@/lib/actions/weekly-menu";
import { Button } from "@/components/ui/button";
import type { WeeklyMenuStatus } from "@/generated/prisma/client";

export function WeeklyMenuStatusActions({
  weeklyMenuId,
  status,
}: {
  weeklyMenuId: string;
  status: WeeklyMenuStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(action: (id: string) => Promise<void>, message: string) {
    startTransition(async () => {
      try {
        await action(weeklyMenuId);
        toast.success(message);
        router.refresh();
      } catch {
        toast.error("Could not update the weekly menu.");
      }
    });
  }

  if (status === "DRAFT") {
    return (
      <Button disabled={isPending} onClick={() => run(publishWeeklyMenu, "Menu published.")}>
        Publish
      </Button>
    );
  }

  if (status === "PUBLISHED") {
    return (
      <Button
        variant="outline"
        disabled={isPending}
        onClick={() => run(lockWeeklyMenu, "Menu locked.")}
      >
        Lock
      </Button>
    );
  }

  return null;
}
