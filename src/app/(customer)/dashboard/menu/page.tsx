import { CalendarDays } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentPublishedMenu } from "@/lib/data/weekly-menu";
import {
  DAYS_OF_WEEK,
  DAY_LABEL,
  MEAL_SLOTS,
  SLOT_LABEL,
} from "@/lib/weekly-menu-constants";

export default async function CustomerWeeklyMenuPage() {
  const menu = await getCurrentPublishedMenu();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Weekly menu</h1>
        <p className="text-muted-foreground text-sm">
          GreenBox&apos;s recommended menu for this week.
        </p>
      </div>

      {!menu ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={CalendarDays}
              title="No menu published yet"
              description="Check back soon — GreenBox publishes the weekly menu ahead of time."
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {menu.weekStartDate.toLocaleDateString()} –{" "}
                {menu.weekEndDate.toLocaleDateString()}
              </CardTitle>
              <Badge>{menu.status.toLowerCase()}</Badge>
            </div>
            <CardDescription>
              Selection deadline: {menu.selectionDeadline.toLocaleString()}
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
                          {item?.meal.name ?? (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
