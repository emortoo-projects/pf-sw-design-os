"use client";

import { useState, useCallback } from "react";
import { StatisticsCards } from "@/components/dashboard/statistics-cards";
import { DashboardActivityFeed } from "@/components/dashboard/activity-feed";
import { DashboardBudgetWidget } from "@/components/dashboard/budget-widget";
import { AlertSummary } from "@/components/dashboard/alert-summary";

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Placeholder data - will be replaced with tRPC queries
  const stats = {
    totalActivities: 0,
    totalCost: 0,
    activeAgents: 0,
    unreadAlerts: 0,
  };

  const activities: Array<{
    id: string;
    agentName: string;
    type: string;
    status: string;
    createdAt: string;
  }> = [];

  const budgets: Array<{
    id: string;
    name: string;
    limit: string;
    currentSpend: string;
    period: string;
  }> = [];

  const alerts: Array<{
    id: string;
    title: string;
    severity: string;
    status: string;
    createdAt: string;
  }> = [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Overview of your AI agent operations
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="mt-8">
          <StatisticsCards stats={stats} />
        </div>

        {/* Main Content Grid */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Activity Feed */}
          <DashboardActivityFeed
            activities={activities}
            onViewAll={() => {
              // Navigate to activities page
            }}
          />

          {/* Budget Widget */}
          <DashboardBudgetWidget
            budgets={budgets}
            onManageBudgets={() => {
              // Navigate to budgets page
            }}
          />
        </div>

        {/* Alerts Section */}
        <div className="mt-8">
          <AlertSummary
            alerts={alerts}
            unreadCount={stats.unreadAlerts}
            onViewAll={() => {
              // Navigate to alerts page
            }}
          />
        </div>
      </div>
    </div>
  );
}
