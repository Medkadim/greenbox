"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { toggleMealActive } from "@/lib/actions/meal";
import { Switch } from "@/components/ui/switch";

export function MealActiveToggle({
  mealId,
  isActive,
}: {
  mealId: string;
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
            await toggleMealActive(mealId, checked);
            router.refresh();
          } catch {
            toast.error("Could not update the meal.");
          }
        })
      }
    />
  );
}
