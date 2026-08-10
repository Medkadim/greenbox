"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { adminCreateDriver } from "@/lib/actions/driver";
import { adminCreateDriverSchema, type AdminCreateDriverInput } from "@/lib/validations/driver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMPTY: AdminCreateDriverInput = {
  name: "",
  phoneNumber: "",
  password: "",
  vehicleInfo: "",
};

export function DriverForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<AdminCreateDriverInput>({
    resolver: zodResolver(adminCreateDriverSchema),
    defaultValues: EMPTY,
  });

  function onSubmit(values: AdminCreateDriverInput) {
    startTransition(async () => {
      const result = await adminCreateDriver(values);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      form.reset(EMPTY);
      toast.success("Driver added.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="driver-name">Full name</Label>
          <Input id="driver-name" required {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-destructive text-sm">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="driver-phoneNumber">Phone number</Label>
          <Input
            id="driver-phoneNumber"
            placeholder="+212 6XX XXX XXX"
            required
            {...form.register("phoneNumber")}
          />
          {form.formState.errors.phoneNumber && (
            <p className="text-destructive text-sm">
              {form.formState.errors.phoneNumber.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="driver-password">Password</Label>
          <Input
            id="driver-password"
            type="password"
            placeholder="At least 8 characters"
            required
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-destructive text-sm">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="driver-vehicleInfo">Vehicle</Label>
          <Input
            id="driver-vehicleInfo"
            placeholder="Scooter, plate ABC-123..."
            {...form.register("vehicleInfo")}
          />
        </div>
      </div>
      <p className="text-muted-foreground text-xs">
        Share this password with the driver — they can sign in with it from
        the Driver tab on the login page.
      </p>
      <Button type="submit" disabled={isPending}>
        Add driver
      </Button>
    </form>
  );
}
