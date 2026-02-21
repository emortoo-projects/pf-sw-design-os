"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

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
    <div className="animate-fade-up" style={{ animationFillMode: "both" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] text-white/30">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            disabled={markAllReadMutation.isPending}
            onClick={() => markAllReadMutation.mutate({})}
          >
            Mark all as read
          </Button>
        )}
      </div>

      <div className="flex">
        {/* Filter sidebar */}
        <aside className="w-40 pr-4 border-r border-[#1A1A1A] space-y-0.5 shrink-0">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={`w-full text-left flex items-center justify-between px-3 h-8 rounded-md text-[13px] transition-colors duration-150 ${
                filter === f.id
                  ? "bg-white/[0.06] text-white/90"
                  : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
              }`}
              onClick={() => setFilter(f.id)}
            >
              <span>{f.label}</span>
              {f.id === "unread" && unreadCount > 0 && (
                <Badge className="text-white/50 text-[10px]">
                  {unreadCount}
                </Badge>
              )}
            </button>
          ))}
        </aside>

        {/* Notifications list */}
        <main className="flex-1 pl-6">
          {notificationsQuery.isLoading ? (
            <p className="text-[13px] text-white/40">Loading notifications...</p>
          ) : filteredNotifications.length === 0 ? (
            <div className="rounded-lg border border-[#1A1A1A] bg-[#111111] flex flex-col items-center justify-center py-12">
              <Icons.notifications className="w-6 h-6 text-white/20 mb-3" />
              <p className="text-[13px] text-white/30">
                {filter === "all"
                  ? "No notifications yet"
                  : `No ${filter} notifications`}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-lg border border-[#1A1A1A] bg-[#111111] cursor-pointer transition-colors duration-150 hover:bg-white/[0.03] ${
                    !notification.isRead ? "bg-white/[0.02]" : ""
                  }`}
                  onClick={() => handleClick(notification)}
                >
                  <div className="flex items-start gap-3 p-4">
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-[13px] ${
                                !notification.isRead
                                  ? "font-medium text-white/90"
                                  : "text-white/50"
                              }`}
                            >
                              {notification.title}
                            </p>
                            <Badge className="text-white/30 capitalize">
                              {notification.type}
                            </Badge>
                          </div>
                          <p className="text-[13px] text-white/30 mt-0.5">
                            {notification.message}
                          </p>
                        </div>
                        <span className="text-[11px] text-white/20 whitespace-nowrap">
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
