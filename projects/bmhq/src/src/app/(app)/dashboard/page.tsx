"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { OrganizationSwitcher } from "@/components/dashboard/organization-switcher";
import { MetricsWidget } from "@/components/dashboard/metrics-widget";
import { ActivityWidget } from "@/components/dashboard/activity-widget";
import { InstalledModulesWidget } from "@/components/dashboard/installed-modules-widget";
import { AIUsageWidget } from "@/components/dashboard/ai-usage-widget";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  const [orgId, setOrgId] = useState<string>("");

  const orgsQuery = trpc.organizations.list.useQuery({});
  const organizations = orgsQuery.data?.data ?? [];

  // Auto-select first org
  const currentOrgId = orgId || organizations[0]?.id || "";

  const dashboardQuery = trpc.dashboard.get.useQuery(
    { organizationId: currentOrgId },
    { enabled: !!currentOrgId }
  );

  const data = dashboardQuery.data;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Overview of your organization
            </p>
          </div>
          <OrganizationSwitcher
            organizations={organizations}
            currentOrgId={currentOrgId}
            onChange={setOrgId}
          />
        </div>
      </header>

      <main className="p-6 space-y-6">
        {!currentOrgId ? (
          <p className="text-muted-foreground">
            No organization found. Create one to get started.
          </p>
        ) : dashboardQuery.isLoading ? (
          <p className="text-muted-foreground">Loading dashboard...</p>
        ) : dashboardQuery.isError ? (
          <p className="text-sm text-error-500">
            Failed to load dashboard data
          </p>
        ) : data ? (
          <>
            <MetricsWidget
              metrics={[
                {
                  label: "Team Members",
                  value: data.metrics.memberCount,
                  description: "Active members in organization",
                },
                {
                  label: "Installed Modules",
                  value: data.metrics.installedModuleCount,
                  description: "Enabled modules",
                },
                {
                  label: "AI Requests",
                  value: data.metrics.aiUsage.totalRequests,
                  description: "Total API calls",
                },
                {
                  label: "AI Cost",
                  value: `$${data.metrics.aiUsage.totalCost.toFixed(2)}`,
                  description: "Estimated total spend",
                },
              ]}
            />

            <Separator />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ActivityWidget activities={data.recentActivity} />
              </div>
              <div className="space-y-6">
                <AIUsageWidget usage={data.metrics.aiUsage} />
                <InstalledModulesWidget modules={data.installedModules} />
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
