import { ChefHat } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { MealProductionCard } from "@/components/kitchen/meal-production-card";
import { getDailyProduction } from "@/lib/data/kitchen";
import { MEAL_SLOTS, SLOT_LABEL } from "@/lib/weekly-menu-constants";

export default async function KitchenDashboardPage() {
  const production = await getDailyProduction();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Daily production</h1>
        <p className="text-muted-foreground text-sm">
          Portions to prepare today, per meal, with customer requests and
          allergy alerts.
        </p>
      </div>

      {!production ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={ChefHat}
              title="No production planned yet"
              description="Available once a weekly menu is published."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {MEAL_SLOTS.map((slot) => {
            const { totalMeals, meals } = production.slots[slot];
            return (
              <div key={slot} className="space-y-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">{SLOT_LABEL[slot]}</h2>
                  <Badge variant="secondary">{totalMeals} meals</Badge>
                </div>
                {meals.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No selections yet for {SLOT_LABEL[slot].toLowerCase()}.
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {meals.map((meal) => (
                      <MealProductionCard key={meal.mealId} meal={meal} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
