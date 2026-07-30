import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubscribeButton } from "@/components/customer/subscribe-button";
import { SubscriptionStatusCard } from "@/components/customer/subscription-status-card";
import {
  getCurrentSubscriptionForCustomer,
  listActiveSubscriptionPlans,
} from "@/lib/data/subscription";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";

const TYPE_LABEL: Record<string, string> = {
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  LUNCH_ONLY: "Lunch only",
  LUNCH_AND_DINNER: "Lunch + Dinner",
};

export default async function CustomerSubscriptionPage() {
  const session = await getServerSession();
  const profile = await db.customerProfile.findUnique({
    where: { userId: session!.user.id },
    select: { id: true },
  });

  const [subscription, plans] = await Promise.all([
    profile ? getCurrentSubscriptionForCustomer(profile.id) : null,
    listActiveSubscriptionPlans(),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Subscription</h1>
        <p className="text-muted-foreground text-sm">
          Your plan, remaining meals and renewal.
        </p>
      </div>

      {subscription ? (
        <Card>
          <CardHeader>
            <CardTitle>Your subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionStatusCard
              subscriptionId={subscription.id}
              planName={subscription.plan.name}
              status={subscription.status}
              remainingMeals={subscription.remainingMeals}
              endDate={subscription.endDate}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Choose a plan</CardTitle>
            <CardDescription>
              {profile
                ? "Pick the subscription that fits your routine."
                : "Complete your profile first, then come back to subscribe."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {plans.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                      <Badge variant="outline">{TYPE_LABEL[plan.type]}</Badge>
                    </div>
                    <CardDescription>
                      {plan.mealsPerWeek} meals/week · {plan.durationDays} days
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-2xl font-semibold">
                      {Number(plan.price).toFixed(0)}{" "}
                      <span className="text-muted-foreground text-sm font-normal">
                        MAD
                      </span>
                    </p>
                    {profile && <SubscribeButton planId={plan.id} />}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
