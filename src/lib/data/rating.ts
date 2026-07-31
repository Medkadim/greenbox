import { db } from "@/lib/db";

export function listUnratedDeliveredMeals(customerProfileId: string) {
  return db.delivery.findMany({
    where: {
      customerProfileId,
      status: "DELIVERED",
      customerMealSelection: { rating: null },
    },
    include: {
      customerMealSelection: { include: { menuItem: { include: { meal: true } } } },
    },
    orderBy: { deliveredAt: "desc" },
  });
}

export function listRatingsForCustomer(customerProfileId: string) {
  return db.rating.findMany({
    where: { customerProfileId },
    include: { meal: true },
    orderBy: { createdAt: "desc" },
  });
}
