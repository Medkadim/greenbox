"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createDriver } from "@/lib/actions/driver";
import type { CreateDriverInput } from "@/lib/validations/driver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DriverForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateDriverInput>({
    defaultValues: { phoneNumber: "", vehicleInfo: "" },
  });

  function onSubmit(values: CreateDriverInput) {
    startTransition(async () => {
      try {
        await createDriver(values);
        form.reset({ phoneNumber: "", vehicleInfo: "" });
        toast.success("Driver added.");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not add the driver."
        );
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone number</Label>
          <Input
            id="phoneNumber"
            placeholder="+212 6XX XXX XXX"
            required
            {...form.register("phoneNumber")}
          />
          <p className="text-muted-foreground text-xs">
            The person must already have a GreenBox account (they can sign in
            once, then you promote them here).
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleInfo">Vehicle</Label>
          <Input
            id="vehicleInfo"
            placeholder="Scooter, plate ABC-123..."
            {...form.register("vehicleInfo")}
          />
        </div>
      </div>
      <Button type="submit" disabled={isPending}>
        Add driver
      </Button>
    </form>
  );
}
