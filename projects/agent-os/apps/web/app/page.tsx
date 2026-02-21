"use client";

import { useState } from "react";

type TimeRange = "1h" | "6h" | "24h" | "7d" | "30d";

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: "1h", label: "1 Hour" },
  { value: "6h", label: "6 Hours" },
  { value: "24h", label: "24 Hours" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
];

function DashboardHeader({
  timeRange,
  onTimeRangeChange,
}: {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">
          System overview and real-time metrics
        </p>
      </div>
      <div className="flex items-center gap-3">
        <select
          value={timeRange}
          onChange={(e) => onTimeRangeChange(e.target.value as TimeRange)}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          {timeRanges.map((tr) => (
            <option key={tr.value} value={tr.value}>
              {tr.label}
            </option>
          ))}
        </select>
        <button className="rounded-md bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-700">
          New Workflow
        </button>
      </div>
    </div>
  );
}

function StatsGrid() {
  const stats = [
    { label: "Active Executions", value: "12", change: "+3", trend: "up" },
    { label: "Total Agents", value: "8", change: "+1", trend: "up" },
    { label: "Success Rate", value: "96.5%", change: "+0.8%", trend: "up" },
    { label: "Total Cost (24h)", value: "$4.82", change: "-12%", trend: "down" },
    { label: "Avg Latency", value: "1.2s", change: "-0.3s", trend: "down" },
    { label: "Guardrails Triggered", value: "3", change: "+1", trend: "up" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
        >
          <p className="text-xs font-medium text-neutral-500">{stat.label}</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">{stat.value}</p>
          <p
            className={`mt-1 text-xs font-medium ${
              stat.trend === "up" && stat.label !== "Guardrails Triggered"
                ? "text-success-600"
                : stat.trend === "down" && stat.label === "Total Cost (24h)"
                ? "text-success-600"
                : stat.trend === "down" && stat.label === "Avg Latency"
                ? "text-success-600"
                : "text-neutral-500"
            }`}
          >
            {stat.change}
          </p>
        </div>
      ))}
    </div>
  );
}

function ActivityFeed() {
  const events = [
    {
      id: "1",
      type: "execution",
      message: "Workflow 'Content Pipeline' completed successfully",
      time: "2 min ago",
      status: "success",
    },
    {
      id: "2",
      type: "guardrail",
      message: "Cost cap guardrail triggered on Agent 'Research Bot'",
      time: "5 min ago",
      status: "warning",
    },
    {
      id: "3",
      type: "execution",
      message: "Workflow 'Data Extraction' started",
      time: "8 min ago",
      status: "info",
    },
    {
      id: "4",
      type: "execution",
      message: "Workflow 'Customer Support' failed - timeout",
      time: "12 min ago",
      status: "error",
    },
    {
      id: "5",
      type: "agent",
      message: "Agent 'Code Review' version updated to v1.3",
      time: "15 min ago",
      status: "info",
    },
    {
      id: "6",
      type: "execution",
      message: "Workflow 'Report Generator' completed successfully",
      time: "20 min ago",
      status: "success",
    },
  ];

  const statusColors: Record<string, string> = {
    success: "bg-success-100 text-success-700",
    warning: "bg-warning-100 text-warning-700",
    error: "bg-error-100 text-error-700",
    info: "bg-primary-100 text-primary-700",
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-neutral-900">Recent Activity</h2>
      </div>
      <div className="divide-y divide-neutral-100">
        {events.map((event) => (
          <div key={event.id} className="flex items-start gap-3 px-4 py-3">
            <span
              className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                statusColors[event.status]
              }`}
            >
              {event.type}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-neutral-700">{event.message}</p>
              <p className="mt-0.5 text-xs text-neutral-400">{event.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CostOverviewChart() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const values = [3.20, 4.50, 2.80, 5.10, 4.82, 3.60, 4.20];
  const max = Math.max(...values);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-neutral-900">Cost Trend</h2>
      </div>
      <div className="p-4">
        <div className="flex items-end gap-2" style={{ height: 120 }}>
          {days.map((day, i) => (
            <div key={day} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-primary-500"
                style={{ height: `${(values[i] / max) * 100}%` }}
              />
              <span className="text-xs text-neutral-500">{day}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
          <span>Total: ${values.reduce((a, b) => a + b, 0).toFixed(2)}</span>
          <span>Avg: ${(values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)}/day</span>
        </div>
      </div>
    </div>
  );
}

function AgentStatusWidget() {
  const agents = [
    { name: "Research Bot", status: "active", model: "gpt-4", executions: 45 },
    { name: "Code Review", status: "active", model: "claude-3", executions: 32 },
    { name: "Data Extractor", status: "active", model: "gpt-4-turbo", executions: 28 },
    { name: "Customer Support", status: "error", model: "claude-3", executions: 15 },
    { name: "Report Writer", status: "idle", model: "gpt-4", executions: 8 },
  ];

  const statusBadge: Record<string, string> = {
    active: "bg-success-100 text-success-700",
    error: "bg-error-100 text-error-700",
    idle: "bg-neutral-100 text-neutral-600",
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-neutral-900">Agent Status</h2>
      </div>
      <div className="divide-y divide-neutral-100">
        {agents.map((agent) => (
          <div key={agent.name} className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                  statusBadge[agent.status]
                }`}
              >
                {agent.status}
              </span>
              <span className="text-sm font-medium text-neutral-700">{agent.name}</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-400">{agent.model}</p>
              <p className="text-xs text-neutral-500">{agent.executions} runs</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickActionsPanel() {
  const actions = [
    { label: "Create Agent", icon: "+" },
    { label: "New Workflow", icon: "+" },
    { label: "View Executions", icon: ">" },
    { label: "Add Guardrail", icon: "+" },
  ];

  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-neutral-900">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-2 gap-2 p-4">
        {actions.map((action) => (
          <button
            key={action.label}
            className="flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded bg-primary-100 text-xs font-bold text-primary-600">
              {action.icon}
            </span>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <DashboardHeader timeRange={timeRange} onTimeRangeChange={setTimeRange} />

        <div className="mt-6">
          <StatsGrid />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <CostOverviewChart />
            <ActivityFeed />
          </div>
          <div className="space-y-6">
            <AgentStatusWidget />
            <QuickActionsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
