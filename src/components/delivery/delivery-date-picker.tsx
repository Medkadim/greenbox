"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";

export function DeliveryDatePicker({ date }: { date: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", value);
    router.push(`?${params.toString()}`);
  }

  return (
    <Input
      type="date"
      value={date}
      onChange={(event) => onChange(event.target.value)}
      className="w-40"
    />
  );
}
