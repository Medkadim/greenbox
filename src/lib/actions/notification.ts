"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getServerSession } from "@/lib/session";

async function requireUserId() {
  const session = await getServerSession();
  if (!session) throw new Error("Not authenticated");
  return session.user.id;
}

export async function markNotificationRead(notificationId: string) {
  const userId = await requireUserId();

  await db.notification.updateMany({
    where: { id: notificationId, userId, readAt: null },
    data: { readAt: new Date(), status: "READ" },
  });

  revalidatePath("/dashboard/notifications");
}

export async function markAllNotificationsRead() {
  const userId = await requireUserId();

  await db.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date(), status: "READ" },
  });

  revalidatePath("/dashboard/notifications");
}
