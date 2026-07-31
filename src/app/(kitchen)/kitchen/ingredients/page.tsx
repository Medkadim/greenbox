import { IngredientRequirements } from "@/components/kitchen/ingredient-requirements";

export default function KitchenIngredientsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Ingredient preparation</h1>
        <p className="text-muted-foreground text-sm">
          What to prepare and buy for this week, in one list.
        </p>
      </div>
      <IngredientRequirements />
    </div>
  );
}
