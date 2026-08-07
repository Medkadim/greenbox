"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { adminCreateCustomer } from "@/lib/actions/customer";
import type { CustomerProfileInput } from "@/lib/validations/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const EMPTY: CustomerProfileInput = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  address: "",
  latitude: "",
  longitude: "",
  preferredDeliveryStart: "",
  preferredDeliveryEnd: "",
  suggestions: "",
  otherAllergies: "",
};

export function CreateCustomerForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CustomerProfileInput>({ defaultValues: EMPTY });

  function onSubmit(values: CustomerProfileInput) {
    startTransition(async () => {
      const result = await adminCreateCustomer(values);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      form.reset(EMPTY);
      toast.success("Customer created.");
      router.push(`/admin/customers/${result.id}`);
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customer-firstName">First name</Label>
          <Input id="customer-firstName" required {...form.register("firstName")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-lastName">Last name</Label>
          <Input id="customer-lastName" required {...form.register("lastName")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-phoneNumber">Phone number</Label>
          <Input
            id="customer-phoneNumber"
            placeholder="+212 6XX XXX XXX"
            required
            {...form.register("phoneNumber")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-address">Address</Label>
          <Input id="customer-address" {...form.register("address")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-deliveryStart">Preferred delivery start</Label>
          <Input
            id="customer-deliveryStart"
            placeholder="12:00"
            {...form.register("preferredDeliveryStart")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-deliveryEnd">Preferred delivery end</Label>
          <Input
            id="customer-deliveryEnd"
            placeholder="14:00"
            {...form.register("preferredDeliveryEnd")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-latitude">Latitude (optional)</Label>
          <Input id="customer-latitude" {...form.register("latitude")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-longitude">Longitude (optional)</Label>
          <Input id="customer-longitude" {...form.register("longitude")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="customer-otherAllergies">Other allergies (free text)</Label>
        <Input id="customer-otherAllergies" {...form.register("otherAllergies")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="customer-suggestions">Suggestions / notes</Label>
        <Textarea id="customer-suggestions" rows={2} {...form.register("suggestions")} />
      </div>
      <Button type="submit" disabled={isPending}>
        Create customer
      </Button>
    </form>
  );
}
