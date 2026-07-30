"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createMeal, updateMeal } from "@/lib/actions/meal";
import type { MealInput } from "@/lib/validations/meal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type Meal = {
  id: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
  category: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  isActive: boolean;
};

export function MealForm({ meal }: { meal?: Meal }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<MealInput>({
    defaultValues: meal
      ? {
          name: meal.name,
          description: meal.description ?? "",
          photoUrl: meal.photoUrl ?? "",
          category: meal.category ?? "",
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          isActive: meal.isActive,
        }
      : {
          name: "",
          description: "",
          photoUrl: "",
          category: "",
          calories: undefined,
          protein: undefined,
          carbs: undefined,
          fat: undefined,
          isActive: true,
        },
  });

  function onSubmit(values: MealInput) {
    startTransition(async () => {
      try {
        if (meal) {
          await updateMeal(meal.id, values);
          toast.success("Meal updated.");
          router.refresh();
        } else {
          const id = await createMeal(values);
          toast.success("Meal created. Now add its recipe below.");
          router.push(`/admin/meals/${id}`);
        }
      } catch {
        toast.error("Could not save the meal.");
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" required {...form.register("name")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            placeholder="Bowl, Salad, Soup..."
            {...form.register("category")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={2} {...form.register("description")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="photoUrl">Photo URL</Label>
        <Input
          id="photoUrl"
          placeholder="https://..."
          {...form.register("photoUrl")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="calories">Calories</Label>
          <Input
            id="calories"
            type="number"
            min={0}
            {...form.register("calories", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="protein">Protein (g)</Label>
          <Input
            id="protein"
            type="number"
            step="0.1"
            min={0}
            {...form.register("protein", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="carbs">Carbs (g)</Label>
          <Input
            id="carbs"
            type="number"
            step="0.1"
            min={0}
            {...form.register("carbs", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fat">Fat (g)</Label>
          <Input
            id="fat"
            type="number"
            step="0.1"
            min={0}
            {...form.register("fat", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="isActive"
          checked={form.watch("isActive")}
          onCheckedChange={(checked) => form.setValue("isActive", checked)}
        />
        <Label htmlFor="isActive">Active (visible in menus)</Label>
      </div>

      <Button type="submit" disabled={isPending}>
        {meal ? "Save changes" : "Create meal"}
      </Button>
    </form>
  );
}
