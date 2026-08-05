"use client";

import { useState, useTransition } from "react";
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
  const [isUploading, setIsUploading] = useState(false);

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

  const photoUrl = form.watch("photoUrl");

  async function onPhotoSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5MB).");
      return;
    }

    setIsUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      let result: { url?: string; error?: string };
      try {
        result = await response.json();
      } catch {
        throw new Error("Upload failed — please try again.");
      }
      if (!response.ok || !result.url) throw new Error(result.error ?? "Upload failed.");
      form.setValue("photoUrl", result.url, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload the photo.");
    } finally {
      setIsUploading(false);
    }
  }

  function onSubmit(values: MealInput) {
    if (!values.photoUrl) {
      toast.error("Upload a photo before saving.");
      return;
    }
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
          <Label htmlFor="category">Category (optional)</Label>
          <Input
            id="category"
            placeholder="Bowl, Salad, Soup..."
            {...form.register("category")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={2} required {...form.register("description")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="photo">Photo</Label>
        <div className="flex items-center gap-4">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt=""
              className="border-input size-20 rounded-md border object-cover"
            />
          ) : (
            <div className="border-input bg-muted text-muted-foreground flex size-20 items-center justify-center rounded-md border text-xs">
              No photo
            </div>
          )}
          <div className="space-y-1">
            <Input
              id="photo"
              type="file"
              accept="image/*"
              disabled={isUploading}
              onChange={onPhotoSelected}
            />
            {isUploading && (
              <p className="text-muted-foreground text-xs">Uploading…</p>
            )}
            {form.formState.errors.photoUrl && (
              <p className="text-destructive text-xs">
                {form.formState.errors.photoUrl.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="calories">Calories (optional)</Label>
          <Input
            id="calories"
            type="number"
            min={0}
            {...form.register("calories", {
              setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="protein">Protein g (optional)</Label>
          <Input
            id="protein"
            type="number"
            step="0.1"
            min={0}
            {...form.register("protein", {
              setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="carbs">Carbs g (optional)</Label>
          <Input
            id="carbs"
            type="number"
            step="0.1"
            min={0}
            {...form.register("carbs", {
              setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fat">Fat g (optional)</Label>
          <Input
            id="fat"
            type="number"
            step="0.1"
            min={0}
            {...form.register("fat", {
              setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
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

      <Button type="submit" disabled={isPending || isUploading}>
        {meal ? "Save changes" : "Create meal"}
      </Button>
    </form>
  );
}
