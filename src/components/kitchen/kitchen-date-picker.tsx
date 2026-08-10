"use client";

import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";

export function KitchenDatePicker({ date }: { date: string }) {
  const router = useRouter();

  return (
    <Input
      type="date"
      value={date}
      onChange={(event) => router.push(`?date=${event.target.value}`)}
      className="w-40"
    />
  );
}
