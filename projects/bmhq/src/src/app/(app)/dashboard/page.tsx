"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { OrganizationSwitcher } from "@/components/dashboard/organization-switcher";
import { MetricsWidget } from "@/components/dashboard/metrics-widget";
import { ActivityWidget } from "@/components/dashboard/activity-widget";
import { InstalledModulesWidget } from "@/components/dashboard/installed-modules-widget";
import { AIUsageWidget } from "@/components/dashboard/ai-usage-widget";

export default function DashboardPage() {
  const [orgId, setOrgId] = useState<string>("");

  const orgsQuery = trpc.organizations.list.useQuery({});
  const organizations = orgsQuery.data?.data ?? [];

  const currentOrgId = orgId || organizations[0]?.id || "";

  const dashboardQuery = trpc.dashboard.get.useQuery(
    { organizationId: currentOrgId },
    { enabled: !!currentOrgId }
  );

  const data = dashboardQuery.data;

  return (
    <div className="animate-fade-up" style={{ animationFillMode: "both" }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[13px] font-semibold text-white/90">Overview</h2>
        <OrganizationSwitcher
          organizations={organizations}
          currentOrgId={currentOrgId}
          onChange={setOrgId}
        />
      </div>

      {orgsQuery.isLoading || dashboardQuery.isLoading ? (
        <p className="text-[13px] text-white/40">Loading dashboard...</p>
      ) : data ? (
        <div className="space-y-3">
          <MetricsWidget
            metrics={[
              {
                label: "Team Members",
                value: data.metrics.memberCount,
                description: "Active members",
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
                description: "Estimated spend",
              },
            ]}
          />

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ActivityWidget activities={data.recentActivity} />
            </div>
            <div className="space-y-3">
              <AIUsageWidget usage={data.metrics.aiUsage} />
              <InstalledModulesWidget modules={data.installedModules} />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-[13px] text-white/30">
          No data available yet. The dashboard will populate once your
          organization is set up.
        </p>
      )}
    </div>
  );
}
