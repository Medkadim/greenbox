import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WeeklyMenuForm } from "@/components/admin/weekly-menu-form";

export default function NewWeeklyMenuPage() {
  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New weekly menu</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Week details</CardTitle>
          <CardDescription>
            Covers 7 days starting from the date below. You&apos;ll assign
            meals per day and slot next.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WeeklyMenuForm />
        </CardContent>
      </Card>
    </div>
  );
}
