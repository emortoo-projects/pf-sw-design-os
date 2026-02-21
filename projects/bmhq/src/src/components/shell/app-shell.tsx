"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Icons } from "@/components/icons";
import { NotificationsPopover } from "@/components/notifications/notifications-popover";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Icons.dashboard },
  { href: "/modules", label: "Modules", icon: Icons.modules },
  { href: "/settings/ai", label: "AI Config", icon: Icons.aiConfig },
];

const FOOTER_NAV = [
  { href: "/settings", label: "Settings", icon: Icons.settings },
  { href: "/notifications", label: "Notifications", icon: Icons.notifications },
];

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const orgsQuery = trpc.organizations.list.useQuery({});
  const currentOrg = orgsQuery.data?.data?.[0];

  const installedQuery = trpc.installedModules.list.useQuery(
    { organizationId: currentOrg?.id ?? "" },
    { enabled: !!currentOrg?.id }
  );
  const installedModules = installedQuery.data?.data ?? [];

  const notificationsQuery = trpc.notifications.list.useQuery(
    { limit: 1 },
    { refetchInterval: 30000 }
  );
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;

  const breadcrumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((segment, i, arr) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
      href: "/" + arr.slice(0, i + 1).join("/"),
      isLast: i === arr.length - 1,
    }));

  const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0A0A]">
      {/* Sidebar — fixed 190px */}
      <aside className="w-[190px] shrink-0 flex flex-col border-r border-[#1A1A1A] bg-[#0A0A0A]">
        {/* Logo */}
        <div className="h-[46px] flex items-center px-4 border-b border-[#1A1A1A]">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/80 shrink-0">
              B
            </div>
            <span className="text-[13px] font-semibold text-white/90">BMHQ</span>
          </Link>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/30">
            Navigation
          </p>
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 h-8 px-3 rounded-md text-[13px] transition-colors duration-150 ${
                    isActive
                      ? "bg-white/[0.06] text-white/90"
                      : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}

          {/* Installed modules */}
          {installedModules.filter((m) => m.isEnabled).length > 0 && (
            <>
              <div className="h-px bg-[#1A1A1A] my-2" />
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/30">
                Modules
              </p>
              {installedModules
                .filter((m) => m.isEnabled)
                .map((mod) => {
                  const href = `/modules/${mod.moduleSlug}`;
                  const isActive = pathname === href;
                  return (
                    <Link key={mod.id} href={href}>
                      <div
                        className={`flex items-center gap-3 h-8 px-3 rounded-md text-[13px] transition-colors duration-150 ${
                          isActive
                            ? "bg-white/[0.06] text-white/90"
                            : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
                        }`}
                      >
                        <Icons.module className="w-4 h-4 shrink-0" />
                        <span className="truncate">
                          {mod.moduleName ?? mod.moduleSlug}
                        </span>
                      </div>
                    </Link>
                  );
                })}
            </>
          )}
        </nav>

        {/* Footer nav */}
        <div className="px-2 py-2 border-t border-[#1A1A1A] space-y-0.5">
          {FOOTER_NAV.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 h-8 px-3 rounded-md text-[13px] transition-colors duration-150 ${
                    isActive
                      ? "bg-white/[0.06] text-white/90"
                      : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar — 46px */}
        <header className="h-[46px] border-b border-[#1A1A1A] flex items-center justify-between px-4 shrink-0 bg-[#0A0A0A]">
          <div className="flex items-center">
            <span className="text-[13px] font-semibold text-white/90">
              {lastBreadcrumb?.label ?? "Dashboard"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search hint */}
            <div className="flex items-center gap-2 h-7 px-2.5 rounded-md border border-[#1A1A1A] text-white/30 text-[11px]">
              <Icons.search className="w-3.5 h-3.5" />
              <span>Search...</span>
              <kbd className="ml-1 text-[10px] text-white/20 border border-[#1A1A1A] rounded px-1">
                /
              </kbd>
            </div>

            {/* Notifications */}
            <button
              className="relative p-1.5 rounded-md text-white/40 hover:text-white/60 hover:bg-white/[0.03] transition-colors duration-150"
              onClick={() => setNotificationsOpen(true)}
            >
              <Icons.notifications className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 flex items-center justify-center rounded-full bg-white text-black text-[9px] font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Avatar */}
            <div className="h-6 w-6 rounded-md bg-[#111111] border border-[#1A1A1A] flex items-center justify-center text-[10px] font-semibold text-white/50">
              {currentOrg?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
          </div>
        </header>

        {/* Content area — 24px padding */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      {/* Notifications overlay */}
      <NotificationsPopover
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
    </div>
  );
}
