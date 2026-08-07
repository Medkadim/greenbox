"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { adminSetCustomerStatus } from "@/lib/actions/customer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CustomerStatus } from "@/generated/prisma/client";

const STATUS_LABEL: Record<CustomerStatus, string> = {
  ACTIVE: "Active",
  PAUSED: "Paused",
  INACTIVE: "Inactive",
};

export function CustomerStatusSelect({
  customerProfileId,
  status,
}: {
  customerProfileId: string;
  status: CustomerStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onChange(value: string) {
    startTransition(async () => {
      try {
        await adminSetCustomerStatus(customerProfileId, value as CustomerStatus);
        router.refresh();
      } catch {
        toast.error("Could not update status.");
      }
    });
  }

  return (
    <Select value={status} onValueChange={onChange} disabled={isPending}>
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(STATUS_LABEL) as CustomerStatus[]).map((value) => (
          <SelectItem key={value} value={value}>
            {STATUS_LABEL[value]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
