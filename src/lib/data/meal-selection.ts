import { db } from "@/lib/db";

export function getCustomerMealSelectionsForWeek(
  customerProfileId: string,
  weekStartDate: Date
) {
  return db.customerMealSelection.findMany({
    where: { customerProfileId, weekStartDate },
    include: { meal: { select: { id: true, name: true } } },
  });
}

export function listActiveMealsForPlanning() {
  return db.meal.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
