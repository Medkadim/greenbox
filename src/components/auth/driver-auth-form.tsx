"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { phoneToLocalEmail } from "@/lib/phone-identity";
import { driverSignInSchema, type DriverSignInInput } from "@/lib/validations/auth";
import { ROLE_HOME, type Role } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Driver accounts are created by an admin (see /admin/drivers) — this form
// is login-only, no self-registration.
export function DriverAuthForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<DriverSignInInput>({
    resolver: zodResolver(driverSignInSchema),
    defaultValues: { phoneNumber: "", password: "" },
  });

  async function onSubmit(values: DriverSignInInput) {
    setLoading(true);
    const { data, error } = await authClient.signIn.email({
      email: phoneToLocalEmail(values.phoneNumber),
      password: values.password,
    });
    setLoading(false);

    if (error) {
      toast.error("Invalid phone number or password.");
      return;
    }
    const role = (data?.user as { role?: Role } | undefined)?.role ?? "PENDING";
    router.push(ROLE_HOME[role]);
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone number</Label>
        <Input
          id="phoneNumber"
          placeholder="+212 6XX XXX XXX"
          {...form.register("phoneNumber")}
        />
        {form.formState.errors.phoneNumber && (
          <p className="text-destructive text-sm">
            {form.formState.errors.phoneNumber.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...form.register("password")} />
        {form.formState.errors.password && (
          <p className="text-destructive text-sm">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        Sign in
      </Button>
    </form>
  );
}
