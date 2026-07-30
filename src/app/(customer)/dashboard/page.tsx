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
import { getCurrentSubscriptionForCustomer } from "@/lib/data/subscription";
import { getCurrentPublishedMenu } from "@/lib/data/weekly-menu";
import { getCustomerSelectionsForMenu } from "@/lib/data/menu-selection";
import { getServerSession } from "@/lib/session";
import {
  MEAL_SLOTS,
  dayOfWeekFromDate,
  SLOT_LABEL,
} from "@/lib/weekly-menu-constants";

export default async function CustomerDashboardPage() {
  const session = await getServerSession();
  const profile = await getCustomerProfileByUserId(session!.user.id);
  const subscription = profile
    ? await getCurrentSubscriptionForCustomer(profile.id)
    : null;
  const menu = await getCurrentPublishedMenu();
  const selections =
    profile && menu ? await getCustomerSelectionsForMenu(profile.id, menu.id) : [];
  const today = dayOfWeekFromDate(new Date());

  const todaysMeals = MEAL_SLOTS.flatMap((slot) => {
    const selection = selections.find(
      (s) => s.menuItem.dayOfWeek === today && s.menuItem.mealSlot === slot
    );
    if (selection) {
      return [{ slot, mealName: selection.menuItem.meal.name }];
    }
    const recommended = menu?.menuItems.find(
      (item) => item.dayOfWeek === today && item.mealSlot === slot && item.isRecommended
    );
    return recommended ? [{ slot, mealName: recommended.meal.name }] : [];
  });

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
            {todaysMeals.length > 0 ? (
              <div className="space-y-2">
                {todaysMeals.map((item) => (
                  <p key={item.slot} className="text-sm">
                    <span className="text-muted-foreground">
                      {SLOT_LABEL[item.slot]}:{" "}
                    </span>
                    {item.mealName}
                  </p>
                ))}
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard/menu">View week</Link>
                </Button>
              </div>
            ) : (
              <EmptyState
                icon={CalendarDays}
                title="No meal set for today"
                description="Available once the weekly menu is published."
                action={
                  <Button asChild size="sm" variant="outline">
                    <Link href="/dashboard/menu">View weekly menu</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Status &amp; remaining meals</CardDescription>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="space-y-2">
                <p className="font-medium">{subscription.plan.name}</p>
                <p className="text-muted-foreground text-sm">
                  {subscription.remainingMeals} meals remaining
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard/subscription">Manage</Link>
                </Button>
              </div>
            ) : (
              <EmptyState
                icon={CalendarDays}
                title="No active subscription"
                description="Choose a plan to get started."
                action={
                  <Button asChild size="sm">
                    <Link href="/dashboard/subscription">View plans</Link>
                  </Button>
                }
              />
            )}
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
