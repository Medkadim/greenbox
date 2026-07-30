import { CalendarClock } from "lucide-react";

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
import { SubscriptionActions } from "@/components/admin/subscription-actions";
import { listSubscriptions } from "@/lib/data/subscription";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  PAUSED: "secondary",
  EXPIRED: "outline",
  CANCELLED: "destructive",
};

export default async function AdminSubscriptionsPage() {
  const subscriptions = await listSubscriptions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Subscriptions</h1>
        <p className="text-muted-foreground text-sm">
          Active subscriptions, renewals and cancellations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All subscriptions ({subscriptions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="No subscriptions yet"
              description="Subscriptions appear here once customers subscribe to a plan."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remaining meals</TableHead>
                  <TableHead>Ends</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      {subscription.customerProfile.firstName}{" "}
                      {subscription.customerProfile.lastName}
                      <div className="text-muted-foreground text-xs">
                        {subscription.customerProfile.user.phoneNumber}
                      </div>
                    </TableCell>
                    <TableCell>{subscription.plan.name}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[subscription.status]}>
                        {subscription.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{subscription.remainingMeals}</TableCell>
                    <TableCell>
                      {subscription.endDate.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <SubscriptionActions
                        subscriptionId={subscription.id}
                        status={subscription.status}
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
