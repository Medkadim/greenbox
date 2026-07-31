"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { markNotificationRead } from "@/lib/actions/notification";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function NotificationItem({
  id,
  title,
  body,
  createdAt,
  isRead,
}: {
  id: string;
  title: string;
  body: string | null;
  createdAt: Date;
  isRead: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Card className={isRead ? "opacity-70" : "border-primary/40"}>
      <CardContent className="flex items-start justify-between gap-4 pt-6">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{title}</p>
            {!isRead && <Badge className="text-xs">New</Badge>}
          </div>
          {body && <p className="text-muted-foreground text-sm">{body}</p>}
          <p className="text-muted-foreground mt-1 text-xs">
            {createdAt.toLocaleString()}
          </p>
        </div>
        {!isRead && (
          <Button
            size="sm"
            variant="ghost"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await markNotificationRead(id);
                router.refresh();
              })
            }
          >
            Mark read
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
