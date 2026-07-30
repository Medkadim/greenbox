"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { toggleCustomerTag } from "@/lib/actions/customer";
import { Badge } from "@/components/ui/badge";
import type { CustomerTagType } from "@/generated/prisma/client";

const ALL_TAGS: CustomerTagType[] = [
  "NEW_CUSTOMER",
  "VIP",
  "ALLERGY_ALERT",
  "VEGETARIAN",
  "VEGAN",
  "HIGH_PROTEIN",
  "WEIGHT_LOSS",
];

export function CustomerTagsManager({
  customerProfileId,
  activeTags,
}: {
  customerProfileId: string;
  activeTags: CustomerTagType[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle(tag: CustomerTagType, enabled: boolean) {
    startTransition(async () => {
      try {
        await toggleCustomerTag(customerProfileId, tag, enabled);
        router.refresh();
      } catch {
        toast.error("Could not update tag.");
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ALL_TAGS.map((tag) => {
        const active = activeTags.includes(tag);
        return (
          <Badge
            key={tag}
            variant={active ? "default" : "outline"}
            className="cursor-pointer select-none"
            aria-pressed={active}
            onClick={() => !isPending && toggle(tag, !active)}
          >
            {tag.replaceAll("_", " ").toLowerCase()}
          </Badge>
        );
      })}
    </div>
  );
}
