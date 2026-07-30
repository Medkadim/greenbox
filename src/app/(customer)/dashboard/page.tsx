import Link from "next/link";
import { CalendarDays, UserRound } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getCustomerProfileByUserId } from "@/lib/data/customer";
import { getServerSession } from "@/lib/session";

export default async function CustomerDashboardPage() {
  const session = await getServerSession();
  const profile = await getCustomerProfileByUserId(session!.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Your dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Today&apos;s meal, upcoming meals and your subscription status.
        </p>
      </div>

      {!profile && (
        <Card className="border-primary/40">
          <CardContent className="flex flex-col items-start gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <UserRound className="text-primary size-6" />
              <div>
                <p className="font-medium">Complete your profile</p>
                <p className="text-muted-foreground text-sm">
                  Add your address, allergies and preferences so the kitchen
                  can prepare your meals correctly.
                </p>
              </div>
            </div>
            <Button asChild size="sm">
              <Link href="/dashboard/profile">Complete profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}

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
