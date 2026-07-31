import { Bell } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { NotificationItem } from "@/components/customer/notification-item";
import { MarkAllReadButton } from "@/components/customer/mark-all-read-button";
import { listNotificationsForUser } from "@/lib/data/notification";
import { getServerSession } from "@/lib/session";

export default async function NotificationsPage() {
  const session = await getServerSession();
  const notifications = await listNotificationsForUser(session!.user.id);
  const hasUnread = notifications.some((n) => !n.readAt);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-muted-foreground text-sm">
            Subscription, menu, delivery and meal updates.
          </p>
        </div>
        {hasUnread && <MarkAllReadButton />}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState icon={Bell} title="No notifications yet" />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              id={notification.id}
              type={notification.type}
              title={notification.title}
              body={notification.body}
              createdAt={notification.createdAt}
              isRead={Boolean(notification.readAt)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
