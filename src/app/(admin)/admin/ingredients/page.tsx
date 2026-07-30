import { Salad } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IngredientForm } from "@/components/admin/ingredient-form";
import { listIngredients } from "@/lib/data/meal";

export default async function AdminIngredientsPage() {
  const ingredients = await listIngredients();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Ingredients</h1>
        <p className="text-muted-foreground text-sm">
          Reference catalog used to build meal recipes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add an ingredient</CardTitle>
        </CardHeader>
        <CardContent>
          <IngredientForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All ingredients ({ingredients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {ingredients.length === 0 ? (
            <EmptyState icon={Salad} title="No ingredients yet" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredients.map((ingredient) => (
                  <TableRow key={ingredient.id}>
                    <TableCell className="font-medium">
                      {ingredient.name}
                    </TableCell>
                    <TableCell>{ingredient.unit}</TableCell>
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
