"use client";

import { useState } from "react";

type AgentStatus = "active" | "inactive" | "error";
type Framework = "n8n" | "crewai" | "langgraph" | "native" | "custom";

interface Agent {
  id: string;
  name: string;
  description: string;
  provider: string;
  model: string;
  framework: Framework;
  status: AgentStatus;
  tags: string[];
  executionCount: number;
  createdAt: string;
}

const mockAgents: Agent[] = [
  { id: "1", name: "Research Bot", description: "Web research and data gathering", provider: "openai", model: "gpt-4", framework: "native", status: "active", tags: ["research", "data"], executionCount: 245, createdAt: "2024-01-15" },
  { id: "2", name: "Code Reviewer", description: "Automated code review and suggestions", provider: "anthropic", model: "claude-3-opus", framework: "native", status: "active", tags: ["code", "review"], executionCount: 189, createdAt: "2024-01-20" },
  { id: "3", name: "Data Extractor", description: "Extract structured data from documents", provider: "openai", model: "gpt-4-turbo", framework: "crewai", status: "active", tags: ["extraction", "data"], executionCount: 156, createdAt: "2024-02-01" },
  { id: "4", name: "Support Agent", description: "Customer support ticket handling", provider: "anthropic", model: "claude-3-sonnet", framework: "langgraph", status: "error", tags: ["support", "tickets"], executionCount: 98, createdAt: "2024-02-10" },
  { id: "5", name: "Report Writer", description: "Generate reports from data sources", provider: "openai", model: "gpt-4", framework: "n8n", status: "inactive", tags: ["reports", "writing"], executionCount: 67, createdAt: "2024-02-15" },
  { id: "6", name: "Email Classifier", description: "Classify and route incoming emails", provider: "openai", model: "gpt-3.5-turbo", framework: "native", status: "active", tags: ["email", "classification"], executionCount: 312, createdAt: "2024-01-10" },
];

const frameworks: Framework[] = ["native", "n8n", "crewai", "langgraph", "custom"];
const statuses: AgentStatus[] = ["active", "inactive", "error"];

function RegistryHeader({
  search,
  onSearchChange,
  onCreateClick,
  onImportClick,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  onCreateClick: () => void;
  onImportClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Agent Registry</h1>
        <p className="mt-1 text-sm text-neutral-500">Browse and manage all registered agents</p>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search agents..."
          className="w-64 rounded-md border border-neutral-300 px-3 py-1.5 text-sm placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <button
          onClick={onImportClick}
          className="rounded-md border border-neutral-300 px-4 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Import Agent
        </button>
        <button
          onClick={onCreateClick}
          className="rounded-md bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          Create Agent
        </button>
      </div>
    </div>
  );
}

function RegistryFilters({
  selectedFrameworks,
  onFrameworkToggle,
  selectedStatuses,
  onStatusToggle,
}: {
  selectedFrameworks: Set<Framework>;
  onFrameworkToggle: (f: Framework) => void;
  selectedStatuses: Set<AgentStatus>;
  onStatusToggle: (s: AgentStatus) => void;
}) {
  return (
    <div className="w-48 flex-shrink-0 space-y-6">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Framework</h3>
        <div className="mt-2 space-y-1">
          {frameworks.map((fw) => (
            <label key={fw} className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={selectedFrameworks.has(fw)}
                onChange={() => onFrameworkToggle(fw)}
                className="rounded border-neutral-300"
              />
              {fw}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Status</h3>
        <div className="mt-2 space-y-1">
          {statuses.map((st) => (
            <label key={st} className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={selectedStatuses.has(st)}
                onChange={() => onStatusToggle(st)}
                className="rounded border-neutral-300"
              />
              {st}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const statusColors: Record<AgentStatus, string> = {
    active: "bg-success-100 text-success-700",
    inactive: "bg-neutral-100 text-neutral-600",
    error: "bg-error-100 text-error-700",
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-semibold text-neutral-900">{agent.name}</h3>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[agent.status]}`}>
          {agent.status}
        </span>
      </div>
      <p className="mt-1 text-xs text-neutral-500">{agent.description}</p>
      <div className="mt-3 flex items-center gap-2">
        <span className="rounded bg-secondary-100 px-1.5 py-0.5 text-xs font-medium text-secondary-700">
          {agent.framework}
        </span>
        <span className="text-xs text-neutral-400">{agent.provider}/{agent.model}</span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-1">
          {agent.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500">
              {tag}
            </span>
          ))}
        </div>
        <span className="text-xs text-neutral-400">{agent.executionCount} runs</span>
      </div>
    </div>
  );
}

function CreateAgentDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-neutral-900">Create Agent</h2>
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700">Provider</label>
              <select value={provider} onChange={(e) => setProvider(e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none">
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">Model</label>
              <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="gpt-4" className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">System Prompt</label>
            <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">Cancel</button>
          <button onClick={onClose} className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Create</button>
        </div>
      </div>
    </div>
  );
}

function ImportAgentDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [framework, setFramework] = useState("n8n");
  const [connectorUrl, setConnectorUrl] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-neutral-900">Import Agent</h2>
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700">Framework</label>
            <select value={framework} onChange={(e) => setFramework(e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none">
              <option value="n8n">n8n</option>
              <option value="crewai">CrewAI</option>
              <option value="langgraph">LangGraph</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">Connector URL</label>
            <input value={connectorUrl} onChange={(e) => setConnectorUrl(e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">Cancel</button>
          <button onClick={onClose} className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Import</button>
        </div>
      </div>
    </div>
  );
}

export default function AgentRegistryPage() {
  const [search, setSearch] = useState("");
  const [selectedFrameworks, setSelectedFrameworks] = useState<Set<Framework>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<AgentStatus>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const toggleFramework = (fw: Framework) => {
    setSelectedFrameworks((prev) => {
      const next = new Set(prev);
      if (next.has(fw)) next.delete(fw); else next.add(fw);
      return next;
    });
  };

  const toggleStatus = (st: AgentStatus) => {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(st)) next.delete(st); else next.add(st);
      return next;
    });
  };

  const filtered = mockAgents.filter((agent) => {
    if (search && !agent.name.toLowerCase().includes(search.toLowerCase()) && !agent.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedFrameworks.size > 0 && !selectedFrameworks.has(agent.framework)) return false;
    if (selectedStatuses.size > 0 && !selectedStatuses.has(agent.status)) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <RegistryHeader search={search} onSearchChange={setSearch} onCreateClick={() => setShowCreate(true)} onImportClick={() => setShowImport(true)} />

        <div className="mt-8 flex gap-8">
          <RegistryFilters
            selectedFrameworks={selectedFrameworks}
            onFrameworkToggle={toggleFramework}
            selectedStatuses={selectedStatuses}
            onStatusToggle={toggleStatus}
          />

          <div className="flex-1">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paged.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
            {paged.length === 0 && (
              <p className="py-12 text-center text-sm text-neutral-500">No agents match your filters</p>
            )}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-50">
                  Previous
                </button>
                <span className="text-sm text-neutral-500">
                  Page {page} of {totalPages}
                </span>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-50">
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateAgentDialog open={showCreate} onClose={() => setShowCreate(false)} />
      <ImportAgentDialog open={showImport} onClose={() => setShowImport(false)} />
    </div>
  );
}
