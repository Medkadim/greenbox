"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { setScheduleMeal, clearScheduleMeal } from "@/lib/actions/meal-schedule";
import { DAYS_OF_WEEK, DAY_LABEL, MEAL_SLOTS, SLOT_LABEL } from "@/lib/weekly-menu-constants";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DayOfWeek, MealSlot } from "@/generated/prisma/client";

const NONE = "__none__";

type ScheduleCell = { dayOfWeek: DayOfWeek; mealSlot: MealSlot; mealId: string };

export function MealScheduleGrid({
  schedule,
  meals,
}: {
  schedule: ScheduleCell[];
  meals: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function find(day: DayOfWeek, slot: MealSlot) {
    return schedule.find((s) => s.dayOfWeek === day && s.mealSlot === slot);
  }

  function onChange(day: DayOfWeek, slot: MealSlot, mealId: string) {
    startTransition(async () => {
      try {
        const result =
          mealId === NONE
            ? await clearScheduleMeal({ dayOfWeek: day, mealSlot: slot })
            : await setScheduleMeal({ dayOfWeek: day, mealSlot: slot, mealId });
        if (result?.error) {
          toast.error(result.error);
          return;
        }
        router.refresh();
      } catch {
        toast.error("Could not update the schedule.");
      }
    });
  }

  return (
    <div className="space-y-3">
      {DAYS_OF_WEEK.map((day) => (
        <Card key={day}>
          <CardContent className="space-y-3 pt-6">
            <p className="font-medium">{DAY_LABEL[day]}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {MEAL_SLOTS.map((slot) => {
                const current = find(day, slot);
                return (
                  <div key={slot} className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs">
                      {SLOT_LABEL[slot]}
                    </Label>
                    <Select
                      value={current?.mealId ?? NONE}
                      onValueChange={(value) => onChange(day, slot, value)}
                      disabled={isPending}
                    >
                      <SelectTrigger className="h-8 w-full text-xs">
                        <SelectValue placeholder="No meal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>No meal</SelectItem>
                        {meals.map((meal) => (
                          <SelectItem key={meal.id} value={meal.id}>
                            {meal.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
