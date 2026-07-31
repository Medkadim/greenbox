"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireCustomerId, requireAdmin } from "@/lib/auth-guards";
import { getServerSession, getUserRole } from "@/lib/session";
import { createNotification } from "@/lib/notifications";
import {
  subscriptionPlanSchema,
  type SubscriptionPlanInput,
} from "@/lib/validations/subscription";

function mealsForDuration(mealsPerWeek: number, durationDays: number) {
  return mealsPerWeek * Math.max(1, Math.round(durationDays / 7));
}

async function getManageableSubscription(subscriptionId: string) {
  const session = await getServerSession();
  if (!session) throw new Error("Not authenticated");

  const subscription = await db.subscription.findUniqueOrThrow({
    where: { id: subscriptionId },
    include: { plan: true, customerProfile: true },
  });

  const role = getUserRole(session.user);
  if (role === "ADMIN") return subscription;
  if (role === "CUSTOMER" && subscription.customerProfile.userId === session.user.id) {
    return subscription;
  }
  throw new Error("Not authorized");
}

export async function createSubscriptionPlan(input: SubscriptionPlanInput) {
  await requireAdmin();
  const data = subscriptionPlanSchema.parse(input);

  await db.subscriptionPlan.create({ data });

  revalidatePath("/admin/plans");
}

export async function updateSubscriptionPlan(
  planId: string,
  input: SubscriptionPlanInput
) {
  await requireAdmin();
  const data = subscriptionPlanSchema.parse(input);

  await db.subscriptionPlan.update({ where: { id: planId }, data });

  revalidatePath("/admin/plans");
  revalidatePath("/dashboard/subscription");
}

export async function toggleSubscriptionPlanActive(
  planId: string,
  isActive: boolean
) {
  await requireAdmin();

  await db.subscriptionPlan.update({ where: { id: planId }, data: { isActive } });

  revalidatePath("/admin/plans");
  revalidatePath("/dashboard/subscription");
}

export async function subscribeToPlan(planId: string) {
  const userId = await requireCustomerId();

  const profile = await db.customerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) {
    throw new Error("Please complete your profile before subscribing.");
  }

  const plan = await db.subscriptionPlan.findUniqueOrThrow({
    where: { id: planId },
  });
  if (!plan.isActive) throw new Error("This plan is no longer available.");

  const now = new Date();
  const endDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
  const remainingMeals = mealsForDuration(plan.mealsPerWeek, plan.durationDays);

  const [, subscription] = await db.$transaction([
    db.subscription.updateMany({
      where: { customerProfileId: profile.id, status: { in: ["ACTIVE", "PAUSED"] } },
      data: { status: "CANCELLED" },
    }),
    db.subscription.create({
      data: {
        customerProfileId: profile.id,
        planId: plan.id,
        status: "ACTIVE",
        startDate: now,
        endDate,
        remainingMeals,
      },
    }),
  ]);

  await db.payment.create({
    data: {
      subscriptionId: subscription.id,
      amount: plan.price,
      status: "PAID",
      method: "manual",
      paidAt: now,
    },
  });

  await createNotification({
    userId,
    type: "SUBSCRIPTION_CONFIRMATION",
    title: "Subscription confirmed",
    body: `You're subscribed to ${plan.name}.`,
  });
  await createNotification({
    userId,
    type: "PAYMENT_CONFIRMATION",
    title: "Payment received",
    body: `${Number(plan.price).toFixed(2)} MAD for ${plan.name}.`,
  });

  revalidatePath("/dashboard/subscription");
  revalidatePath("/dashboard");
  revalidatePath("/admin/subscriptions");
}

export async function cancelSubscription(subscriptionId: string) {
  await getManageableSubscription(subscriptionId);

  await db.subscription.update({
    where: { id: subscriptionId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/dashboard/subscription");
  revalidatePath("/dashboard");
  revalidatePath("/admin/subscriptions");
}

export async function renewSubscription(subscriptionId: string) {
  const subscription = await getManageableSubscription(subscriptionId);

  const base = subscription.endDate > new Date() ? subscription.endDate : new Date();
  const newEndDate = new Date(
    base.getTime() + subscription.plan.durationDays * 24 * 60 * 60 * 1000
  );
  const addedMeals = mealsForDuration(
    subscription.plan.mealsPerWeek,
    subscription.plan.durationDays
  );

  await db.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: "ACTIVE",
      endDate: newEndDate,
      remainingMeals: subscription.remainingMeals + addedMeals,
    },
  });

  await db.payment.create({
    data: {
      subscriptionId,
      amount: subscription.plan.price,
      status: "PAID",
      method: "manual",
      paidAt: new Date(),
    },
  });

  await createNotification({
    userId: subscription.customerProfile.userId,
    type: "PAYMENT_CONFIRMATION",
    title: "Subscription renewed",
    body: `${Number(subscription.plan.price).toFixed(2)} MAD for ${subscription.plan.name}.`,
  });

  revalidatePath("/dashboard/subscription");
  revalidatePath("/dashboard");
  revalidatePath("/admin/subscriptions");
}

export async function pauseSubscription(subscriptionId: string) {
  await requireAdmin();

  await db.subscription.update({
    where: { id: subscriptionId },
    data: { status: "PAUSED" },
  });

  revalidatePath("/admin/subscriptions");
  revalidatePath("/dashboard/subscription");
}

export async function resumeSubscription(subscriptionId: string) {
  await requireAdmin();

  await db.subscription.update({
    where: { id: subscriptionId },
    data: { status: "ACTIVE" },
  });

  revalidatePath("/admin/subscriptions");
  revalidatePath("/dashboard/subscription");
}
