"use client";

import { useState } from "react";

type ExecutionStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
type TimeRange = "1h" | "24h" | "7d" | "30d";
type TriggerType = "manual" | "webhook" | "schedule" | "api";

interface Execution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: ExecutionStatus;
  triggerType: TriggerType;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  cost: number | null;
  tokenCount: number | null;
  agentCount: number;
}

const mockExecutions: Execution[] = [
  { id: "ex-1", workflowId: "w1", workflowName: "Content Pipeline", status: "running", triggerType: "schedule", startedAt: "2024-02-10T14:10:00Z", completedAt: null, durationMs: null, cost: null, tokenCount: null, agentCount: 3 },
  { id: "ex-2", workflowId: "w1", workflowName: "Content Pipeline", status: "completed", triggerType: "schedule", startedAt: "2024-02-10T14:00:00Z", completedAt: "2024-02-10T14:02:30Z", durationMs: 150000, cost: 0.12, tokenCount: 4500, agentCount: 3 },
  { id: "ex-3", workflowId: "w2", workflowName: "Data Extraction", status: "completed", triggerType: "webhook", startedAt: "2024-02-10T13:30:00Z", completedAt: "2024-02-10T13:31:15Z", durationMs: 75000, cost: 0.08, tokenCount: 2800, agentCount: 2 },
  { id: "ex-4", workflowId: "w4", workflowName: "Customer Support Triage", status: "failed", triggerType: "webhook", startedAt: "2024-02-10T12:00:00Z", completedAt: "2024-02-10T12:00:45Z", durationMs: 45000, cost: 0.03, tokenCount: 1200, agentCount: 2 },
  { id: "ex-5", workflowId: "w3", workflowName: "Report Generator", status: "completed", triggerType: "schedule", startedAt: "2024-02-09T16:00:00Z", completedAt: "2024-02-09T16:05:00Z", durationMs: 300000, cost: 0.25, tokenCount: 8500, agentCount: 3 },
  { id: "ex-6", workflowId: "w6", workflowName: "Email Summarizer", status: "completed", triggerType: "schedule", startedAt: "2024-02-09T08:00:00Z", completedAt: "2024-02-09T08:01:30Z", durationMs: 90000, cost: 0.06, tokenCount: 2100, agentCount: 2 },
  { id: "ex-7", workflowId: "w2", workflowName: "Data Extraction", status: "completed", triggerType: "api", startedAt: "2024-02-09T10:00:00Z", completedAt: "2024-02-09T10:01:00Z", durationMs: 60000, cost: 0.07, tokenCount: 2500, agentCount: 2 },
  { id: "ex-8", workflowId: "w1", workflowName: "Content Pipeline", status: "cancelled", triggerType: "manual", startedAt: "2024-02-08T15:00:00Z", completedAt: "2024-02-08T15:00:30Z", durationMs: 30000, cost: 0.02, tokenCount: 600, agentCount: 1 },
  { id: "ex-9", workflowId: "w5", workflowName: "Code Review Pipeline", status: "pending", triggerType: "webhook", startedAt: "2024-02-10T14:15:00Z", completedAt: null, durationMs: null, cost: null, tokenCount: null, agentCount: 0 },
  { id: "ex-10", workflowId: "w3", workflowName: "Report Generator", status: "completed", triggerType: "schedule", startedAt: "2024-02-08T16:00:00Z", completedAt: "2024-02-08T16:04:30Z", durationMs: 270000, cost: 0.22, tokenCount: 7800, agentCount: 3 },
];

const statusColors: Record<ExecutionStatus, string> = {
  pending: "bg-neutral-100 text-neutral-600",
  running: "bg-primary-100 text-primary-700",
  completed: "bg-success-100 text-success-700",
  failed: "bg-error-100 text-error-700",
  cancelled: "bg-warning-100 text-warning-700",
};

const triggerLabels: Record<TriggerType, string> = {
  manual: "Manual",
  webhook: "Webhook",
  schedule: "Schedule",
  api: "API",
};

function ExecutionsHeader({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Executions</h1>
        <p className="mt-1 text-sm text-neutral-500">Monitor and manage workflow executions</p>
      </div>
      <button
        onClick={onRefresh}
        className="rounded-md border border-neutral-300 px-4 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
      >
        Refresh
      </button>
    </div>
  );
}

function ExecutionFilters({
  statusFilter,
  onStatusChange,
  workflowFilter,
  onWorkflowChange,
  timeRange,
  onTimeRangeChange,
}: {
  statusFilter: ExecutionStatus | "all";
  onStatusChange: (s: ExecutionStatus | "all") => void;
  workflowFilter: string;
  onWorkflowChange: (w: string) => void;
  timeRange: TimeRange;
  onTimeRangeChange: (t: TimeRange) => void;
}) {
  const allStatuses: (ExecutionStatus | "all")[] = ["all", "pending", "running", "completed", "failed", "cancelled"];
  const workflows = Array.from(new Set(mockExecutions.map((e) => e.workflowName)));

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex gap-1">
        {allStatuses.map((st) => (
          <button
            key={st}
            onClick={() => onStatusChange(st)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              statusFilter === st
                ? "bg-primary-100 text-primary-700"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {st === "all" ? "All" : st.charAt(0).toUpperCase() + st.slice(1)}
          </button>
        ))}
      </div>
      <select
        value={workflowFilter}
        onChange={(e) => onWorkflowChange(e.target.value)}
        className="rounded-md border border-neutral-300 px-3 py-1 text-xs focus:border-primary-500 focus:outline-none"
      >
        <option value="all">All Workflows</option>
        {workflows.map((wf) => (
          <option key={wf} value={wf}>{wf}</option>
        ))}
      </select>
      <select
        value={timeRange}
        onChange={(e) => onTimeRangeChange(e.target.value as TimeRange)}
        className="rounded-md border border-neutral-300 px-3 py-1 text-xs focus:border-primary-500 focus:outline-none"
      >
        <option value="1h">Last hour</option>
        <option value="24h">Last 24 hours</option>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
      </select>
    </div>
  );
}

function ExecutionStatusCell({ status }: { status: ExecutionStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[status]}`}>
      {status === "running" && <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary-500" />}
      {status}
    </span>
  );
}

function formatDuration(ms: number | null): string {
  if (ms === null) return "—";
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
}

function ExecutionTable({
  executions,
  onCancel,
}: {
  executions: Execution[];
  onCancel: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 text-left">
              <th className="px-4 py-3 text-xs font-medium text-neutral-500">Workflow</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-500">Status</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-500">Trigger</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-500">Started</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-500">Duration</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-500">Agents</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-500 text-right">Cost</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-500 text-right">Tokens</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {executions.map((exec) => (
              <tr key={exec.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <a href={`/executions/${exec.id}`} className="text-sm font-medium text-neutral-900 hover:text-primary-600">
                    {exec.workflowName}
                  </a>
                  <p className="text-xs text-neutral-400">{exec.id}</p>
                </td>
                <td className="px-4 py-3">
                  <ExecutionStatusCell status={exec.status} />
                </td>
                <td className="px-4 py-3 text-xs text-neutral-500">{triggerLabels[exec.triggerType]}</td>
                <td className="px-4 py-3 text-xs text-neutral-500">
                  {new Date(exec.startedAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-xs text-neutral-500">
                  {formatDuration(exec.durationMs)}
                </td>
                <td className="px-4 py-3 text-xs text-neutral-500">{exec.agentCount}</td>
                <td className="px-4 py-3 text-xs text-neutral-500 text-right">
                  {exec.cost !== null ? `$${exec.cost.toFixed(3)}` : "—"}
                </td>
                <td className="px-4 py-3 text-xs text-neutral-500 text-right">
                  {exec.tokenCount !== null ? exec.tokenCount.toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  {(exec.status === "running" || exec.status === "pending") && (
                    <button
                      onClick={() => onCancel(exec.id)}
                      className="rounded px-2 py-1 text-xs font-medium text-error-600 hover:bg-error-50"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {executions.length === 0 && (
        <p className="px-4 py-12 text-center text-sm text-neutral-500">No executions match your filters</p>
      )}
    </div>
  );
}

function ExecutionPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-sm text-neutral-500">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}

export default function ExecutionsListPage() {
  const [statusFilter, setStatusFilter] = useState<ExecutionStatus | "all">("all");
  const [workflowFilter, setWorkflowFilter] = useState("all");
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = mockExecutions.filter((exec) => {
    if (statusFilter !== "all" && exec.status !== statusFilter) return false;
    if (workflowFilter !== "all" && exec.workflowName !== workflowFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ExecutionsHeader onRefresh={() => {}} />

        <div className="mt-6">
          <ExecutionFilters
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            workflowFilter={workflowFilter}
            onWorkflowChange={setWorkflowFilter}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </div>

        <div className="mt-6">
          <ExecutionTable executions={paged} onCancel={() => {}} />
        </div>

        <div className="mt-6">
          <ExecutionPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
