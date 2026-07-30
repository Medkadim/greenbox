import { ClipboardList } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlanFormDialog } from "@/components/admin/plan-form-dialog";
import { PlanActiveToggle } from "@/components/admin/plan-active-toggle";
import { listSubscriptionPlans } from "@/lib/data/subscription";

const TYPE_LABEL: Record<string, string> = {
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  LUNCH_ONLY: "Lunch only",
  LUNCH_AND_DINNER: "Lunch + Dinner",
};

export default async function AdminPlansPage() {
  const plans = await listSubscriptionPlans();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Subscription plans</h1>
          <p className="text-muted-foreground text-sm">
            Programs customers can subscribe to.
          </p>
        </div>
        <PlanFormDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All plans ({plans.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No plans yet" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Meals/week</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{TYPE_LABEL[plan.type]}</Badge>
                    </TableCell>
                    <TableCell>{plan.mealsPerWeek}</TableCell>
                    <TableCell>{plan.durationDays} days</TableCell>
                    <TableCell>{Number(plan.price).toFixed(2)} MAD</TableCell>
                    <TableCell>
                      <PlanActiveToggle planId={plan.id} isActive={plan.isActive} />
                    </TableCell>
                    <TableCell className="text-right">
                      <PlanFormDialog
                        plan={{ ...plan, price: Number(plan.price) }}
                      />
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
