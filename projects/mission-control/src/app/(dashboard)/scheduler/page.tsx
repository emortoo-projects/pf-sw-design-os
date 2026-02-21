"use client";

import { useState } from "react";

type JobStatus = "pending" | "queued" | "running" | "completed" | "failed" | "cancelled" | "paused";
type JobType = "scheduled" | "manual" | "triggered";
type ViewMode = "list" | "calendar";

interface Job {
  id: string;
  name: string;
  description: string | null;
  agentId: string;
  type: JobType;
  cronExpression: string | null;
  status: JobStatus;
  priority: number;
  lastRunAt: string | null;
  nextRunAt: string | null;
  createdAt: string;
}

interface JobExecution {
  id: string;
  jobId: string;
  status: "pending" | "running" | "success" | "failed" | "cancelled";
  errorMessage: string | null;
  duration: number | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

interface JobFormData {
  name: string;
  description: string;
  agentId: string;
  type: JobType;
  cronExpression: string;
  priority: number;
}

const statusColors: Record<JobStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  queued: "bg-blue-100 text-blue-800",
  running: "bg-indigo-100 text-indigo-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
  paused: "bg-orange-100 text-orange-800",
};

const execStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  running: "bg-blue-100 text-blue-800",
  success: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const mockJobs: Job[] = [
  { id: "sj1", name: "Daily Market Report", description: "Generate daily market analysis at 8 AM", agentId: "ag1", type: "scheduled", cronExpression: "0 8 * * *", status: "running", priority: 2, lastRunAt: "2026-02-21T08:00:00Z", nextRunAt: "2026-02-22T08:00:00Z", createdAt: "2026-01-15T10:00:00Z" },
  { id: "sj2", name: "Code Review Pipeline", description: "Triggered on PR creation", agentId: "ag2", type: "triggered", cronExpression: null, status: "completed", priority: 1, lastRunAt: "2026-02-21T14:28:00Z", nextRunAt: null, createdAt: "2026-01-20T09:00:00Z" },
  { id: "sj3", name: "CRM Data Sync", description: "Sync Salesforce records every 3 hours", agentId: "ag3", type: "scheduled", cronExpression: "0 */3 * * *", status: "queued", priority: 0, lastRunAt: "2026-02-21T12:00:00Z", nextRunAt: "2026-02-21T15:00:00Z", createdAt: "2026-02-01T08:00:00Z" },
  { id: "sj4", name: "Email Digest", description: "Send daily email digest at 6 PM", agentId: "ag4", type: "scheduled", cronExpression: "0 18 * * *", status: "pending", priority: 0, lastRunAt: "2026-02-20T18:00:00Z", nextRunAt: "2026-02-21T18:00:00Z", createdAt: "2026-02-01T08:00:00Z" },
  { id: "sj5", name: "Nightly Backup Verification", description: "Verify DB backup integrity at 2 AM", agentId: "ag9", type: "scheduled", cronExpression: "0 2 * * *", status: "completed", priority: 0, lastRunAt: "2026-02-21T02:00:00Z", nextRunAt: "2026-02-22T02:00:00Z", createdAt: "2026-01-10T08:00:00Z" },
  { id: "sj6", name: "Weekly Summary Report", description: "Generate weekly ops summary on Mondays", agentId: "ag5", type: "scheduled", cronExpression: "0 9 * * 1", status: "completed", priority: 1, lastRunAt: "2026-02-17T09:00:00Z", nextRunAt: "2026-02-24T09:00:00Z", createdAt: "2026-01-06T10:00:00Z" },
  { id: "sj7", name: "Competitor Price Check", description: "Monitor competitor pricing every 12 hours", agentId: "ag1", type: "scheduled", cronExpression: "0 */12 * * *", status: "paused", priority: 0, lastRunAt: "2026-02-20T00:00:00Z", nextRunAt: null, createdAt: "2026-02-05T10:00:00Z" },
];

const mockExecutions: JobExecution[] = [
  { id: "ex1", jobId: "sj1", status: "success", errorMessage: null, duration: 45200, startedAt: "2026-02-21T08:00:00Z", completedAt: "2026-02-21T08:00:45Z", createdAt: "2026-02-21T08:00:00Z" },
  { id: "ex2", jobId: "sj1", status: "success", errorMessage: null, duration: 42100, startedAt: "2026-02-20T08:00:00Z", completedAt: "2026-02-20T08:00:42Z", createdAt: "2026-02-20T08:00:00Z" },
  { id: "ex3", jobId: "sj1", status: "failed", errorMessage: "API rate limit exceeded", duration: 12300, startedAt: "2026-02-19T08:00:00Z", completedAt: "2026-02-19T08:00:12Z", createdAt: "2026-02-19T08:00:00Z" },
  { id: "ex4", jobId: "sj2", status: "success", errorMessage: null, duration: 34500, startedAt: "2026-02-21T14:28:00Z", completedAt: "2026-02-21T14:28:34Z", createdAt: "2026-02-21T14:28:00Z" },
];

export default function JobSchedulerPage() {
  const [view, setView] = useState<ViewMode>("list");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    name: "",
    description: "",
    agentId: "",
    type: "scheduled",
    cronExpression: "",
    priority: 0,
  });

  const jobs = mockJobs;
  const executions = mockExecutions.filter((e) => selectedJob && e.jobId === selectedJob.id);

  const handleSubmit = () => {
    setShowCreateModal(false);
    setFormData({ name: "", description: "", agentId: "", type: "scheduled", cronExpression: "", priority: 0 });
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const [calendarDate] = useState(new Date());
  const daysInMonth = getDaysInMonth(calendarDate);
  const firstDay = getFirstDayOfMonth(calendarDate);

  const getJobsForDate = (day: number) => {
    return jobs.filter((job) => {
      if (!job.nextRunAt) return false;
      const d = new Date(job.nextRunAt);
      return d.getDate() === day && d.getMonth() === calendarDate.getMonth();
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Scheduler</h1>
            <p className="mt-1 text-sm text-gray-500">
              Cron-based job scheduler with natural language input
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-md border bg-white">
              <button
                onClick={() => setView("list")}
                className={`px-3 py-1.5 text-sm font-medium ${
                  view === "list" ? "bg-blue-600 text-white rounded-l-md" : "text-gray-700"
                }`}
              >
                List
              </button>
              <button
                onClick={() => setView("calendar")}
                className={`px-3 py-1.5 text-sm font-medium ${
                  view === "calendar" ? "bg-blue-600 text-white rounded-r-md" : "text-gray-700"
                }`}
              >
                Calendar
              </button>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Create Job
            </button>
          </div>
        </div>

        {/* List View */}
        {view === "list" && (
          <div className="mt-8">
            <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Cron</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Next Run</th>
                    <th className="px-6 py-3">Last Run</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{job.name}</p>
                        {job.description && (
                          <p className="text-xs text-gray-500">{job.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm capitalize text-gray-500">{job.type}</td>
                      <td className="px-6 py-4">
                        {job.cronExpression ? (
                          <code className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                            {job.cronExpression}
                          </code>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[job.status]}`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {job.nextRunAt ? new Date(job.nextRunAt).toLocaleString() : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {job.lastRunAt ? new Date(job.lastRunAt).toLocaleString() : "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setShowHistoryModal(true);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          History
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Calendar View */}
        {view === "calendar" && (
          <div className="mt-8 rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              {calendarDate.toLocaleString("default", { month: "long", year: "numeric" })}
            </h2>
            <div className="mt-4 grid grid-cols-7 gap-px bg-gray-200">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="bg-gray-50 px-2 py-2 text-center text-xs font-medium text-gray-500">
                  {day}
                </div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[80px] bg-white" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayJobs = getJobsForDate(day);
                return (
                  <div key={day} className="min-h-[80px] bg-white p-2">
                    <span className="text-sm text-gray-700">{day}</span>
                    <div className="mt-1 space-y-1">
                      {dayJobs.slice(0, 2).map((job) => (
                        <div
                          key={job.id}
                          onClick={() => {
                            setSelectedJob(job);
                            setShowHistoryModal(true);
                          }}
                          className="cursor-pointer truncate rounded bg-blue-50 px-1 py-0.5 text-xs text-blue-700 hover:bg-blue-100"
                        >
                          {job.name}
                        </div>
                      ))}
                      {dayJobs.length > 2 && (
                        <span className="text-xs text-gray-400">+{dayJobs.length - 2} more</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Create/Edit Job Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Create Job</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-md p-1 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Job name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={2}
                    placeholder="Optional description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as JobType })}
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="manual">Manual</option>
                      <option value="triggered">Triggered</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <input
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                {formData.type === "scheduled" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cron Expression</label>
                    <input
                      type="text"
                      value={formData.cronExpression}
                      onChange={(e) => setFormData({ ...formData, cronExpression: e.target.value })}
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="*/5 * * * * (every 5 minutes)"
                    />
                    <p className="mt-1 text-xs text-gray-400">e.g. &quot;every day at noon&quot; or &quot;0 12 * * *&quot;</p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Create Job
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Job History Modal */}
        {showHistoryModal && selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selectedJob.name}</h2>
                  <p className="text-sm text-gray-500">Execution History</p>
                </div>
                <button
                  onClick={() => {
                    setShowHistoryModal(false);
                    setSelectedJob(null);
                  }}
                  className="rounded-md p-1 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-4">
                <div className="mb-4 grid grid-cols-3 gap-4">
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-gray-500">Status</p>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[selectedJob.status]}`}>
                      {selectedJob.status}
                    </span>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="text-sm font-medium capitalize text-gray-900">{selectedJob.type}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-gray-500">Cron</p>
                    <p className="text-sm font-mono text-gray-900">{selectedJob.cronExpression || "-"}</p>
                  </div>
                </div>
                {executions.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">No executions yet</p>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left text-xs font-medium uppercase text-gray-500">
                          <th className="px-4 py-2">Status</th>
                          <th className="px-4 py-2">Started</th>
                          <th className="px-4 py-2">Duration</th>
                          <th className="px-4 py-2">Error</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {executions.map((exec) => (
                          <tr key={exec.id}>
                            <td className="px-4 py-2">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${execStatusColors[exec.status]}`}>
                                {exec.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {exec.startedAt ? new Date(exec.startedAt).toLocaleString() : "-"}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {exec.duration ? `${(exec.duration / 1000).toFixed(1)}s` : "-"}
                            </td>
                            <td className="px-4 py-2 text-sm text-red-500 truncate max-w-[200px]">
                              {exec.errorMessage || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
