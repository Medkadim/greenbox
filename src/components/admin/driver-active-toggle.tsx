"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { toggleDriverActive } from "@/lib/actions/driver";
import { Switch } from "@/components/ui/switch";

export function DriverActiveToggle({
  driverId,
  isActive,
}: {
  driverId: string;
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
            await toggleDriverActive(driverId, checked);
            router.refresh();
          } catch {
            toast.error("Could not update the driver.");
          }
        })
      }
    />
  );
}
