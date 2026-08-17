"use client";

import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "__all__";
const UNASSIGNED = "__unassigned__";

export function DriverFilterSelect({
  value,
  drivers,
}: {
  value: string | undefined;
  drivers: { id: string; name: string }[];
}) {
  const router = useRouter();

  function onChange(next: string) {
    if (next === ALL) {
      router.push("?");
    } else {
      router.push(`?driver=${next}`);
    }
  }

  return (
    <Select value={value ?? ALL} onValueChange={onChange}>
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All drivers</SelectItem>
        <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
        {drivers.map((driver) => (
          <SelectItem key={driver.id} value={driver.id}>
            {driver.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
