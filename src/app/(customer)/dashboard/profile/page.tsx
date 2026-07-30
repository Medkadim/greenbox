import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileForm } from "@/components/customer/profile-form";
import { AllergiesForm } from "@/components/customer/allergies-form";
import { PreferencesManager } from "@/components/customer/preferences-manager";
import { getCustomerProfileByUserId, listAllergies } from "@/lib/data/customer";
import { getServerSession } from "@/lib/session";

export default async function CustomerProfilePage() {
  const session = await getServerSession();
  const userId = session!.user.id;

  const [profile, allergies] = await Promise.all([
    getCustomerProfileByUserId(userId),
    listAllergies(),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Your profile</h1>
        <p className="text-muted-foreground text-sm">
          Personal information, allergies and food preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>
            Used for delivery and to personalize your meals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            defaultValues={{
              firstName: profile?.firstName ?? "",
              lastName: profile?.lastName ?? "",
              address: profile?.address ?? "",
              latitude: profile?.latitude ?? undefined,
              longitude: profile?.longitude ?? undefined,
              preferredDeliveryStart: profile?.preferredDeliveryStart ?? "",
              preferredDeliveryEnd: profile?.preferredDeliveryEnd ?? "",
              suggestions: profile?.suggestions ?? "",
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Allergies</CardTitle>
          <CardDescription>
            The kitchen sees this for every meal you order.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AllergiesForm
            allergies={allergies}
            existing={
              profile?.allergies.map((a) => ({
                allergyId: a.allergyId,
                notes: a.notes,
              })) ?? []
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Food preferences</CardTitle>
          <CardDescription>
            General likes, dislikes and things to avoid — not tied to a
            specific meal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PreferencesManager preferences={profile?.preferences ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
