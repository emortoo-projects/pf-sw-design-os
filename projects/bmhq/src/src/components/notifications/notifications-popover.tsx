"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type NotificationType = "info" | "success" | "warning" | "error";

interface Notification {
  id: string;
  organizationId: string;
  moduleId: string | null;
  type: string;
  title: string;
  message: string;
  actionUrl: string | null;
  isRead: boolean;
  readAt: Date | null;
  metadata: unknown;
  createdAt: Date;
}

const TYPE_STYLES: Record<NotificationType, { bg: string; text: string; label: string }> = {
  info: { bg: "bg-primary-100", text: "text-primary-700", label: "i" },
  success: { bg: "bg-success-100", text: "text-success-700", label: "✓" },
  warning: { bg: "bg-warning-100", text: "text-warning-700", label: "!" },
  error: { bg: "bg-error-100", text: "text-error-700", label: "✕" },
};

function formatRelativeTime(date: Date | string): string {
  const now = Date.now();
  const then = date instanceof Date ? date.getTime() : new Date(date).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

interface NotificationsPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationsPopover({
  open,
  onOpenChange,
}: NotificationsPopoverProps) {
  const router = useRouter();

  const notificationsQuery = trpc.notifications.list.useQuery(
    {},
    { enabled: open }
  );
  const notificationsData = notificationsQuery.data;

  const notifications = useMemo(
    () => (notificationsData?.data ?? []) as Notification[],
    [notificationsData?.data]
  );
  const unreadCount = notificationsData?.unreadCount ?? 0;

  const markReadMutation = trpc.notifications.update.useMutation({
    onSuccess: () => notificationsQuery.refetch(),
  });

  const markAllReadMutation = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => notificationsQuery.refetch(),
  });

  const deleteMutation = trpc.notifications.delete.useMutation({
    onSuccess: () => notificationsQuery.refetch(),
  });

  function handleClick(notification: Notification) {
    if (!notification.isRead) {
      markReadMutation.mutate({
        notificationId: notification.id,
        isRead: true,
      });
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-4 pt-4 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base">Notifications</DialogTitle>
              {unreadCount > 0 && (
                <Badge variant="default" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                disabled={markAllReadMutation.isPending}
                onClick={() => markAllReadMutation.mutate({})}
              >
                Mark all read
              </Button>
            )}
          </div>
        </DialogHeader>

        <Separator className="mt-3" />

        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg mb-3">
                🔔
              </div>
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const typeStyle =
                  TYPE_STYLES[notification.type as NotificationType] ??
                  TYPE_STYLES.info;

                return (
                  <div
                    key={notification.id}
                    className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                      !notification.isRead ? "bg-primary-50/50" : ""
                    }`}
                    onClick={() => handleClick(notification)}
                  >
                    {/* Type icon */}
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${typeStyle.bg} ${typeStyle.text}`}
                    >
                      {typeStyle.label}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm leading-tight ${
                            !notification.isRead ? "font-medium" : ""
                          }`}
                        >
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-primary-500 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>

                    {/* Delete button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 h-6 w-6 p-0 text-muted-foreground hover:text-error-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate({
                          notificationId: notification.id,
                        });
                      }}
                    >
                      ✕
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
