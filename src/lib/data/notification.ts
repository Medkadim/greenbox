import { db } from "@/lib/db";

export function listNotificationsForUser(userId: string) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export function getUnreadNotificationCount(userId: string) {
  return db.notification.count({
    where: { userId, readAt: null },
  });
}
