import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProductionMeal } from "@/lib/data/kitchen";

export function MealProductionCard({ meal }: { meal: ProductionMeal }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{meal.mealName}</CardTitle>
          <div className="flex items-center gap-2">
            {meal.hasAllergyAlert && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="size-3" />
                Allergy alert
              </Badge>
            )}
            <Badge>{meal.portions} portions</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
            Standard recipe
          </p>
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
            <p className="text-muted-foreground text-sm">
              No recipe on file.
            </p>
          )}
        </div>

        {meal.customers.length > 0 && (
          <div>
            <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
              Customers
            </p>
            <ul className="space-y-2">
              {meal.customers.map((customer, index) => (
                <li key={`${customer.name}-${index}`} className="text-sm">
                  <span className="font-medium">{customer.name}</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {customer.allergies.map((allergy) => (
                      <Badge
                        key={allergy.name}
                        variant="destructive"
                        className="text-xs"
                      >
                        {allergy.name}
                        {allergy.notes ? ` — ${allergy.notes}` : ""}
                      </Badge>
                    ))}
                    {customer.otherAllergies && (
                      <Badge variant="destructive" className="text-xs">
                        {customer.otherAllergies}
                      </Badge>
                    )}
                    {customer.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag.replaceAll("_", " ").toLowerCase()}
                      </Badge>
                    ))}
                    {customer.preferences.map((pref, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {pref.type === "AVOID" ? "Avoid" : pref.type === "DISLIKE" ? "Dislikes" : "Likes"}: {pref.label}
                      </Badge>
                    ))}
                    {customer.note && (
                      <Badge variant="secondary" className="text-xs">
                        {customer.note}
                      </Badge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
