"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { generateTodayDeliveries } from "@/lib/actions/delivery";
import { Button } from "@/components/ui/button";

export function GenerateDeliveriesButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          try {
            await generateTodayDeliveries();
            router.refresh();
          } catch {
            toast.error("Could not refresh deliveries.");
          }
        })
      }
    >
      <RefreshCw className="size-4" />
      Refresh deliveries
    </Button>
  );
}
