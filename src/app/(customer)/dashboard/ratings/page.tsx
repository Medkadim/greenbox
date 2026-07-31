import { Star } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { RatingForm } from "@/components/customer/rating-form";
import { getCustomerProfileByUserId } from "@/lib/data/customer";
import { listRatingsForCustomer, listUnratedDeliveredMeals } from "@/lib/data/rating";
import { getServerSession } from "@/lib/session";
import { SLOT_LABEL } from "@/lib/weekly-menu-constants";

export default async function RatingsPage() {
  const session = await getServerSession();
  const profile = await getCustomerProfileByUserId(session!.user.id);

  const [pending, past] = profile
    ? await Promise.all([
        listUnratedDeliveredMeals(profile.id),
        listRatingsForCustomer(profile.id),
      ])
    : [[], []];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Ratings</h1>
        <p className="text-muted-foreground text-sm">
          Rate your delivered meals and see your feedback history.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium">Awaiting your rating</h2>
        {pending.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <EmptyState icon={Star} title="Nothing to rate right now" />
            </CardContent>
          </Card>
        ) : (
          pending.map((delivery) => (
            <Card key={delivery.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {delivery.customerMealSelection.menuItem.meal.name}
                </CardTitle>
                <CardDescription>
                  {SLOT_LABEL[delivery.mealSlot]} &middot;{" "}
                  {delivery.deliveredAt?.toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RatingForm
                  customerMealSelectionId={delivery.customerMealSelection.id}
                />
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {past.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium">Your feedback</h2>
          {past.map((rating) => (
            <Card key={rating.id}>
              <CardContent className="flex items-start justify-between gap-4 pt-6">
                <div>
                  <p className="font-medium">{rating.meal.name}</p>
                  {rating.comment && (
                    <p className="text-muted-foreground text-sm">{rating.comment}</p>
                  )}
                  <p className="text-muted-foreground mt-1 text-xs">
                    {rating.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 gap-0.5">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      className={
                        value <= rating.score
                          ? "fill-primary text-primary size-4"
                          : "text-muted-foreground size-4"
                      }
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
