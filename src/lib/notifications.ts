import { db } from "@/lib/db";
import type { NotificationType, Prisma } from "@/generated/prisma/client";

// Everything is delivered IN_APP for now. PUSH/WHATSAPP/EMAIL channels exist
// on the schema and are ready to wire up to a real provider later — for
// those, this would create the row with status "PENDING" instead of "SENT"
// and a background worker would flip it once actually delivered.
export async function createNotification({
  userId,
  type,
  title,
  body,
  metadata,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  return db.notification.create({
    data: {
      userId,
      type,
      channel: "IN_APP",
      status: "SENT",
      title,
      body,
      metadata,
      sentAt: new Date(),
    },
  });
}

export async function notifyActiveSubscribers({
  type,
  title,
  body,
}: {
  type: NotificationType;
  title: string;
  body?: string;
}) {
  const activeSubscribers = await db.subscription.findMany({
    where: { status: "ACTIVE" },
    select: { customerProfile: { select: { userId: true } } },
    distinct: ["customerProfileId"],
  });

  if (activeSubscribers.length === 0) return;

  await db.notification.createMany({
    data: activeSubscribers.map(({ customerProfile }) => ({
      userId: customerProfile.userId,
      type,
      channel: "IN_APP" as const,
      status: "SENT" as const,
      title,
      body,
      sentAt: new Date(),
    })),
  });
}
