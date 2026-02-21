"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
              <DialogTitle>Notifications</DialogTitle>
              {unreadCount > 0 && (
                <Badge className="text-white/50 text-[10px]">
                  {unreadCount}
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                disabled={markAllReadMutation.isPending}
                onClick={() => markAllReadMutation.mutate({})}
              >
                Mark all read
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="h-px bg-[#1A1A1A] mt-3" />

        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Icons.notifications className="w-6 h-6 text-white/20 mb-3" />
              <p className="text-[13px] text-white/30">
                No notifications yet
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors duration-150 hover:bg-white/[0.03] ${
                    !notification.isRead ? "bg-white/[0.02]" : ""
                  }`}
                  onClick={() => handleClick(notification)}
                >
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-[13px] leading-tight ${
                          !notification.isRead
                            ? "font-medium text-white/90"
                            : "text-white/50"
                        }`}
                      >
                        {notification.title}
                      </p>
                    </div>
                    <p className="text-[11px] text-white/30 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[11px] text-white/20 mt-1">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>

                  {/* Delete button */}
                  <button
                    className="shrink-0 h-6 w-6 flex items-center justify-center rounded-md text-white/20 hover:text-white/40 hover:bg-white/[0.04] transition-colors duration-150"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate({
                        notificationId: notification.id,
                      });
                    }}
                  >
                    <Icons.close className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
