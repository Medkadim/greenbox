import { db } from "@/lib/db";

export function listSubscriptionPlans() {
  return db.subscriptionPlan.findMany({ orderBy: { createdAt: "asc" } });
}

export function listActiveSubscriptionPlans() {
  return db.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });
}

export function getSubscriptionPlanById(id: string) {
  return db.subscriptionPlan.findUnique({ where: { id } });
}

export function getCurrentSubscriptionForCustomer(customerProfileId: string) {
  return db.subscription.findFirst({
    where: {
      customerProfileId,
      status: { in: ["ACTIVE", "PAUSED"] },
    },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });
}

export function listSubscriptions() {
  return db.subscription.findMany({
    include: {
      plan: true,
      customerProfile: {
        include: { user: { select: { phoneNumber: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
