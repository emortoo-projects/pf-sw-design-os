"use client";

import { useState } from "react";

type GuardrailType = "cost_cap" | "token_limit" | "rate_limit" | "approval_required" | "timeout";
type GuardrailScope = "workspace" | "workflow" | "agent";
type GuardrailAction = "block" | "warn" | "notify" | "kill";
type EventAction = "blocked" | "warned" | "notified" | "killed";

interface Guardrail {
  id: string;
  name: string;
  type: GuardrailType;
  scope: GuardrailScope;
  targetId: string | null;
  targetName: string | null;
  action: GuardrailAction;
  config: Record<string, unknown>;
  enabled: boolean;
  triggeredCount: number;
  lastTriggeredAt: string | null;
}

interface GuardrailEvent {
  id: string;
  guardrailName: string;
  action: EventAction;
  reason: string;
  executionId: string;
  createdAt: string;
}

const mockGuardrails: Guardrail[] = [
  { id: "g1", name: "Workspace Daily Cost Cap", type: "cost_cap", scope: "workspace", targetId: null, targetName: null, action: "block", config: { maxCost: 50, period: "daily" }, enabled: true, triggeredCount: 3, lastTriggeredAt: "2024-02-09T23:45:00Z" },
  { id: "g2", name: "Agent Token Limit", type: "token_limit", scope: "agent", targetId: "a1", targetName: "Research Bot", action: "warn", config: { maxTokens: 100000, period: "hourly" }, enabled: true, triggeredCount: 12, lastTriggeredAt: "2024-02-10T13:30:00Z" },
  { id: "g3", name: "API Rate Limit", type: "rate_limit", scope: "workspace", targetId: null, targetName: null, action: "block", config: { maxRequests: 1000, windowMinutes: 60 }, enabled: true, triggeredCount: 1, lastTriggeredAt: "2024-02-08T16:00:00Z" },
  { id: "g4", name: "High-Cost Approval", type: "approval_required", scope: "workflow", targetId: "w1", targetName: "Content Pipeline", action: "block", config: { costThreshold: 1.0 }, enabled: true, triggeredCount: 5, lastTriggeredAt: "2024-02-10T11:00:00Z" },
  { id: "g5", name: "Agent Timeout", type: "timeout", scope: "agent", targetId: "a4", targetName: "Customer Support", action: "kill", config: { timeoutSeconds: 30 }, enabled: true, triggeredCount: 8, lastTriggeredAt: "2024-02-10T12:00:00Z" },
  { id: "g6", name: "Workflow Cost Cap", type: "cost_cap", scope: "workflow", targetId: "w3", targetName: "Report Generator", action: "notify", config: { maxCost: 5, period: "per_execution" }, enabled: false, triggeredCount: 0, lastTriggeredAt: null },
];

const mockEvents: GuardrailEvent[] = [
  { id: "ge1", guardrailName: "Agent Token Limit", action: "warned", reason: "Research Bot exceeded 100K tokens/hour (used: 105,200)", executionId: "ex-2", createdAt: "2024-02-10T13:30:00Z" },
  { id: "ge2", guardrailName: "Agent Timeout", action: "killed", reason: "Customer Support agent timed out after 30s", executionId: "ex-4", createdAt: "2024-02-10T12:00:00Z" },
  { id: "ge3", guardrailName: "High-Cost Approval", action: "blocked", reason: "Content Pipeline execution cost estimated $1.20 > $1.00 threshold", executionId: "ex-6", createdAt: "2024-02-10T11:00:00Z" },
  { id: "ge4", guardrailName: "Workspace Daily Cost Cap", action: "blocked", reason: "Daily workspace cost $48.50 approaching $50 cap", executionId: "ex-8", createdAt: "2024-02-09T23:45:00Z" },
  { id: "ge5", guardrailName: "API Rate Limit", action: "blocked", reason: "1,000 requests/hour limit reached", executionId: "ex-10", createdAt: "2024-02-08T16:00:00Z" },
];

const typeLabels: Record<GuardrailType, string> = {
  cost_cap: "Cost Cap",
  token_limit: "Token Limit",
  rate_limit: "Rate Limit",
  approval_required: "Approval Required",
  timeout: "Timeout",
};

const typeColors: Record<GuardrailType, string> = {
  cost_cap: "bg-warning-100 text-warning-700",
  token_limit: "bg-primary-100 text-primary-700",
  rate_limit: "bg-secondary-100 text-secondary-700",
  approval_required: "bg-accent-100 text-accent-700",
  timeout: "bg-error-100 text-error-700",
};

const actionColors: Record<GuardrailAction | EventAction, string> = {
  block: "text-error-700",
  blocked: "text-error-700",
  warn: "text-warning-700",
  warned: "text-warning-700",
  notify: "text-primary-700",
  notified: "text-primary-700",
  kill: "text-error-700",
  killed: "text-error-700",
};

function GuardrailsHeader({
  filter,
  onFilterChange,
  onCreateClick,
}: {
  filter: string;
  onFilterChange: (f: string) => void;
  onCreateClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Guardrails</h1>
        <p className="mt-1 text-sm text-neutral-500">Configure safety guardrails for cost, rate, and execution limits</p>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder="Search guardrails..."
          className="w-56 rounded-md border border-neutral-300 px-3 py-1.5 text-sm placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <button
          onClick={onCreateClick}
          className="rounded-md bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          Create Guardrail
        </button>
      </div>
    </div>
  );
}

function GuardrailConfig({ guardrail }: { guardrail: Guardrail }) {
  const config = guardrail.config;
  const entries = Object.entries(config).map(([key, value]) => {
    const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
    return { label, value: String(value) };
  });

  return (
    <div className="flex gap-4">
      {entries.map((entry) => (
        <div key={entry.label}>
          <p className="text-xs text-neutral-500">{entry.label}</p>
          <p className="text-sm font-medium text-neutral-900">{entry.value}</p>
        </div>
      ))}
    </div>
  );
}

function GuardrailCard({
  guardrail,
  onToggle,
  onDelete,
}: {
  guardrail: Guardrail;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={`rounded-lg border bg-white p-4 shadow-sm ${guardrail.enabled ? "border-neutral-200" : "border-neutral-100 opacity-60"}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[guardrail.type]}`}>
            {typeLabels[guardrail.type]}
          </span>
          <h3 className="text-sm font-semibold text-neutral-900">{guardrail.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className={`relative h-5 w-9 rounded-full transition-colors ${guardrail.enabled ? "bg-primary-500" : "bg-neutral-300"}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${guardrail.enabled ? "translate-x-4" : ""}`} />
          </button>
          <button onClick={onDelete} className="rounded p-1 text-neutral-400 hover:text-error-600">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-neutral-500">
        <span>Scope: <span className="font-medium text-neutral-700">{guardrail.scope}</span></span>
        {guardrail.targetName && <span>Target: <span className="font-medium text-neutral-700">{guardrail.targetName}</span></span>}
        <span>Action: <span className={`font-medium ${actionColors[guardrail.action]}`}>{guardrail.action}</span></span>
      </div>

      <div className="mt-3">
        <GuardrailConfig guardrail={guardrail} />
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-neutral-400">
        <span>Triggered {guardrail.triggeredCount} times</span>
        {guardrail.lastTriggeredAt && (
          <span>Last: {new Date(guardrail.lastTriggeredAt).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
}

function GuardrailEventsPanel({ events }: { events: GuardrailEvent[] }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-neutral-900">Recent Events</h3>
      </div>
      <div className="divide-y divide-neutral-100 max-h-[600px] overflow-y-auto">
        {events.map((event) => (
          <div key={event.id} className="px-4 py-3">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${actionColors[event.action]}`}>{event.action}</span>
              <span className="text-xs font-medium text-neutral-700">{event.guardrailName}</span>
            </div>
            <p className="mt-1 text-xs text-neutral-500">{event.reason}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
              <span>{new Date(event.createdAt).toLocaleString()}</span>
              <span>Execution: {event.executionId}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CreateGuardrailDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [type, setType] = useState<GuardrailType>("cost_cap");
  const [name, setName] = useState("");
  const [scope, setScope] = useState<GuardrailScope>("workspace");
  const [action, setAction] = useState<GuardrailAction>("block");

  if (!open) return null;

  const types: GuardrailType[] = ["cost_cap", "token_limit", "rate_limit", "approval_required", "timeout"];
  const scopes: GuardrailScope[] = ["workspace", "workflow", "agent"];
  const actions: GuardrailAction[] = ["block", "warn", "notify", "kill"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-neutral-900">Create Guardrail</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700">Type</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                    type === t ? "border-primary-500 bg-primary-50 text-primary-700" : "border-neutral-200 text-neutral-700 hover:border-neutral-300"
                  }`}
                >
                  {typeLabels[t]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Daily Cost Cap"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700">Scope</label>
              <select value={scope} onChange={(e) => setScope(e.target.value as GuardrailScope)} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none">
                {scopes.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">Action</label>
              <select value={action} onChange={(e) => setAction(e.target.value as GuardrailAction)} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none">
                {actions.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          {type === "cost_cap" && (
            <div>
              <label className="block text-sm font-medium text-neutral-700">Max Cost ($)</label>
              <input type="number" placeholder="50" className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
          )}
          {type === "token_limit" && (
            <div>
              <label className="block text-sm font-medium text-neutral-700">Max Tokens</label>
              <input type="number" placeholder="100000" className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
          )}
          {type === "rate_limit" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700">Max Requests</label>
                <input type="number" placeholder="1000" className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">Window (min)</label>
                <input type="number" placeholder="60" className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
              </div>
            </div>
          )}
          {type === "timeout" && (
            <div>
              <label className="block text-sm font-medium text-neutral-700">Timeout (seconds)</label>
              <input type="number" placeholder="30" className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
          )}
          {type === "approval_required" && (
            <div>
              <label className="block text-sm font-medium text-neutral-700">Cost Threshold ($)</label>
              <input type="number" placeholder="1.00" step="0.01" className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">Cancel</button>
          <button onClick={onClose} className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Create</button>
        </div>
      </div>
    </div>
  );
}

export default function GuardrailsPage() {
  const [filter, setFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const filtered = mockGuardrails.filter((g) => {
    if (filter && !g.name.toLowerCase().includes(filter.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <GuardrailsHeader filter={filter} onFilterChange={setFilter} onCreateClick={() => setShowCreate(true)} />

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {filtered.map((g) => (
              <GuardrailCard key={g.id} guardrail={g} onToggle={() => {}} onDelete={() => {}} />
            ))}
            {filtered.length === 0 && (
              <p className="py-12 text-center text-sm text-neutral-500">No guardrails match your search</p>
            )}
          </div>
          <GuardrailEventsPanel events={mockEvents} />
        </div>
      </div>

      <CreateGuardrailDialog open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
