import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MealForm } from "@/components/admin/meal-form";

export default function NewMealPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New meal</h1>
        <p className="text-muted-foreground text-sm">
          You&apos;ll be able to add the recipe once the meal is created.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meal details</CardTitle>
        </CardHeader>
        <CardContent>
          <MealForm />
        </CardContent>
      </Card>
    </div>
  );
}
