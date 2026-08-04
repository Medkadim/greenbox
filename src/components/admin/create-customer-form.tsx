"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { adminCreateCustomer } from "@/lib/actions/customer";
import type { AdminCreateCustomerInput } from "@/lib/validations/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateCustomerForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<AdminCreateCustomerInput>({
    defaultValues: { firstName: "", lastName: "", phoneNumber: "", password: "" },
  });

  function onSubmit(values: AdminCreateCustomerInput) {
    startTransition(async () => {
      try {
        await adminCreateCustomer(values);
        form.reset({ firstName: "", lastName: "", phoneNumber: "", password: "" });
        toast.success("Customer account created.");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not create the customer."
        );
      }
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
          <Label htmlFor="customer-password">Password</Label>
          <Input
            id="customer-password"
            type="password"
            placeholder="At least 8 characters"
            required
            {...form.register("password")}
          />
        </div>
      </div>
      <p className="text-muted-foreground text-xs">
        Share this password with the customer — they can sign in with it right
        away from the Customer tab on the login page.
      </p>
      <Button type="submit" disabled={isPending}>
        Create customer
      </Button>
    </form>
  );
}
