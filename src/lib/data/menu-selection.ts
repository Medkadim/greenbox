import { db } from "@/lib/db";

export function getCustomerSelectionsForMenu(
  customerProfileId: string,
  weeklyMenuId: string
) {
  return db.customerMealSelection.findMany({
    where: { customerProfileId, weeklyMenuId },
    include: {
      menuItem: { include: { meal: true } },
      customizations: { orderBy: { createdAt: "asc" } },
    },
  });
}
