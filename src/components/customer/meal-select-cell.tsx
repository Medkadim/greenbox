"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { selectMeal } from "@/lib/actions/menu-selection";
import { MealRequestManager } from "@/components/customer/meal-request-manager";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DayOfWeek, MealSlot } from "@/generated/prisma/client";

type Meal = { id: string; name: string };
type Selection = {
  id: string;
  source: "RECOMMENDED" | "CUSTOM";
  menuItem: { meal: Meal };
};
type Request = { id: string; note: string };

export function MealSelectCell({
  weeklyMenuId,
  dayOfWeek,
  mealSlot,
  recommendedMeal,
  otherActiveMeals,
  currentSelection,
  requests,
  disabled,
}: {
  weeklyMenuId: string;
  dayOfWeek: DayOfWeek;
  mealSlot: MealSlot;
  recommendedMeal: Meal | null;
  otherActiveMeals: Meal[];
  currentSelection: Selection | null;
  requests: Request[];
  disabled: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const currentMealId = currentSelection?.menuItem.meal.id ?? recommendedMeal?.id;

  function onChange(mealId: string) {
    startTransition(async () => {
      const result = await selectMeal({ weeklyMenuId, dayOfWeek, mealSlot, mealId });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  if (!recommendedMeal && otherActiveMeals.length === 0) {
    return <p className="text-muted-foreground text-sm">No meals available.</p>;
  }

  return (
    <div className="space-y-1">
      <Select value={currentMealId} onValueChange={onChange} disabled={isPending || disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose a meal" />
        </SelectTrigger>
        <SelectContent>
          {recommendedMeal && (
            <SelectItem value={recommendedMeal.id}>
              Recommended: {recommendedMeal.name}
            </SelectItem>
          )}
          {otherActiveMeals.map((meal) => (
            <SelectItem key={meal.id} value={meal.id}>
              {meal.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {currentSelection && (
        <>
          {currentSelection.source === "CUSTOM" && (
            <Badge variant="outline" className="text-xs">
              Your choice
            </Badge>
          )}
          <MealRequestManager
            customerMealSelectionId={currentSelection.id}
            requests={requests}
            disabled={disabled}
          />
        </>
      )}
    </div>
  );
}
