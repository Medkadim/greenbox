import { IngredientRequirementsAr } from "@/components/kitchen/ar/ingredient-requirements-ar";

export default function KitchenIngredientsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">تحضير المكوّنات</h1>
        <p className="text-muted-foreground text-sm">
          ما يجب تحضيره وشراؤه لهذا الأسبوع، في قائمة واحدة.
        </p>
      </div>
      <IngredientRequirementsAr />
    </div>
  );
}
