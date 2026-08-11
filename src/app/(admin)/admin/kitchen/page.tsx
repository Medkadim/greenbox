import Link from "next/link";
import { ChefHat, ChevronLeft, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { OrderTicket } from "@/components/kitchen/order-ticket";
import { MealProductionCard } from "@/components/kitchen/meal-production-card";
import { KitchenDatePicker } from "@/components/kitchen/kitchen-date-picker";
import { IngredientRequirements } from "@/components/kitchen/ingredient-requirements";
import { getDailyProduction } from "@/lib/data/kitchen";
import {
  MEAL_SLOTS,
  SLOT_LABEL,
  formatDateParam,
  parseDateParam,
} from "@/lib/weekly-menu-constants";

export default async function AdminKitchenPage({
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
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Kitchen — {production.dayLabel}</h1>
          <p className="text-muted-foreground text-sm">
            One ticket per order, in delivery-time order, plus the weekly
            ingredient shopping list.
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
              description="Assign meals to customers from a customer's page."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {MEAL_SLOTS.map((slot) => {
            const { totalMeals, tickets, meals } = production.slots[slot];
            if (tickets.length === 0) return null;

            return (
              <div key={slot} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">{SLOT_LABEL[slot]}</h2>
                  <Badge variant="secondary">{totalMeals} orders</Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {tickets.map((ticket, index) => (
                    <OrderTicket
                      key={`${ticket.mealId}-${ticket.customerName}-${index}`}
                      ticket={ticket}
                    />
                  ))}
                </div>

                <details className="text-sm">
                  <summary className="text-muted-foreground cursor-pointer select-none">
                    Recipe reference for {SLOT_LABEL[slot].toLowerCase()} ({meals.length} meals)
                  </summary>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    {meals.map((meal) => (
                      <MealProductionCard key={meal.mealId} meal={meal} />
                    ))}
                  </div>
                </details>
              </div>
            );
          })}
        </div>
      )}

      <IngredientRequirements />
    </div>
  );
}
