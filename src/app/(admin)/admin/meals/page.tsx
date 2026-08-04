import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MealActiveToggle } from "@/components/admin/meal-active-toggle";
import { listMeals } from "@/lib/data/meal";

export default async function AdminMealsPage() {
  const meals = await listMeals();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Meals</h1>
          <p className="text-muted-foreground text-sm">
            Meal catalog, recipes and nutrition.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/ingredients">Ingredients</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/meals/new">New meal</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All meals ({meals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {meals.length === 0 ? (
            <EmptyState
              icon={UtensilsCrossed}
              title="No meals yet"
              description="Create your first meal to start building recipes."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Ingredients</TableHead>
                  <TableHead>Calories</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meals.map((meal) => (
                  <TableRow key={meal.id}>
                    <TableCell>
                      {meal.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={meal.photoUrl}
                          alt=""
                          className="border-input size-10 rounded-md border object-cover"
                        />
                      ) : (
                        <div className="border-input bg-muted size-10 rounded-md border" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/meals/${meal.id}`}
                        className="font-medium hover:underline"
                      >
                        {meal.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {meal.category ? (
                        <Badge variant="outline">{meal.category}</Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {meal.recipe?.ingredients.length ?? 0}
                    </TableCell>
                    <TableCell>{meal.calories ?? "—"}</TableCell>
                    <TableCell>
                      <MealActiveToggle mealId={meal.id} isActive={meal.isActive} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
