import { ChefHat } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { MealProductionCard } from "@/components/kitchen/meal-production-card";
import { getDailyProduction } from "@/lib/data/kitchen";
import { MEAL_SLOTS, SLOT_LABEL } from "@/lib/weekly-menu-constants";

export default async function KitchenDashboardPage() {
  const production = await getDailyProduction();
  const totalMealsToday = MEAL_SLOTS.reduce(
    (sum, slot) => sum + production.slots[slot].totalMeals,
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Daily production — {production.dayLabel}</h1>
        <p className="text-muted-foreground text-sm">
          Portions to prepare today, per meal, with customer remarks and
          allergy alerts.
        </p>
      </div>

      {totalMealsToday === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={ChefHat}
              title="No meals planned for today"
              description="Assign meals to customers for today from a customer's page in the admin console."
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
