import { ChefHat } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { MealProductionCard } from "@/components/kitchen/meal-production-card";
import { IngredientRequirements } from "@/components/kitchen/ingredient-requirements";
import { getDailyProduction } from "@/lib/data/kitchen";
import { MEAL_SLOTS, SLOT_LABEL } from "@/lib/weekly-menu-constants";

export default async function AdminKitchenPage() {
  const production = await getDailyProduction();
  const totalMealsToday = MEAL_SLOTS.reduce(
    (sum, slot) => sum + production.slots[slot].totalMeals,
    0
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Kitchen — {production.dayLabel}</h1>
        <p className="text-muted-foreground text-sm">
          What the kitchen sees: today&apos;s production, plus the
          ingredient shopping list for the week.
        </p>
      </div>

      {totalMealsToday === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={ChefHat}
              title="No meals planned for today"
              description="Assign meals to customers from a customer's page."
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

      <IngredientRequirements />
    </div>
  );
}
