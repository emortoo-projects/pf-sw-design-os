"use client";

import { useState } from "react";

type JobStatus = "pending" | "queued" | "running" | "completed" | "failed" | "cancelled" | "paused";
type JobAction = "cancel" | "retry" | "pause" | "resume";

interface Job {
  id: string;
  name: string;
  description: string | null;
  agentId: string;
  type: string;
  status: JobStatus;
  priority: number;
  lastRunAt: string | null;
  nextRunAt: string | null;
  createdAt: string;
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

const statusTabs: JobStatus[] = ["pending", "queued", "running", "completed", "failed", "cancelled", "paused"];

const mockJobs: Job[] = [
  { id: "j1", name: "Research: Market Analysis", description: "Weekly market analysis report generation", agentId: "ag1", type: "scheduled", status: "running", priority: 2, lastRunAt: "2026-02-21T14:00:00Z", nextRunAt: null, createdAt: "2026-02-14T10:00:00Z" },
  { id: "j2", name: "Code Review: PR #142", description: "Automated code review for frontend PR", agentId: "ag2", type: "triggered", status: "running", priority: 1, lastRunAt: "2026-02-21T14:28:00Z", nextRunAt: null, createdAt: "2026-02-21T14:28:00Z" },
  { id: "j3", name: "Data Sync: Salesforce", description: "Extract and sync CRM records", agentId: "ag3", type: "scheduled", status: "queued", priority: 0, lastRunAt: "2026-02-21T12:00:00Z", nextRunAt: "2026-02-21T15:00:00Z", createdAt: "2026-02-10T09:00:00Z" },
  { id: "j4", name: "Email Digest Generation", description: "Generate daily email digest summary", agentId: "ag4", type: "scheduled", status: "pending", priority: 0, lastRunAt: "2026-02-20T18:00:00Z", nextRunAt: "2026-02-21T18:00:00Z", createdAt: "2026-02-01T08:00:00Z" },
  { id: "j5", name: "Quarterly Report", description: "Generate Q1 quarterly business report", agentId: "ag5", type: "manual", status: "pending", priority: 3, lastRunAt: null, nextRunAt: null, createdAt: "2026-02-21T13:40:00Z" },
  { id: "j6", name: "Support Ticket Triage", description: "Auto-triage incoming support tickets", agentId: "ag6", type: "triggered", status: "completed", priority: 1, lastRunAt: "2026-02-21T13:20:00Z", nextRunAt: null, createdAt: "2026-02-21T13:15:00Z" },
  { id: "j7", name: "Competitor Price Monitor", description: "Track competitor pricing changes", agentId: "ag1", type: "scheduled", status: "completed", priority: 0, lastRunAt: "2026-02-21T12:45:00Z", nextRunAt: "2026-02-22T12:00:00Z", createdAt: "2026-02-05T10:00:00Z" },
  { id: "j8", name: "HubSpot Data Extract", description: "Extract contacts from HubSpot CRM", agentId: "ag3", type: "scheduled", status: "failed", priority: 0, lastRunAt: "2026-02-21T11:15:00Z", nextRunAt: "2026-02-21T15:15:00Z", createdAt: "2026-02-08T11:00:00Z" },
  { id: "j9", name: "Translation Batch", description: "Translate documentation to 5 languages", agentId: "ag7", type: "manual", status: "paused", priority: 0, lastRunAt: "2026-02-20T16:30:00Z", nextRunAt: null, createdAt: "2026-02-20T14:00:00Z" },
  { id: "j10", name: "Slack Alert Dispatch", description: "Send ops alerts to Slack channels", agentId: "ag8", type: "triggered", status: "completed", priority: 1, lastRunAt: "2026-02-21T12:30:00Z", nextRunAt: null, createdAt: "2026-02-21T12:30:00Z" },
  { id: "j11", name: "Nightly DB Backup Check", description: "Verify nightly database backup completed", agentId: "ag9", type: "scheduled", status: "completed", priority: 0, lastRunAt: "2026-02-21T06:00:00Z", nextRunAt: "2026-02-22T06:00:00Z", createdAt: "2026-01-15T10:00:00Z" },
  { id: "j12", name: "Old Job Cleanup", description: "Clean up completed jobs older than 30 days", agentId: "ag9", type: "scheduled", status: "cancelled", priority: 0, lastRunAt: "2026-02-15T04:00:00Z", nextRunAt: null, createdAt: "2026-01-10T08:00:00Z" },
];

export default function TaskQueuePage() {
  const [activeStatus, setActiveStatus] = useState<JobStatus>("running");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const jobs = mockJobs;

  const statusCounts: Record<JobStatus, number> = {
    pending: jobs.filter((j) => j.status === "pending").length,
    queued: jobs.filter((j) => j.status === "queued").length,
    running: jobs.filter((j) => j.status === "running").length,
    completed: jobs.filter((j) => j.status === "completed").length,
    failed: jobs.filter((j) => j.status === "failed").length,
    cancelled: jobs.filter((j) => j.status === "cancelled").length,
    paused: jobs.filter((j) => j.status === "paused").length,
  };

  const filteredJobs = jobs.filter((j) => j.status === activeStatus);

  const handleAction = (_jobId: string, _action: JobAction) => {
    // Will connect to tRPC mutation
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task Queue</h1>
            <p className="mt-1 text-sm text-gray-500">
              Visual queue manager showing pending, running, and completed jobs
            </p>
          </div>
          <button className="rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {statusTabs.map((status) => (
            <div
              key={status}
              className={`cursor-pointer rounded-lg border p-3 text-center transition ${
                activeStatus === status ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "bg-white hover:bg-gray-50"
              }`}
              onClick={() => setActiveStatus(status)}
            >
              <p className="text-2xl font-bold text-gray-900">{statusCounts[status]}</p>
              <p className="text-xs capitalize text-gray-500">{status}</p>
            </div>
          ))}
        </div>

        {/* Status Tabs */}
        <div className="mt-6 flex gap-1 overflow-x-auto border-b">
          {statusTabs.map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`whitespace-nowrap px-4 py-2 text-sm font-medium capitalize ${
                activeStatus === status
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {status}
              {statusCounts[status] > 0 && (
                <span className="ml-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                  {statusCounts[status]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Queue List */}
        <div className="mt-6">
          {filteredJobs.length === 0 ? (
            <div className="rounded-lg border bg-white px-6 py-12 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="mt-3 text-sm font-medium text-gray-900">No {activeStatus} jobs</p>
              <p className="mt-1 text-xs text-gray-500">Jobs with this status will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className="cursor-pointer rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{job.name}</p>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[job.status]}`}>
                          {job.status}
                        </span>
                        {job.priority > 0 && (
                          <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-700">
                            P{job.priority}
                          </span>
                        )}
                      </div>
                      {job.description && (
                        <p className="mt-1 text-xs text-gray-500">{job.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {(activeStatus === "running" || activeStatus === "queued") && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(job.id, "cancel");
                          }}
                          className="rounded-md border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                        >
                          Cancel
                        </button>
                      )}
                      {activeStatus === "failed" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(job.id, "retry");
                          }}
                          className="rounded-md border px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                        >
                          Retry
                        </button>
                      )}
                      {activeStatus === "running" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(job.id, "pause");
                          }}
                          className="rounded-md border px-2 py-1 text-xs text-orange-600 hover:bg-orange-50"
                        >
                          Pause
                        </button>
                      )}
                      {activeStatus === "paused" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(job.id, "resume");
                          }}
                          className="rounded-md border px-2 py-1 text-xs text-green-600 hover:bg-green-50"
                        >
                          Resume
                        </button>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(job.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Job Detail Sidebar */}
        {selectedJob && (
          <div className="fixed inset-y-0 right-0 z-50 w-96 overflow-y-auto border-l bg-white shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Job Details</h2>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="rounded-md p-1 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500">Name</label>
                  <p className="text-sm font-medium text-gray-900">{selectedJob.name}</p>
                </div>
                {selectedJob.description && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Description</label>
                    <p className="text-sm text-gray-700">{selectedJob.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Status</label>
                    <span className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[selectedJob.status]}`}>
                      {selectedJob.status}
                    </span>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Type</label>
                    <p className="mt-1 text-sm capitalize text-gray-900">{selectedJob.type}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Priority</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedJob.priority}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Created</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedJob.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {selectedJob.lastRunAt && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Last Run</label>
                    <p className="text-sm text-gray-900">{new Date(selectedJob.lastRunAt).toLocaleString()}</p>
                  </div>
                )}
                {selectedJob.nextRunAt && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Next Run</label>
                    <p className="text-sm text-gray-900">{new Date(selectedJob.nextRunAt).toLocaleString()}</p>
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
