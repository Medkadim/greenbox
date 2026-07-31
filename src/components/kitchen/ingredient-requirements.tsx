import { ClipboardList } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
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
import { getWeeklyIngredientRequirements } from "@/lib/data/ingredient-prep";

export async function IngredientRequirements() {
  const plan = await getWeeklyIngredientRequirements();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingredient preparation list</CardTitle>
        <CardDescription>
          {plan
            ? `Total quantities to prepare for ${plan.weekLabel}, from active subscribers' selected meals.`
            : "Generated from active subscribers, their selected meals and each recipe."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!plan || plan.requirements.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nothing to prepare yet"
            description="Available once a weekly menu is published and customers have active subscriptions."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingredient</TableHead>
                <TableHead>Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plan.requirements.map((req) => (
                <TableRow key={req.ingredientId}>
                  <TableCell className="font-medium">{req.name}</TableCell>
                  <TableCell>
                    {req.totalQuantity} {req.unit}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
