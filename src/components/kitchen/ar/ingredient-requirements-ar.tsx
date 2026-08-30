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

export async function IngredientRequirementsAr() {
  const plan = await getWeeklyIngredientRequirements();

  return (
    <Card>
      <CardHeader>
        <CardTitle>قائمة تحضير المكونات</CardTitle>
        <CardDescription>
          الكميات الإجمالية للتحضير لـ {plan.weekLabel}، حسب وجبات العملاء
          النشطين المخطط لها.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {plan.requirements.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="لا يوجد شيء للتحضير بعد"
            description="ستظهر القائمة بمجرد التخطيط لوجبات العملاء لهذا الأسبوع."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المكوّن</TableHead>
                <TableHead>الكمية</TableHead>
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
