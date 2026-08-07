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
          Total quantities to prepare for {plan.weekLabel}, from active
          customers&apos; planned meals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {plan.requirements.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nothing to prepare yet"
            description="Available once customers have meals planned for this week."
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
