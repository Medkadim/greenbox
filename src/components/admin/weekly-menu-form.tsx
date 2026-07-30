"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createWeeklyMenu } from "@/lib/actions/weekly-menu";
import type { WeeklyMenuInput } from "@/lib/validations/weekly-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WeeklyMenuForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<WeeklyMenuInput>({
    defaultValues: { weekStartDate: "", selectionDeadline: "" },
  });

  function onSubmit(values: WeeklyMenuInput) {
    startTransition(async () => {
      try {
        const id = await createWeeklyMenu(values);
        toast.success("Weekly menu created.");
        router.push(`/admin/menus/${id}`);
      } catch {
        toast.error("Could not create the weekly menu.");
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="weekStartDate">Week start date (Monday)</Label>
        <Input
          id="weekStartDate"
          type="date"
          required
          {...form.register("weekStartDate")}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="selectionDeadline">Customer selection deadline</Label>
        <Input
          id="selectionDeadline"
          type="datetime-local"
          required
          {...form.register("selectionDeadline")}
        />
      </div>
      <Button type="submit" disabled={isPending}>
        Create weekly menu
      </Button>
    </form>
  );
}
