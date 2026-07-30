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
import { MealSelectCell } from "@/components/customer/meal-select-cell";
import { ConfirmWeekButton } from "@/components/customer/confirm-week-button";
import { getCurrentPublishedMenu } from "@/lib/data/weekly-menu";
import { getCustomerProfileByUserId } from "@/lib/data/customer";
import { getCustomerSelectionsForMenu } from "@/lib/data/menu-selection";
import { listActiveMeals } from "@/lib/data/meal";
import { getServerSession } from "@/lib/session";
import {
  DAYS_OF_WEEK,
  DAY_LABEL,
  MEAL_SLOTS,
  SLOT_LABEL,
} from "@/lib/weekly-menu-constants";

export default async function CustomerWeeklyMenuPage() {
  const session = await getServerSession();
  const [menu, profile, allMeals] = await Promise.all([
    getCurrentPublishedMenu(),
    getCustomerProfileByUserId(session!.user.id),
    listActiveMeals(),
  ]);

  const selections =
    profile && menu
      ? await getCustomerSelectionsForMenu(profile.id, menu.id)
      : [];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Weekly menu</h1>
        <p className="text-muted-foreground text-sm">
          Follow GreenBox&apos;s recommended menu or pick your own meals, day
          by day.
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
      ) : !profile ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={CalendarDays}
              title="Complete your profile first"
              description="We need your profile before you can choose meals."
            />
          </CardContent>
        </Card>
      ) : (
        (() => {
          const isLocked = menu.status === "LOCKED";
          const isPastDeadline = new Date() > menu.selectionDeadline;
          const disabled = isLocked || isPastDeadline;
          const hasSelections = selections.length > 0;
          const allConfirmed =
            hasSelections && selections.every((s) => s.confirmedAt);

          return (
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>
                      {menu.weekStartDate.toLocaleDateString()} –{" "}
                      {menu.weekEndDate.toLocaleDateString()}
                    </CardTitle>
                    <CardDescription>
                      Deadline: {menu.selectionDeadline.toLocaleString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {disabled && (
                      <Badge variant="secondary">
                        {isLocked ? "Locked" : "Deadline passed"}
                      </Badge>
                    )}
                    <ConfirmWeekButton
                      weeklyMenuId={menu.id}
                      hasSelections={hasSelections}
                      allConfirmed={allConfirmed}
                      disabled={disabled}
                    />
                  </div>
                </div>
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
                        <TableCell className="align-top font-medium">
                          {DAY_LABEL[day]}
                        </TableCell>
                        {MEAL_SLOTS.map((slot) => {
                          const recommendedItem = menu.menuItems.find(
                            (mi) =>
                              mi.dayOfWeek === day &&
                              mi.mealSlot === slot &&
                              mi.isRecommended
                          );
                          const selection = selections.find(
                            (s) =>
                              s.menuItem.dayOfWeek === day &&
                              s.menuItem.mealSlot === slot
                          );
                          const otherMeals = allMeals.filter(
                            (m) => m.id !== recommendedItem?.mealId
                          );

                          return (
                            <TableCell key={slot} className="align-top">
                              <MealSelectCell
                                weeklyMenuId={menu.id}
                                dayOfWeek={day}
                                mealSlot={slot}
                                recommendedMeal={recommendedItem?.meal ?? null}
                                otherActiveMeals={otherMeals}
                                currentSelection={selection ?? null}
                                requests={selection?.customizations ?? []}
                                disabled={disabled}
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
          );
        })()
      )}
    </div>
  );
}
