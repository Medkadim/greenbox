import { AlertTriangle, Utensils } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MealSummary } from "@/lib/data/kitchen";

export function MealSummaryCardAr({ meal }: { meal: MealSummary }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{meal.mealName}</CardTitle>
          <div className="flex items-center gap-2">
            {meal.hasAllergyAlert && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="size-3" />
                تنبيه حساسية
              </Badge>
            )}
            <Badge className="gap-1">
              <Utensils className="size-3" />
              {meal.portions} حصة
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {meal.instructions && <p className="text-sm">{meal.instructions}</p>}
        {meal.ingredients.length > 0 ? (
          <ul className="text-muted-foreground mt-1 list-inside list-disc text-sm">
            {meal.ingredients.map((ing) => (
              <li key={ing.name}>
                {ing.name} — {ing.quantity} {ing.unit}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">لا توجد وصفة مسجلة.</p>
        )}
      </CardContent>
    </Card>
  );
}
