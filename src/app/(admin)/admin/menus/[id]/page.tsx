import { notFound } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MenuCellSelect } from "@/components/admin/menu-cell-select";
import { WeeklyMenuStatusActions } from "@/components/admin/weekly-menu-status-actions";
import { getWeeklyMenuById } from "@/lib/data/weekly-menu";
import { listActiveMeals } from "@/lib/data/meal";
import {
  DAYS_OF_WEEK,
  DAY_LABEL,
  MEAL_SLOTS,
  SLOT_LABEL,
} from "@/lib/weekly-menu-constants";

export default async function AdminWeeklyMenuDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [menu, meals] = await Promise.all([
    getWeeklyMenuById(id),
    listActiveMeals(),
  ]);

  if (!menu) notFound();

  const isLocked = menu.status === "LOCKED";

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {menu.weekStartDate.toLocaleDateString()} –{" "}
            {menu.weekEndDate.toLocaleDateString()}
          </h1>
          <p className="text-muted-foreground text-sm">
            Deadline: {menu.selectionDeadline.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge>{menu.status.toLowerCase()}</Badge>
          <WeeklyMenuStatusActions weeklyMenuId={menu.id} status={menu.status} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meals per day</CardTitle>
          <CardDescription>
            {isLocked
              ? "This menu is locked and can no longer be edited."
              : "Assign GreenBox's recommended meal for each day and slot."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                {MEAL_SLOTS.map((slot) => (
                  <TableHead key={slot}>{SLOT_LABEL[slot]}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {DAYS_OF_WEEK.map((day) => (
                <TableRow key={day}>
                  <TableCell className="font-medium">
                    {DAY_LABEL[day]}
                  </TableCell>
                  {MEAL_SLOTS.map((slot) => {
                    const item = menu.menuItems.find(
                      (mi) => mi.dayOfWeek === day && mi.mealSlot === slot
                    );
                    return (
                      <TableCell key={slot}>
                        <MenuCellSelect
                          weeklyMenuId={menu.id}
                          dayOfWeek={day}
                          mealSlot={slot}
                          currentMenuItemId={item?.id}
                          currentMealId={item?.mealId}
                          meals={meals}
                          disabled={isLocked}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
