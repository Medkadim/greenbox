import Link from "next/link";
import { ChefHat, ChevronLeft, ChevronRight, Moon, Sun, Sunrise } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { OrderTicketAr } from "@/components/kitchen/ar/order-ticket-ar";
import { MealSummaryCardAr } from "@/components/kitchen/ar/meal-summary-card-ar";
import { KitchenDatePicker } from "@/components/kitchen/kitchen-date-picker";
import { getDailyProduction } from "@/lib/data/kitchen";
import { MEAL_SLOTS, formatDateParam, parseDateParam } from "@/lib/weekly-menu-constants";
import type { MealSlot } from "@/generated/prisma/client";

const SLOT_LABEL_AR: Record<MealSlot, string> = {
  BREAKFAST: "الفطور",
  LUNCH: "الغداء",
  DINNER: "العشاء",
};

const SLOT_ICON: Record<MealSlot, typeof Sunrise> = {
  BREAKFAST: Sunrise,
  LUNCH: Sun,
  DINNER: Moon,
};

export default async function KitchenDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const targetDate = parseDateParam(date);
  const production = await getDailyProduction(targetDate);
  const totalMealsToday = MEAL_SLOTS.reduce(
    (sum, slot) => sum + production.slots[slot].totalMeals,
    0
  );
  const dayLabelAr = targetDate.toLocaleDateString("ar", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const prevDate = new Date(targetDate);
  prevDate.setDate(prevDate.getDate() - 1);
  const nextDate = new Date(targetDate);
  nextDate.setDate(nextDate.getDate() + 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">الإنتاج اليومي — {dayLabelAr}</h1>
          <p className="text-muted-foreground text-sm">
            بطاقة لكل طلب، مرتبة حسب وقت التوصيل — ابدأ بالأقرب.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`?date=${formatDateParam(prevDate)}`} aria-label="اليوم السابق">
              <ChevronRight className="size-4" />
            </Link>
          </Button>
          <KitchenDatePicker date={formatDateParam(targetDate)} />
          <Button asChild variant="outline" size="sm">
            <Link href={`?date=${formatDateParam(nextDate)}`} aria-label="اليوم التالي">
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      {totalMealsToday === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={ChefHat}
              title="لا توجد وجبات مخططة لهذا اليوم"
              description="قم بتعيين الوجبات للعملاء لهذا اليوم من صفحة العميل في لوحة التحكم."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {MEAL_SLOTS.map((slot) => {
            const { totalMeals, tickets, meals } = production.slots[slot];
            if (tickets.length === 0) return null;
            const SlotIcon = SLOT_ICON[slot];

            return (
              <div key={slot} className="space-y-4">
                <div className="flex items-center gap-3">
                  <SlotIcon className="text-primary size-5" />
                  <h2 className="text-lg font-semibold">{SLOT_LABEL_AR[slot]}</h2>
                  <Badge variant="secondary">{totalMeals} طلب</Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {tickets.map((ticket, index) => (
                    <OrderTicketAr
                      key={`${ticket.mealId}-${ticket.customerName}-${index}`}
                      ticket={ticket}
                    />
                  ))}
                </div>

                <details className="text-sm">
                  <summary className="text-muted-foreground cursor-pointer select-none">
                    مرجع الوصفة — {meals.length} وجبة
                  </summary>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    {meals.map((meal) => (
                      <MealSummaryCardAr key={meal.mealId} meal={meal} />
                    ))}
                  </div>
                </details>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
