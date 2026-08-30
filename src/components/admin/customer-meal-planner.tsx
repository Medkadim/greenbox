"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  setCustomerMealSelection,
  clearCustomerMealSelection,
} from "@/lib/actions/meal-selection";
import { DAYS_OF_WEEK, DAY_LABEL, MEAL_SLOTS, SLOT_LABEL } from "@/lib/weekly-menu-constants";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

type Selection = {
  dayOfWeek: DayOfWeek;
  mealSlot: MealSlot;
  mealId: string;
  note: string | null;
};

type ScheduleDefault = {
  dayOfWeek: DayOfWeek;
  mealSlot: MealSlot;
  mealName: string;
};

export function CustomerMealPlanner({
  customerProfileId,
  weekStartDate,
  meals,
  selections,
  schedule = [],
}: {
  customerProfileId: string;
  weekStartDate: string;
  meals: { id: string; name: string }[];
  selections: Selection[];
  schedule?: ScheduleDefault[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const weekStartDateValue = new Date(weekStartDate);
  const [notes, setNotes] = useState<Record<string, string>>(
    Object.fromEntries(
      selections.map((s) => [`${s.dayOfWeek}-${s.mealSlot}`, s.note ?? ""])
    )
  );

  function find(day: DayOfWeek, slot: MealSlot) {
    return selections.find((s) => s.dayOfWeek === day && s.mealSlot === slot);
  }

  function findDefault(day: DayOfWeek, slot: MealSlot) {
    return schedule.find((s) => s.dayOfWeek === day && s.mealSlot === slot);
  }

  function onMealChange(day: DayOfWeek, slot: MealSlot, mealId: string) {
    const key = `${day}-${slot}`;
    startTransition(async () => {
      try {
        const result =
          mealId === NONE
            ? await clearCustomerMealSelection({
                customerProfileId,
                weekStartDate: weekStartDateValue,
                dayOfWeek: day,
                mealSlot: slot,
              })
            : await setCustomerMealSelection({
                customerProfileId,
                weekStartDate: weekStartDateValue,
                dayOfWeek: day,
                mealSlot: slot,
                mealId,
                note: notes[key] ?? "",
              });
        if (result?.error) {
          toast.error(result.error);
          return;
        }
        router.refresh();
      } catch {
        toast.error("Could not update the meal plan.");
      }
    });
  }

  function onNoteBlur(day: DayOfWeek, slot: MealSlot) {
    const existing = find(day, slot);
    if (!existing) return;
    const key = `${day}-${slot}`;
    const note = notes[key] ?? "";
    if (note === (existing.note ?? "")) return;

    startTransition(async () => {
      try {
        const result = await setCustomerMealSelection({
          customerProfileId,
          weekStartDate: weekStartDateValue,
          dayOfWeek: day,
          mealSlot: slot,
          mealId: existing.mealId,
          note,
        });
        if (result?.error) {
          toast.error(result.error);
          return;
        }
        router.refresh();
      } catch {
        toast.error("Could not save the remark.");
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
                const scheduleDefault = !current ? findDefault(day, slot) : undefined;
                const key = `${day}-${slot}`;
                return (
                  <div key={slot} className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs">
                      {SLOT_LABEL[slot]}
                    </Label>
                    <Select
                      value={current?.mealId ?? NONE}
                      onValueChange={(value) => onMealChange(day, slot, value)}
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
                    {scheduleDefault && (
                      <p className="text-muted-foreground text-xs">
                        Default: {scheduleDefault.mealName}
                      </p>
                    )}
                    {current && (
                      <Input
                        className="h-8 text-xs"
                        placeholder="Remark (e.g. no onions)"
                        value={notes[key] ?? ""}
                        onChange={(event) =>
                          setNotes((prev) => ({ ...prev, [key]: event.target.value }))
                        }
                        onBlur={() => onNoteBlur(day, slot)}
                        disabled={isPending}
                      />
                    )}
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
