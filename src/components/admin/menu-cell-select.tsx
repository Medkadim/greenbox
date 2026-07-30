"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { removeMenuItem, setMenuItem } from "@/lib/actions/weekly-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DayOfWeek, MealSlot } from "@/generated/prisma/client";

const NONE = "__none__";

export function MenuCellSelect({
  weeklyMenuId,
  dayOfWeek,
  mealSlot,
  currentMenuItemId,
  currentMealId,
  meals,
  disabled,
}: {
  weeklyMenuId: string;
  dayOfWeek: DayOfWeek;
  mealSlot: MealSlot;
  currentMenuItemId?: string;
  currentMealId?: string;
  meals: { id: string; name: string }[];
  disabled?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onChange(value: string) {
    startTransition(async () => {
      try {
        if (value === NONE) {
          if (currentMenuItemId) {
            await removeMenuItem(currentMenuItemId, weeklyMenuId);
          }
        } else {
          await setMenuItem({ weeklyMenuId, dayOfWeek, mealSlot, mealId: value });
        }
        router.refresh();
      } catch {
        toast.error("Could not update the menu.");
      }
    });
  }

  return (
    <Select
      value={currentMealId ?? NONE}
      onValueChange={onChange}
      disabled={isPending || disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>— none —</SelectItem>
        {meals.map((meal) => (
          <SelectItem key={meal.id} value={meal.id}>
            {meal.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
