import { notFound } from "next/navigation";
import { CalendarClock, MessageSquare } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CustomerTagsManager } from "@/components/admin/customer-tags-manager";
import { getCustomerProfileById } from "@/lib/data/customer";

const PREFERENCE_LABEL: Record<string, string> = {
  LIKE: "Likes",
  DISLIKE: "Dislikes",
  AVOID: "Avoids",
};

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomerProfileById(id);

  if (!customer) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {customer.firstName} {customer.lastName}
        </h1>
        <p className="text-muted-foreground text-sm">
          {customer.user.phoneNumber ?? customer.user.email ?? "No contact on file"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
          <CardDescription>Click a tag to toggle it.</CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerTagsManager
            customerProfileId={customer.id}
            activeTags={customer.tags.map((t) => t.tag)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Address: </span>
            {customer.address || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Preferred delivery: </span>
            {customer.preferredDeliveryStart && customer.preferredDeliveryEnd
              ? `${customer.preferredDeliveryStart} – ${customer.preferredDeliveryEnd}`
              : "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Suggestions: </span>
            {customer.suggestions || "—"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Allergies</CardTitle>
        </CardHeader>
        <CardContent>
          {customer.allergies.length === 0 ? (
            <p className="text-muted-foreground text-sm">None on file.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {customer.allergies.map((a) => (
                <Badge key={a.id} variant="destructive">
                  {a.allergy.name}
                  {a.notes ? ` — ${a.notes}` : ""}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          {customer.preferences.length === 0 ? (
            <p className="text-muted-foreground text-sm">None on file.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {customer.preferences.map((p) => (
                <Badge key={p.id} variant="secondary">
                  {PREFERENCE_LABEL[p.type]}: {p.label}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription history</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={CalendarClock}
            title="Not available yet"
            description="Available once the subscription module ships."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={MessageSquare}
            title="Not available yet"
            description="Available once ratings ship."
          />
        </CardContent>
      </Card>
    </div>
  );
}
