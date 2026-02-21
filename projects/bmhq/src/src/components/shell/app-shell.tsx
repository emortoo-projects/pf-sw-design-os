"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NotificationsPopover } from "@/components/notifications/notifications-popover";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/modules", label: "Modules" },
  { href: "/settings/ai", label: "AI Config" },
];

const FOOTER_NAV = [
  { href: "/settings", label: "Settings" },
  { href: "/notifications", label: "Notifications" },
];

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Get org context
  const orgsQuery = trpc.organizations.list.useQuery({});
  const currentOrg = orgsQuery.data?.data?.[0];

  // Get installed modules for module switcher
  const installedQuery = trpc.installedModules.list.useQuery(
    { organizationId: currentOrg?.id ?? "" },
    { enabled: !!currentOrg?.id }
  );
  const installedModules = installedQuery.data?.data ?? [];

  // Get notification count
  const notificationsQuery = trpc.notifications.list.useQuery(
    { limit: 1 },
    { refetchInterval: 30000 }
  );
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;

  // Breadcrumbs from pathname
  const breadcrumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((segment, i, arr) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
      href: "/" + arr.slice(0, i + 1).join("/"),
      isLast: i === arr.length - 1,
    }));

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`border-r bg-background flex flex-col shrink-0 transition-all duration-200 ${
          collapsed ? "w-14" : "w-56"
        }`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              B
            </div>
            {!collapsed && (
              <span className="font-heading font-bold text-sm">BMHQ</span>
            )}
          </Link>
        </div>

        {/* Main nav */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {!collapsed && (
            <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Navigation
            </p>
          )}
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={`w-full ${collapsed ? "justify-center px-0" : "justify-start"}`}
                >
                  {collapsed ? item.label.charAt(0) : item.label}
                </Button>
              </Link>
            );
          })}

          {/* Module switcher */}
          {installedModules.length > 0 && (
            <>
              <Separator className="my-2" />
              {!collapsed && (
                <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Installed Modules
                </p>
              )}
              {installedModules
                .filter((m) => m.isEnabled)
                .map((mod) => {
                  const href = `/modules/${mod.moduleSlug}`;
                  const isActive = pathname === href;
                  return (
                    <Link key={mod.id} href={href}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        size="sm"
                        className={`w-full ${collapsed ? "justify-center px-0" : "justify-start"}`}
                      >
                        {collapsed ? (
                          (mod.moduleName ?? "?").charAt(0)
                        ) : (
                          <span className="truncate">
                            {mod.moduleName ?? mod.moduleSlug}
                          </span>
                        )}
                      </Button>
                    </Link>
                  );
                })}
            </>
          )}
        </nav>

        {/* Footer nav */}
        <div className="p-2 border-t space-y-1">
          {FOOTER_NAV.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={`w-full ${collapsed ? "justify-center px-0" : "justify-start"}`}
                >
                  {collapsed ? item.label.charAt(0) : item.label}
                </Button>
              </Link>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            className={`w-full ${collapsed ? "justify-center px-0" : "justify-start"} text-xs text-muted-foreground`}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? "→" : "← Collapse"}
          </Button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground"
              >
                Home
              </Link>
              {breadcrumbs.map((crumb) => (
                <span key={crumb.href} className="flex items-center gap-1">
                  <span className="text-muted-foreground">/</span>
                  {crumb.isLast ? (
                    <span className="font-medium">{crumb.label}</span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Global search */}
            <Input
              placeholder="Search..."
              className="w-48 h-8 text-sm"
              readOnly
            />

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={() => setNotificationsOpen(true)}
            >
              🔔
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Button>

            {/* User avatar */}
            <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
              {currentOrg?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Notifications overlay */}
      <NotificationsPopover
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
    </div>
  );
}
