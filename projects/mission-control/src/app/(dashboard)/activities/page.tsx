"use client";

import { useState } from "react";

type ActivityStatus = "completed" | "running" | "failed" | "pending";
type ActivityType = "agent_run" | "job_execution" | "webhook_delivery" | "manual";

interface Activity {
  id: string;
  agentId: string;
  agentName: string;
  type: ActivityType;
  status: ActivityStatus;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  duration: number | null;
  cost: string | null;
  createdAt: string;
}

const statusColors: Record<ActivityStatus, string> = {
  completed: "bg-green-100 text-green-800",
  running: "bg-blue-100 text-blue-800",
  failed: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
};

const typeLabels: Record<ActivityType, string> = {
  agent_run: "Agent Run",
  job_execution: "Job Execution",
  webhook_delivery: "Webhook",
  manual: "Manual",
};

export default function ActivityTimelinePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<ActivityType | "all">("all");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  // Placeholder - will be connected to tRPC
  const activities: Activity[] = [];
  const loading = false;

  const filteredActivities = activities.filter((activity) => {
    if (statusFilter !== "all" && activity.status !== statusFilter) return false;
    if (typeFilter !== "all" && activity.type !== typeFilter) return false;
    if (search && !activity.agentName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Timeline</h1>
          <p className="mt-1 text-sm text-gray-500">
            Real-time feed of all agent actions and executions
          </p>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Search by agent name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ActivityStatus | "all")}
            className="rounded-md border px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="running">Running</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ActivityType | "all")}
            className="rounded-md border px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="agent_run">Agent Run</option>
            <option value="job_execution">Job Execution</option>
            <option value="webhook_delivery">Webhook</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        {/* Activity List */}
        <div className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg border bg-gray-100" />
              ))}
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="rounded-lg border bg-white px-6 py-12 text-center">
              <p className="text-sm text-gray-500">No activities found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => setSelectedActivity(activity)}
                  className="cursor-pointer rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-gray-900">{activity.agentName}</p>
                        <p className="text-xs text-gray-500">{typeLabels[activity.type]}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {activity.cost && (
                        <span className="text-sm text-gray-500">${activity.cost}</span>
                      )}
                      {activity.duration && (
                        <span className="text-sm text-gray-500">{activity.duration}ms</span>
                      )}
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[activity.status]}`}
                      >
                        {activity.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(activity.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedActivity && (
          <div className="fixed inset-y-0 right-0 z-50 w-96 overflow-y-auto border-l bg-white shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Activity Details</h2>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="rounded-md p-1 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500">Agent</label>
                  <p className="text-sm text-gray-900">{selectedActivity.agentName}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Type</label>
                  <p className="text-sm text-gray-900">{typeLabels[selectedActivity.type]}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Status</label>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[selectedActivity.status]}`}
                  >
                    {selectedActivity.status}
                  </span>
                </div>
                {selectedActivity.input && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Input</label>
                    <pre className="mt-1 max-h-40 overflow-auto rounded bg-gray-50 p-2 text-xs">
                      {JSON.stringify(selectedActivity.input, null, 2)}
                    </pre>
                  </div>
                )}
                {selectedActivity.output && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Output</label>
                    <pre className="mt-1 max-h-40 overflow-auto rounded bg-gray-50 p-2 text-xs">
                      {JSON.stringify(selectedActivity.output, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
