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

const mockActivities: Activity[] = [
  { id: "act-1", agentId: "ag1", agentName: "Research Bot", type: "agent_run", status: "completed", input: { query: "market analysis Q1 2026" }, output: { summary: "Report generated", pages: 12 }, duration: 45200, cost: "0.82", createdAt: "2026-02-21T14:32:00Z" },
  { id: "act-2", agentId: "ag2", agentName: "Code Review", type: "job_execution", status: "running", input: { repo: "frontend-app", pr: 142 }, output: null, duration: null, cost: "0.35", createdAt: "2026-02-21T14:28:00Z" },
  { id: "act-3", agentId: "ag3", agentName: "Data Extractor", type: "agent_run", status: "completed", input: { source: "salesforce", records: 500 }, output: { extracted: 487, errors: 13 }, duration: 12800, cost: "0.18", createdAt: "2026-02-21T14:15:00Z" },
  { id: "act-4", agentId: "ag4", agentName: "Email Summarizer", type: "webhook_delivery", status: "failed", input: { emails: 25 }, output: null, duration: 3200, cost: "0.04", createdAt: "2026-02-21T13:55:00Z" },
  { id: "act-5", agentId: "ag5", agentName: "Report Writer", type: "agent_run", status: "pending", input: { template: "quarterly-review" }, output: null, duration: null, cost: null, createdAt: "2026-02-21T13:40:00Z" },
  { id: "act-6", agentId: "ag6", agentName: "Customer Support", type: "agent_run", status: "completed", input: { tickets: 8 }, output: { resolved: 6, escalated: 2 }, duration: 28400, cost: "0.52", createdAt: "2026-02-21T13:20:00Z" },
  { id: "act-7", agentId: "ag1", agentName: "Research Bot", type: "manual", status: "completed", input: { topic: "competitor pricing" }, output: { findings: 15 }, duration: 62100, cost: "1.14", createdAt: "2026-02-21T12:45:00Z" },
  { id: "act-8", agentId: "ag7", agentName: "Slack Notifier", type: "webhook_delivery", status: "completed", input: { channel: "#ops-alerts" }, output: { delivered: true }, duration: 820, cost: "0.01", createdAt: "2026-02-21T12:30:00Z" },
  { id: "act-9", agentId: "ag2", agentName: "Code Review", type: "job_execution", status: "completed", input: { repo: "api-service", pr: 89 }, output: { comments: 4, approved: true }, duration: 34500, cost: "0.67", createdAt: "2026-02-21T11:50:00Z" },
  { id: "act-10", agentId: "ag3", agentName: "Data Extractor", type: "agent_run", status: "failed", input: { source: "hubspot", records: 1200 }, output: null, duration: 5600, cost: "0.09", createdAt: "2026-02-21T11:15:00Z" },
];

export default function ActivityTimelinePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<ActivityType | "all">("all");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const activities = mockActivities;

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
          {filteredActivities.length === 0 ? (
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
                        <span className="text-sm text-gray-500">{(activity.duration / 1000).toFixed(1)}s</span>
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
                {selectedActivity.duration && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Duration</label>
                    <p className="text-sm text-gray-900">{(selectedActivity.duration / 1000).toFixed(1)}s</p>
                  </div>
                )}
                {selectedActivity.cost && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Cost</label>
                    <p className="text-sm text-gray-900">${selectedActivity.cost}</p>
                  </div>
                )}
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
