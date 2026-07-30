"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { upsertRecipe } from "@/lib/actions/meal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Ingredient = { id: string; name: string; unit: string };
type Row = { ingredientId: string; quantity: number; unit: string };

export function RecipeEditor({
  mealId,
  ingredients,
  initialInstructions,
  initialRows,
}: {
  mealId: string;
  ingredients: Ingredient[];
  initialInstructions: string;
  initialRows: Row[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [instructions, setInstructions] = useState(initialInstructions);
  const [rows, setRows] = useState<Row[]>(initialRows);

  function addRow() {
    if (ingredients.length === 0) {
      toast.error("Add an ingredient to the catalog first.");
      return;
    }
    setRows((prev) => {
      const used = new Set(prev.map((row) => row.ingredientId));
      const next = ingredients.find((i) => !used.has(i.id)) ?? ingredients[0];
      return [...prev, { ingredientId: next.id, quantity: 1, unit: next.unit }];
    });
  }

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function onSave() {
    const seen = new Set<string>();
    const duplicate = rows.find((row) => {
      if (seen.has(row.ingredientId)) return true;
      seen.add(row.ingredientId);
      return false;
    });
    if (duplicate) {
      const name =
        ingredients.find((i) => i.id === duplicate.ingredientId)?.name ??
        "This ingredient";
      toast.error(`${name} is listed more than once — merge or remove one row.`);
      return;
    }

    startTransition(async () => {
      try {
        await upsertRecipe(mealId, { instructions, ingredients: rows });
        toast.success("Recipe saved.");
        router.refresh();
      } catch {
        toast.error("Could not save the recipe.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="instructions">Preparation instructions</Label>
        <Textarea
          id="instructions"
          rows={4}
          value={instructions}
          onChange={(event) => setInstructions(event.target.value)}
        />
      </div>

      <div className="space-y-3">
        <Label>Ingredients</Label>
        {rows.length === 0 && (
          <p className="text-muted-foreground text-sm">
            No ingredients added yet.
          </p>
        )}
        {rows.map((row, index) => (
          <div key={index} className="flex items-center gap-2">
            <Select
              value={row.ingredientId}
              onValueChange={(value) => {
                const ingredient = ingredients.find((i) => i.id === value);
                updateRow(index, {
                  ingredientId: value,
                  unit: ingredient?.unit ?? row.unit,
                });
              }}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ingredients.map((ingredient) => (
                  <SelectItem key={ingredient.id} value={ingredient.id}>
                    {ingredient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              step="0.01"
              min={0.01}
              className="w-24"
              value={row.quantity}
              onChange={(event) =>
                updateRow(index, { quantity: Number(event.target.value) })
              }
            />
            <Input
              className="w-28"
              value={row.unit}
              onChange={(event) => updateRow(index, { unit: event.target.value })}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeRow(index)}
              aria-label="Remove ingredient"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          Add ingredient
        </Button>
      </div>

      <Button onClick={onSave} disabled={isPending}>
        Save recipe
      </Button>
    </div>
  );
}
