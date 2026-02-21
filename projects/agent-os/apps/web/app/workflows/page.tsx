"use client";

import { useState } from "react";

type WorkflowStatus = "draft" | "active" | "paused" | "archived";
type SortOption = "name" | "updatedAt" | "executionCount";

interface Workflow {
  id: string;
  name: string;
  slug: string;
  description: string;
  canvas: { nodes: { id: string; type: string; label: string }[]; edges: { source: string; target: string }[] };
  version: number;
  status: WorkflowStatus;
  tags: string[];
  executionCount: number;
  lastRunAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
}

const mockWorkflows: Workflow[] = [
  {
    id: "w1", name: "Content Pipeline", slug: "content-pipeline", description: "Generate and publish blog content from research topics",
    canvas: { nodes: [{ id: "n1", type: "agent", label: "Research" }, { id: "n2", type: "agent", label: "Write" }, { id: "n3", type: "action", label: "Publish" }], edges: [{ source: "n1", target: "n2" }, { source: "n2", target: "n3" }] },
    version: 3, status: "active", tags: ["content", "publishing"], executionCount: 128, lastRunAt: "2024-02-10T14:00:00Z", createdBy: "user-1", createdAt: "2024-01-10T10:00:00Z", updatedAt: "2024-02-08T16:30:00Z",
  },
  {
    id: "w2", name: "Data Extraction", slug: "data-extraction", description: "Extract structured data from uploaded documents",
    canvas: { nodes: [{ id: "n1", type: "trigger", label: "Upload" }, { id: "n2", type: "agent", label: "Extract" }, { id: "n3", type: "action", label: "Store" }], edges: [{ source: "n1", target: "n2" }, { source: "n2", target: "n3" }] },
    version: 2, status: "active", tags: ["data", "extraction"], executionCount: 89, lastRunAt: "2024-02-10T13:30:00Z", createdBy: "user-1", createdAt: "2024-01-15T09:00:00Z", updatedAt: "2024-02-05T11:00:00Z",
  },
  {
    id: "w3", name: "Report Generator", slug: "report-generator", description: "Generate weekly reports from aggregated metrics",
    canvas: { nodes: [{ id: "n1", type: "trigger", label: "Schedule" }, { id: "n2", type: "agent", label: "Aggregate" }, { id: "n3", type: "agent", label: "Format" }, { id: "n4", type: "action", label: "Email" }], edges: [{ source: "n1", target: "n2" }, { source: "n2", target: "n3" }, { source: "n3", target: "n4" }] },
    version: 1, status: "active", tags: ["reports", "scheduled"], executionCount: 24, lastRunAt: "2024-02-09T08:00:00Z", createdBy: "user-2", createdAt: "2024-02-01T14:00:00Z", updatedAt: "2024-02-07T10:00:00Z",
  },
  {
    id: "w4", name: "Customer Support Triage", slug: "customer-support-triage", description: "Classify and route incoming support tickets",
    canvas: { nodes: [{ id: "n1", type: "trigger", label: "Webhook" }, { id: "n2", type: "agent", label: "Classify" }, { id: "n3", type: "action", label: "Route" }], edges: [{ source: "n1", target: "n2" }, { source: "n2", target: "n3" }] },
    version: 5, status: "paused", tags: ["support", "triage"], executionCount: 342, lastRunAt: "2024-02-08T20:00:00Z", createdBy: "user-1", createdAt: "2024-01-05T08:00:00Z", updatedAt: "2024-02-08T20:15:00Z",
  },
  {
    id: "w5", name: "Code Review Pipeline", slug: "code-review-pipeline", description: "Automated code review for pull requests",
    canvas: { nodes: [{ id: "n1", type: "trigger", label: "PR Hook" }, { id: "n2", type: "agent", label: "Review" }, { id: "n3", type: "action", label: "Comment" }], edges: [{ source: "n1", target: "n2" }, { source: "n2", target: "n3" }] },
    version: 1, status: "draft", tags: ["code", "review"], executionCount: 0, lastRunAt: null, createdBy: "user-2", createdAt: "2024-02-09T16:00:00Z", updatedAt: "2024-02-09T16:00:00Z",
  },
  {
    id: "w6", name: "Email Summarizer", slug: "email-summarizer", description: "Summarize daily email threads and surface action items",
    canvas: { nodes: [{ id: "n1", type: "trigger", label: "Schedule" }, { id: "n2", type: "agent", label: "Fetch" }, { id: "n3", type: "agent", label: "Summarize" }], edges: [{ source: "n1", target: "n2" }, { source: "n2", target: "n3" }] },
    version: 2, status: "active", tags: ["email", "productivity"], executionCount: 56, lastRunAt: "2024-02-10T07:00:00Z", createdBy: "user-1", createdAt: "2024-01-20T12:00:00Z", updatedAt: "2024-02-06T09:00:00Z",
  },
];

const mockTemplates: Template[] = [
  { id: "t1", name: "Blank Workflow", description: "Start from scratch" },
  { id: "t2", name: "Agent Pipeline", description: "Sequential agent processing" },
  { id: "t3", name: "Webhook Handler", description: "Process incoming webhooks" },
  { id: "t4", name: "Scheduled Report", description: "Generate periodic reports" },
];

const statusColors: Record<WorkflowStatus, string> = {
  draft: "bg-neutral-100 text-neutral-600",
  active: "bg-success-100 text-success-700",
  paused: "bg-warning-100 text-warning-700",
  archived: "bg-neutral-100 text-neutral-500",
};

const nodeColors: Record<string, string> = {
  trigger: "bg-warning-400",
  agent: "bg-primary-400",
  action: "bg-accent-400",
};

function WorkflowsHeader({
  searchQuery,
  onSearchChange,
  onCreateWorkflow,
}: {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onCreateWorkflow: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Workflows</h1>
        <p className="mt-1 text-sm text-neutral-500">Create and manage agent orchestration workflows</p>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search workflows..."
          className="w-64 rounded-md border border-neutral-300 px-3 py-1.5 text-sm placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <button
          onClick={onCreateWorkflow}
          className="rounded-md bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          Create Workflow
        </button>
      </div>
    </div>
  );
}

function WorkflowFilters({
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
}: {
  statusFilter: WorkflowStatus | "all";
  onStatusChange: (s: WorkflowStatus | "all") => void;
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
}) {
  const allStatuses: (WorkflowStatus | "all")[] = ["all", "draft", "active", "paused", "archived"];

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        {allStatuses.map((st) => (
          <button
            key={st}
            onClick={() => onStatusChange(st)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
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
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="rounded-md border border-neutral-300 px-3 py-1 text-xs focus:border-primary-500 focus:outline-none"
      >
        <option value="updatedAt">Recently updated</option>
        <option value="name">Name</option>
        <option value="executionCount">Most runs</option>
      </select>
    </div>
  );
}

function WorkflowThumbnail({ canvas }: { canvas: Workflow["canvas"] }) {
  const nodeCount = canvas.nodes.length;
  const nodeWidth = Math.min(24, 80 / nodeCount);

  return (
    <div className="flex items-center justify-center gap-1 rounded bg-neutral-50 px-3 py-4">
      {canvas.nodes.map((node, i) => (
        <div key={node.id} className="flex items-center gap-1">
          <div
            className={`rounded ${nodeColors[node.type] || "bg-neutral-300"}`}
            style={{ width: nodeWidth, height: nodeWidth }}
            title={node.label}
          />
          {i < canvas.nodes.length - 1 && (
            <div className="h-px w-3 bg-neutral-300" />
          )}
        </div>
      ))}
    </div>
  );
}

function WorkflowCard({
  workflow,
  onEdit,
  onExecute,
  onDelete,
}: {
  workflow: Workflow;
  onEdit: () => void;
  onExecute: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <WorkflowThumbnail canvas={workflow.canvas} />
      <div className="p-4">
        <div className="flex items-start justify-between">
          <a href={`/workflows/${workflow.id}`} className="text-sm font-semibold text-neutral-900 hover:text-primary-600">
            {workflow.name}
          </a>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[workflow.status]}`}>
            {workflow.status}
          </span>
        </div>
        <p className="mt-1 text-xs text-neutral-500 line-clamp-2">{workflow.description}</p>
        <div className="mt-3 flex items-center gap-2">
          {workflow.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500">
              {tag}
            </span>
          ))}
          <span className="text-xs text-neutral-400">v{workflow.version}</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <span>{workflow.executionCount} runs</span>
            {workflow.lastRunAt && (
              <span>Last: {new Date(workflow.lastRunAt).toLocaleDateString()}</span>
            )}
          </div>
          <div className="flex gap-1">
            <button onClick={onExecute} title="Execute" className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
            <button onClick={onEdit} title="Edit" className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button onClick={onDelete} title="Delete" className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-error-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplatePicker({
  templates,
  selected,
  onSelect,
}: {
  templates: Template[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {templates.map((tmpl) => (
        <button
          key={tmpl.id}
          onClick={() => onSelect(tmpl.id)}
          className={`rounded-md border p-3 text-left transition-colors ${
            selected === tmpl.id
              ? "border-primary-500 bg-primary-50"
              : "border-neutral-200 hover:border-neutral-300"
          }`}
        >
          <p className="text-sm font-medium text-neutral-900">{tmpl.name}</p>
          <p className="mt-0.5 text-xs text-neutral-500">{tmpl.description}</p>
        </button>
      ))}
    </div>
  );
}

function CreateWorkflowDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-neutral-900">Create Workflow</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Workflow"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this workflow do?"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">Start from template</label>
            <div className="mt-2">
              <TemplatePicker templates={mockTemplates} selected={selectedTemplate} onSelect={setSelectedTemplate} />
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
            Cancel
          </button>
          <button onClick={onClose} className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowsListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("updatedAt");
  const [showCreate, setShowCreate] = useState(false);

  const filtered = mockWorkflows
    .filter((wf) => {
      if (search && !wf.name.toLowerCase().includes(search.toLowerCase()) && !wf.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "all" && wf.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "executionCount") return b.executionCount - a.executionCount;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <WorkflowsHeader searchQuery={search} onSearchChange={setSearch} onCreateWorkflow={() => setShowCreate(true)} />

        <div className="mt-6">
          <WorkflowFilters statusFilter={statusFilter} onStatusChange={setStatusFilter} sortBy={sortBy} onSortChange={setSortBy} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((wf) => (
            <WorkflowCard
              key={wf.id}
              workflow={wf}
              onEdit={() => {}}
              onExecute={() => {}}
              onDelete={() => {}}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-12 text-center text-sm text-neutral-500">No workflows match your filters</p>
        )}
      </div>

      <CreateWorkflowDialog open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
