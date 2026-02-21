"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

const TYPE_STYLES: Record<
  NotificationType,
  { bg: string; text: string; label: string; badge: "default" | "secondary" | "destructive" | "outline" }
> = {
  info: { bg: "bg-primary-100", text: "text-primary-700", label: "i", badge: "default" },
  success: { bg: "bg-success-100", text: "text-success-700", label: "✓", badge: "default" },
  warning: { bg: "bg-warning-100", text: "text-warning-700", label: "!", badge: "secondary" },
  error: { bg: "bg-error-100", text: "text-error-700", label: "✕", badge: "destructive" },
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "info", label: "Info" },
  { id: "success", label: "Success" },
  { id: "warning", label: "Warning" },
  { id: "error", label: "Error" },
] as const;

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

export default function NotificationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");

  const notificationsQuery = trpc.notifications.list.useQuery({});
  const notificationsData = notificationsQuery.data;

  const allNotifications = useMemo(
    () => (notificationsData?.data ?? []) as Notification[],
    [notificationsData?.data]
  );
  const unreadCount = notificationsData?.unreadCount ?? 0;

  const filteredNotifications = useMemo(() => {
    if (filter === "all") return allNotifications;
    if (filter === "unread") return allNotifications.filter((n) => !n.isRead);
    return allNotifications.filter((n) => n.type === filter);
  }, [allNotifications, filter]);

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
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                : "All caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              disabled={markAllReadMutation.isPending}
              onClick={() => markAllReadMutation.mutate({})}
            >
              Mark all as read
            </Button>
          )}
        </div>
      </header>

      <div className="flex">
        {/* Filter sidebar */}
        <aside className="w-48 border-r p-4 space-y-1 shrink-0">
          {FILTERS.map((f) => (
            <Button
              key={f.id}
              variant={filter === f.id ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setFilter(f.id)}
            >
              {f.label}
              {f.id === "unread" && unreadCount > 0 && (
                <Badge variant="default" className="ml-auto text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          ))}
        </aside>

        {/* Notifications list */}
        <main className="flex-1 p-6">
          {notificationsQuery.isLoading ? (
            <p className="text-muted-foreground">Loading notifications...</p>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg mb-3">
                  🔔
                </div>
                <p className="text-sm text-muted-foreground">
                  {filter === "all"
                    ? "No notifications yet"
                    : `No ${filter} notifications`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => {
                const typeStyle =
                  TYPE_STYLES[notification.type as NotificationType] ??
                  TYPE_STYLES.info;

                return (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer transition-shadow hover:shadow-md ${
                      !notification.isRead ? "border-primary-200" : ""
                    }`}
                    onClick={() => handleClick(notification)}
                  >
                    <CardContent className="flex items-start gap-4 py-4">
                      {/* Type icon */}
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${typeStyle.bg} ${typeStyle.text}`}
                      >
                        {typeStyle.label}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <p
                                className={`text-sm ${
                                  !notification.isRead ? "font-medium" : ""
                                }`}
                              >
                                {notification.title}
                              </p>
                              <Badge
                                variant={typeStyle.badge}
                                className="text-xs capitalize"
                              >
                                {notification.type}
                              </Badge>
                              {!notification.isRead && (
                                <div className="h-2 w-2 rounded-full bg-primary-500" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatRelativeTime(notification.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              markReadMutation.mutate({
                                notificationId: notification.id,
                                isRead: true,
                              });
                            }}
                          >
                            Read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-error-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate({
                              notificationId: notification.id,
                            });
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
