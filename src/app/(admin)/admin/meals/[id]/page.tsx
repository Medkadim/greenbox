import { notFound } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MealForm } from "@/components/admin/meal-form";
import { RecipeEditor } from "@/components/admin/recipe-editor";
import { getMealById, listIngredients } from "@/lib/data/meal";

export default async function AdminMealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [meal, ingredients] = await Promise.all([
    getMealById(id),
    listIngredients(),
  ]);

  if (!meal) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{meal.name}</h1>
        <p className="text-muted-foreground text-sm">
          Edit meal details and its recipe.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meal details</CardTitle>
        </CardHeader>
        <CardContent>
          <MealForm meal={meal} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recipe</CardTitle>
          <CardDescription>
            Standard preparation and the ingredients it takes — used to
            generate kitchen prep and purchasing lists.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecipeEditor
            mealId={meal.id}
            ingredients={ingredients}
            initialInstructions={meal.recipe?.instructions ?? ""}
            initialRows={
              meal.recipe?.ingredients.map((ri) => ({
                ingredientId: ri.ingredientId,
                quantity: ri.quantity,
                unit: ri.unit,
              })) ?? []
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
