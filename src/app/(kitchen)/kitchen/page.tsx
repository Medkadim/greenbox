import Link from "next/link";
import { ChefHat, ChevronLeft, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { MealProductionCard } from "@/components/kitchen/meal-production-card";
import { KitchenDatePicker } from "@/components/kitchen/kitchen-date-picker";
import { getDailyProduction } from "@/lib/data/kitchen";
import {
  MEAL_SLOTS,
  SLOT_LABEL,
  formatDateParam,
  parseDateParam,
} from "@/lib/weekly-menu-constants";

export default async function KitchenDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const targetDate = parseDateParam(date);
  const production = await getDailyProduction(targetDate);
  const totalMealsToday = MEAL_SLOTS.reduce(
    (sum, slot) => sum + production.slots[slot].totalMeals,
    0
  );

  const prevDate = new Date(targetDate);
  prevDate.setDate(prevDate.getDate() - 1);
  const nextDate = new Date(targetDate);
  nextDate.setDate(nextDate.getDate() + 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Daily production — {production.dayLabel}</h1>
          <p className="text-muted-foreground text-sm">
            Portions to prepare, per meal, with customer allergies, remarks
            and preferences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`?date=${formatDateParam(prevDate)}`}>
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <KitchenDatePicker date={formatDateParam(targetDate)} />
          <Button asChild variant="outline" size="sm">
            <Link href={`?date=${formatDateParam(nextDate)}`}>
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      {totalMealsToday === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={ChefHat}
              title="No meals planned for this day"
              description="Assign meals to customers for this day from a customer's page in the admin console."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {MEAL_SLOTS.map((slot) => {
            const { totalMeals, meals } = production.slots[slot];
            if (meals.length === 0) return null;

            return (
              <div key={slot} className="space-y-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">{SLOT_LABEL[slot]}</h2>
                  <Badge variant="secondary">{totalMeals} meals</Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {meals.map((meal) => (
                    <MealProductionCard key={meal.mealId} meal={meal} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
