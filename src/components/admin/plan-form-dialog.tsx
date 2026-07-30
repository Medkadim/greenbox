"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  createSubscriptionPlan,
  updateSubscriptionPlan,
} from "@/lib/actions/subscription";
import type { SubscriptionPlanInput } from "@/lib/validations/subscription";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type Plan = {
  id: string;
  name: string;
  type: SubscriptionPlanInput["type"];
  mealsPerWeek: number;
  durationDays: number;
  price: string | number;
  isActive: boolean;
};

const TYPE_LABEL: Record<SubscriptionPlanInput["type"], string> = {
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  LUNCH_ONLY: "Lunch only",
  LUNCH_AND_DINNER: "Lunch + Dinner",
};

export function PlanFormDialog({ plan }: { plan?: Plan }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<SubscriptionPlanInput>({
    defaultValues: plan
      ? {
          name: plan.name,
          type: plan.type,
          mealsPerWeek: plan.mealsPerWeek,
          durationDays: plan.durationDays,
          price: Number(plan.price),
          isActive: plan.isActive,
        }
      : {
          name: "",
          type: "WEEKLY",
          mealsPerWeek: 5,
          durationDays: 7,
          price: 0,
          isActive: true,
        },
  });

  function onSubmit(values: SubscriptionPlanInput) {
    startTransition(async () => {
      try {
        if (plan) {
          await updateSubscriptionPlan(plan.id, values);
          toast.success("Plan updated.");
        } else {
          await createSubscriptionPlan(values);
          toast.success("Plan created.");
          form.reset();
        }
        setOpen(false);
        router.refresh();
      } catch {
        toast.error("Could not save the plan.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={plan ? "ghost" : "default"} size={plan ? "icon" : "default"}>
          {plan ? <Pencil /> : (
            <>
              <Plus />
              New plan
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{plan ? "Edit plan" : "New subscription plan"}</DialogTitle>
          <DialogDescription>
            Configure the offer customers can subscribe to.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" required {...form.register("name")} />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={form.watch("type")}
              onValueChange={(value) =>
                form.setValue("type", value as SubscriptionPlanInput["type"])
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mealsPerWeek">Meals / week</Label>
              <Input
                id="mealsPerWeek"
                type="number"
                min={1}
                max={21}
                required
                {...form.register("mealsPerWeek", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="durationDays">Duration (days)</Label>
              <Input
                id="durationDays"
                type="number"
                min={1}
                max={366}
                required
                {...form.register("durationDays", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (MAD)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min={0}
                required
                {...form.register("price", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="isActive"
              checked={form.watch("isActive")}
              onCheckedChange={(checked) => form.setValue("isActive", checked)}
            />
            <Label htmlFor="isActive">Active (visible to customers)</Label>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {plan ? "Save changes" : "Create plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
