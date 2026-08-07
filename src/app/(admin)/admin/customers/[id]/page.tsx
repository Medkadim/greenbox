import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomerTagsManager } from "@/components/admin/customer-tags-manager";
import { CustomerStatusSelect } from "@/components/admin/customer-status-select";
import { CustomerProfileForm } from "@/components/admin/customer-profile-form";
import { CustomerAllergiesForm } from "@/components/admin/customer-allergies-form";
import { CustomerPreferencesManager } from "@/components/admin/customer-preferences-manager";
import { CustomerMealPlanner } from "@/components/admin/customer-meal-planner";
import { getCustomerProfileById, listAllergies } from "@/lib/data/customer";
import {
  getCustomerMealSelectionsForWeek,
  listActiveMealsForPlanning,
} from "@/lib/data/meal-selection";
import { mondayOf } from "@/lib/weekly-menu-constants";

export default async function AdminCustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ week?: string }>;
}) {
  const { id } = await params;
  const { week } = await searchParams;
  const weekOffset = Number.parseInt(week ?? "0", 10) || 0;

  const [customer, allergies, meals] = await Promise.all([
    getCustomerProfileById(id),
    listAllergies(),
    listActiveMealsForPlanning(),
  ]);

  if (!customer) notFound();

  const weekStartDate = mondayOf(new Date());
  weekStartDate.setDate(weekStartDate.getDate() + weekOffset * 7);
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  const selections = await getCustomerMealSelectionsForWeek(id, weekStartDate);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {customer.firstName} {customer.lastName}
          </h1>
          <p className="text-muted-foreground text-sm">{customer.phoneNumber}</p>
        </div>
        <CustomerStatusSelect customerProfileId={customer.id} status={customer.status} />
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
        <CardContent>
          <CustomerProfileForm
            customerProfileId={customer.id}
            defaultValues={{
              firstName: customer.firstName,
              lastName: customer.lastName,
              phoneNumber: customer.phoneNumber,
              address: customer.address ?? "",
              latitude: customer.latitude ?? "",
              longitude: customer.longitude ?? "",
              preferredDeliveryStart: customer.preferredDeliveryStart ?? "",
              preferredDeliveryEnd: customer.preferredDeliveryEnd ?? "",
              suggestions: customer.suggestions ?? "",
              otherAllergies: customer.otherAllergies ?? "",
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Allergies</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerAllergiesForm
            customerProfileId={customer.id}
            allergies={allergies}
            existing={customer.allergies.map((a) => ({
              allergyId: a.allergyId,
              notes: a.notes,
            }))}
            otherAllergies={customer.otherAllergies}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerPreferencesManager
            customerProfileId={customer.id}
            preferences={customer.preferences}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Weekly meal plan</CardTitle>
              <CardDescription>
                {weekStartDate.toLocaleDateString()} – {weekEndDate.toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`?week=${weekOffset - 1}`}>
                  <ChevronLeft className="size-4" />
                  Previous
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`?week=${weekOffset + 1}`}>
                  Next
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CustomerMealPlanner
            customerProfileId={customer.id}
            weekStartDate={weekStartDate.toISOString()}
            meals={meals}
            selections={selections.map((s) => ({
              dayOfWeek: s.dayOfWeek,
              mealSlot: s.mealSlot,
              mealId: s.mealId,
              note: s.note,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
