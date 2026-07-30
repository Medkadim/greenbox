"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin } from "lucide-react";
import { toast } from "sonner";

import { upsertCustomerProfile } from "@/lib/actions/customer";
import {
  customerProfileSchema,
  type CustomerProfileInput,
} from "@/lib/validations/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProfileForm({
  defaultValues,
}: {
  defaultValues: CustomerProfileInput;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CustomerProfileInput>({
    resolver: zodResolver(customerProfileSchema),
    defaultValues,
  });

  function onSubmit(values: CustomerProfileInput) {
    startTransition(async () => {
      try {
        await upsertCustomerProfile(values);
        toast.success("Profile saved.");
        router.refresh();
      } catch {
        toast.error("Could not save your profile.");
      }
    });
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      toast.error("Location isn't available on this device.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setValue("latitude", position.coords.latitude, { shouldDirty: true });
        form.setValue("longitude", position.coords.longitude, { shouldDirty: true });
        toast.success("Location captured.");
      },
      () => toast.error("Could not read your location.")
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" {...form.register("firstName")} />
          {form.formState.errors.firstName && (
            <p className="text-destructive text-sm">
              {form.formState.errors.firstName.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" {...form.register("lastName")} />
          {form.formState.errors.lastName && (
            <p className="text-destructive text-sm">
              {form.formState.errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Delivery address</Label>
        <Textarea id="address" rows={2} {...form.register("address")} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>GPS location</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={useCurrentLocation}
          >
            <MapPin />
            Use my current location
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            aria-label="Latitude"
            placeholder="Latitude"
            {...form.register("latitude")}
          />
          <Input
            aria-label="Longitude"
            placeholder="Longitude"
            {...form.register("longitude")}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="preferredDeliveryStart">
            Preferred delivery time — from
          </Label>
          <Input
            id="preferredDeliveryStart"
            type="time"
            {...form.register("preferredDeliveryStart")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="preferredDeliveryEnd">
            Preferred delivery time — to
          </Label>
          <Input
            id="preferredDeliveryEnd"
            type="time"
            {...form.register("preferredDeliveryEnd")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="suggestions">Suggestions</Label>
        <Textarea
          id="suggestions"
          rows={3}
          placeholder="Anything you'd like GreenBox to know?"
          {...form.register("suggestions")}
        />
      </div>

      <Button type="submit" disabled={isPending}>
        Save profile
      </Button>
    </form>
  );
}
