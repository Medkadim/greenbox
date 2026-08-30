import { MealScheduleGrid } from "@/components/admin/meal-schedule-grid";
import { getMealSchedule } from "@/lib/data/meal-schedule";
import { listActiveMealsForPlanning } from "@/lib/data/meal-selection";

export default async function AdminSchedulePage() {
  const [schedule, meals] = await Promise.all([
    getMealSchedule(),
    listActiveMealsForPlanning(),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Weekly schedule</h1>
        <p className="text-muted-foreground text-sm">
          The default meal for each day and slot — applies automatically to
          every active customer unless overridden on that customer&apos;s own
          page.
        </p>
      </div>
      <MealScheduleGrid
        schedule={schedule.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          mealSlot: s.mealSlot,
          mealId: s.mealId,
        }))}
        meals={meals}
      />
    </div>
  );
}
