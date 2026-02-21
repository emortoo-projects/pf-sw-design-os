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

  const stats = {
    totalActivities: 1284,
    totalCost: 487.52,
    activeAgents: 12,
    unreadAlerts: 3,
  };

  const activities = [
    { id: "a1", agentName: "Research Bot", type: "Agent Run", status: "completed", createdAt: "2026-02-21T14:32:00Z" },
    { id: "a2", agentName: "Code Review", type: "Job Execution", status: "running", createdAt: "2026-02-21T14:28:00Z" },
    { id: "a3", agentName: "Data Extractor", type: "Agent Run", status: "completed", createdAt: "2026-02-21T14:15:00Z" },
    { id: "a4", agentName: "Email Summarizer", type: "Webhook", status: "failed", createdAt: "2026-02-21T13:55:00Z" },
    { id: "a5", agentName: "Report Writer", type: "Agent Run", status: "pending", createdAt: "2026-02-21T13:40:00Z" },
  ];

  const budgets = [
    { id: "b1", name: "Monthly Total", limit: "1000.00", currentSpend: "487.52", period: "monthly" },
    { id: "b2", name: "Research Bot Cap", limit: "200.00", currentSpend: "168.45", period: "monthly" },
    { id: "b3", name: "Code Review Cap", limit: "150.00", currentSpend: "94.20", period: "monthly" },
  ];

  const alerts = [
    { id: "al1", title: "Budget threshold reached (80%)", severity: "warning", status: "unread", createdAt: "2026-02-21T14:10:00Z" },
    { id: "al2", title: "Email Summarizer agent failed", severity: "error", status: "unread", createdAt: "2026-02-21T13:55:00Z" },
    { id: "al3", title: "API credential expiring in 7 days", severity: "info", status: "unread", createdAt: "2026-02-21T12:00:00Z" },
    { id: "al4", title: "Job stuck for over 30 minutes", severity: "critical", status: "read", createdAt: "2026-02-21T10:30:00Z" },
  ];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Overview of your AI agent operations
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50"
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
            onViewAll={() => {}}
          />

          {/* Budget Widget */}
          <DashboardBudgetWidget
            budgets={budgets}
            onManageBudgets={() => {}}
          />
        </div>

        {/* Alerts Section */}
        <div className="mt-8">
          <AlertSummary
            alerts={alerts}
            unreadCount={stats.unreadAlerts}
            onViewAll={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
