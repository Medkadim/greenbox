import { Receipt } from "lucide-react";

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
import { getFinanceOverview } from "@/lib/data/finance";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PAID: "default",
  PENDING: "secondary",
  FAILED: "destructive",
  REFUNDED: "outline",
};

export default async function AdminFinancePage() {
  const { totalRevenue, paidCount, recentPayments } = await getFinanceOverview();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Finance</h1>
        <p className="text-muted-foreground text-sm">
          Revenue and subscription payments.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {totalRevenue.toFixed(2)}{" "}
              <span className="text-muted-foreground text-sm font-normal">
                MAD
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Paid transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{paidCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent payments</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPayments.length === 0 ? (
            <EmptyState icon={Receipt} title="No payments yet" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {payment.subscription.customerProfile.firstName}{" "}
                      {payment.subscription.customerProfile.lastName}
                    </TableCell>
                    <TableCell>{payment.subscription.plan.name}</TableCell>
                    <TableCell>
                      {Number(payment.amount).toFixed(2)} {payment.currency}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[payment.status]}>
                        {payment.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payment.createdAt.toLocaleDateString()}
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
