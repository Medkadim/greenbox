"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createIngredient } from "@/lib/actions/meal";
import type { IngredientInput } from "@/lib/validations/meal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function IngredientForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<IngredientInput>({
    defaultValues: { name: "", unit: "kg" },
  });

  function onSubmit(values: IngredientInput) {
    startTransition(async () => {
      try {
        await createIngredient(values);
        form.reset({ name: "", unit: values.unit });
        toast.success("Ingredient added.");
        router.refresh();
      } catch {
        toast.error("Could not add the ingredient.");
      }
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-2 sm:flex-row"
    >
      <Input placeholder="Ingredient name" required {...form.register("name")} />
      <Input
        placeholder="Unit (kg, liter, piece...)"
        className="sm:w-48"
        required
        {...form.register("unit")}
      />
      <Button type="submit" disabled={isPending}>
        Add
      </Button>
    </form>
  );
}
