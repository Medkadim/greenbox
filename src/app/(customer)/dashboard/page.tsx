import { CalendarDays } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function CustomerDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Your dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Today&apos;s meal, upcoming meals and your subscription status.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s meal</CardTitle>
            <CardDescription>Lunch &amp; dinner</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={CalendarDays}
              title="No meal selected yet"
              description="Available once the weekly menu module ships."
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Status &amp; remaining meals</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={CalendarDays}
              title="No active subscription"
              description="Available once the subscription module ships."
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Delivery</CardTitle>
            <CardDescription>Next delivery information</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={CalendarDays}
              title="Nothing scheduled"
              description="Available once the delivery module ships."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
