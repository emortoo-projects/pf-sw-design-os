"use client";

import { useState } from "react";

type ExecutionStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
type StepStatus = "pending" | "running" | "completed" | "failed" | "skipped";
type LogLevel = "info" | "warn" | "error" | "debug";

interface ExecutionStep {
  id: string;
  name: string;
  type: "agent" | "condition" | "action" | "parallel";
  status: StepStatus;
  agentName?: string;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  cost: number | null;
  tokens: number | null;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: { message: string; stack: string } | null;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  stepId?: string;
}

interface Execution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: ExecutionStatus;
  triggerType: string;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  totalCost: number;
  totalTokens: number;
  agentCount: number;
}

const mockExecution: Execution = {
  id: "ex-2",
  workflowId: "w1",
  workflowName: "Content Pipeline",
  status: "completed",
  triggerType: "schedule",
  startedAt: "2024-02-10T14:00:00Z",
  completedAt: "2024-02-10T14:02:30Z",
  durationMs: 150000,
  totalCost: 0.12,
  totalTokens: 4500,
  agentCount: 3,
};

const mockSteps: ExecutionStep[] = [
  { id: "s1", name: "Webhook Trigger", type: "action", status: "completed", startedAt: "2024-02-10T14:00:00Z", completedAt: "2024-02-10T14:00:01Z", durationMs: 1000, cost: 0, tokens: 0, input: { method: "POST", path: "/ingest" }, output: { payload: { topic: "AI trends" } } },
  { id: "s2", name: "Research Bot", type: "agent", status: "completed", agentName: "Research Bot", startedAt: "2024-02-10T14:00:01Z", completedAt: "2024-02-10T14:01:00Z", durationMs: 59000, cost: 0.045, tokens: 1800, input: { topic: "AI trends" }, output: { findings: ["...3 key findings..."] } },
  { id: "s3", name: "Data Extractor", type: "agent", status: "completed", agentName: "Data Extractor", startedAt: "2024-02-10T14:00:01Z", completedAt: "2024-02-10T14:00:45Z", durationMs: 44000, cost: 0.035, tokens: 1200, input: { topic: "AI trends" }, output: { structuredData: { entities: 12 } } },
  { id: "s4", name: "Quality Check", type: "condition", status: "completed", startedAt: "2024-02-10T14:01:00Z", completedAt: "2024-02-10T14:01:02Z", durationMs: 2000, cost: 0, tokens: 0, input: { score: 0.92 }, output: { result: "pass" } },
  { id: "s5", name: "Report Writer", type: "agent", status: "completed", agentName: "Report Writer", startedAt: "2024-02-10T14:01:02Z", completedAt: "2024-02-10T14:02:30Z", durationMs: 88000, cost: 0.04, tokens: 1500, input: { findings: ["..."] }, output: { report: "Generated 2500 word report" } },
];

const mockLogs: LogEntry[] = [
  { timestamp: "14:00:00.000", level: "info", message: "Execution started via schedule trigger", stepId: "s1" },
  { timestamp: "14:00:00.500", level: "info", message: "Webhook trigger received payload", stepId: "s1" },
  { timestamp: "14:00:01.000", level: "info", message: "Starting parallel execution: Research Bot, Data Extractor" },
  { timestamp: "14:00:01.100", level: "debug", message: "Research Bot: Sending request to openai/gpt-4", stepId: "s2" },
  { timestamp: "14:00:01.150", level: "debug", message: "Data Extractor: Sending request to openai/gpt-4-turbo", stepId: "s3" },
  { timestamp: "14:00:15.000", level: "info", message: "Research Bot: Received 3 findings", stepId: "s2" },
  { timestamp: "14:00:45.000", level: "info", message: "Data Extractor: Extracted 12 entities", stepId: "s3" },
  { timestamp: "14:01:00.000", level: "info", message: "Research Bot completed (59s, $0.045)", stepId: "s2" },
  { timestamp: "14:01:00.100", level: "info", message: "Evaluating condition: score > 0.8", stepId: "s4" },
  { timestamp: "14:01:02.000", level: "info", message: "Condition passed (score=0.92), routing to Report Writer", stepId: "s4" },
  { timestamp: "14:01:02.100", level: "debug", message: "Report Writer: Starting generation", stepId: "s5" },
  { timestamp: "14:02:30.000", level: "info", message: "Report Writer completed (88s, $0.040)", stepId: "s5" },
  { timestamp: "14:02:30.100", level: "info", message: "Execution completed successfully. Total: 150s, $0.120" },
];

const statusColors: Record<ExecutionStatus | StepStatus, string> = {
  pending: "bg-neutral-100 text-neutral-600",
  running: "bg-primary-100 text-primary-700",
  completed: "bg-success-100 text-success-700",
  failed: "bg-error-100 text-error-700",
  cancelled: "bg-warning-100 text-warning-700",
  skipped: "bg-neutral-100 text-neutral-400",
};

const logLevelColors: Record<LogLevel, string> = {
  info: "text-primary-600",
  warn: "text-warning-600",
  error: "text-error-600",
  debug: "text-neutral-400",
};

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-neutral-500">
      <a href="/executions" className="hover:text-primary-600">Executions</a>
      <span>/</span>
      <span className="text-neutral-900 font-medium">{mockExecution.id}</span>
    </nav>
  );
}

function ExecutionDetailHeader({ execution }: { execution: Execution }) {
  return (
    <div>
      <Breadcrumb />
      <div className="mt-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-900">{execution.workflowName}</h1>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[execution.status]}`}>
              {execution.status}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-neutral-400">
            <span>ID: {execution.id}</span>
            <span>Trigger: {execution.triggerType}</span>
            <span>Started: {new Date(execution.startedAt).toLocaleString()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {(execution.status === "running" || execution.status === "pending") && (
            <button className="rounded-md border border-error-300 px-4 py-1.5 text-sm font-medium text-error-700 hover:bg-error-50">
              Cancel
            </button>
          )}
          {(execution.status === "failed" || execution.status === "cancelled") && (
            <button className="rounded-md bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-700">
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ExecutionSummary({ execution }: { execution: Execution }) {
  const stats = [
    { label: "Duration", value: execution.durationMs ? `${(execution.durationMs / 1000).toFixed(1)}s` : "—" },
    { label: "Total Cost", value: `$${execution.totalCost.toFixed(3)}` },
    { label: "Tokens Used", value: execution.totalTokens.toLocaleString() },
    { label: "Agents", value: execution.agentCount.toString() },
    { label: "Steps", value: mockSteps.length.toString() },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-neutral-500">{stat.label}</p>
          <p className="mt-1 text-xl font-semibold text-neutral-900">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

function TimelineStep({
  step,
  isLast,
  selected,
  onClick,
}: {
  step: ExecutionStep;
  isLast: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`h-3 w-3 rounded-full border-2 ${
          step.status === "completed" ? "border-success-500 bg-success-500" :
          step.status === "running" ? "border-primary-500 bg-primary-500" :
          step.status === "failed" ? "border-error-500 bg-error-500" :
          "border-neutral-300 bg-white"
        }`} />
        {!isLast && <div className="w-px flex-1 bg-neutral-200" />}
      </div>
      <button
        onClick={onClick}
        className={`mb-4 flex-1 rounded-lg border p-3 text-left transition-colors ${
          selected ? "border-primary-300 bg-primary-50" : "border-neutral-200 bg-white hover:border-neutral-300"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-900">{step.name}</span>
            <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${statusColors[step.status]}`}>
              {step.status}
            </span>
          </div>
          <span className="text-xs text-neutral-400">
            {step.durationMs !== null ? `${(step.durationMs / 1000).toFixed(1)}s` : "—"}
          </span>
        </div>
        {step.agentName && <p className="mt-0.5 text-xs text-neutral-500">Agent: {step.agentName}</p>}
        <div className="mt-1 flex gap-3 text-xs text-neutral-400">
          {step.cost !== null && step.cost > 0 && <span>${step.cost.toFixed(3)}</span>}
          {step.tokens !== null && step.tokens > 0 && <span>{step.tokens} tokens</span>}
        </div>
      </button>
    </div>
  );
}

function StepInputOutput({ input, output }: { input?: Record<string, unknown>; output?: Record<string, unknown> }) {
  const [showInput, setShowInput] = useState(true);
  const [showOutput, setShowOutput] = useState(true);

  return (
    <div className="space-y-3">
      {input && (
        <div>
          <button onClick={() => setShowInput(!showInput)} className="flex items-center gap-1 text-xs font-medium text-neutral-700">
            <span>{showInput ? "−" : "+"}</span> Input
          </button>
          {showInput && (
            <pre className="mt-1 overflow-x-auto rounded bg-neutral-900 p-3 text-xs text-neutral-100 font-mono">
              {JSON.stringify(input, null, 2)}
            </pre>
          )}
        </div>
      )}
      {output && (
        <div>
          <button onClick={() => setShowOutput(!showOutput)} className="flex items-center gap-1 text-xs font-medium text-neutral-700">
            <span>{showOutput ? "−" : "+"}</span> Output
          </button>
          {showOutput && (
            <pre className="mt-1 overflow-x-auto rounded bg-neutral-900 p-3 text-xs text-neutral-100 font-mono">
              {JSON.stringify(output, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

function StepDetailPanel({ step }: { step: ExecutionStep | null }) {
  if (!step) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-neutral-200 bg-white p-8">
        <p className="text-sm text-neutral-400">Select a step to view details</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-900">{step.name}</h3>
      <p className="mt-1 text-xs text-neutral-500">Type: {step.type} | Status: {step.status}</p>
      <div className="mt-4">
        <StepInputOutput input={step.input} output={step.output} />
      </div>
      {step.error && (
        <div className="mt-4">
          <p className="text-xs font-medium text-error-700">Error</p>
          <div className="mt-1 rounded bg-error-50 p-3">
            <p className="text-xs text-error-700">{step.error.message}</p>
            <pre className="mt-2 overflow-x-auto text-xs text-error-500 font-mono">{step.error.stack}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

function ExecutionTimelineTab() {
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const selected = mockSteps.find((s) => s.id === selectedStep) ?? null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        {mockSteps.map((step, i) => (
          <TimelineStep
            key={step.id}
            step={step}
            isLast={i === mockSteps.length - 1}
            selected={selectedStep === step.id}
            onClick={() => setSelectedStep(step.id)}
          />
        ))}
      </div>
      <StepDetailPanel step={selected} />
    </div>
  );
}

function LogViewer() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<LogLevel | "all">("all");

  const filtered = mockLogs.filter((log) => {
    if (levelFilter !== "all" && log.level !== levelFilter) return false;
    if (search && !log.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search logs..."
          className="flex-1 rounded-md border border-neutral-300 px-3 py-1 text-xs focus:border-primary-500 focus:outline-none"
        />
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value as LogLevel | "all")}
          className="rounded-md border border-neutral-300 px-2 py-1 text-xs focus:border-primary-500 focus:outline-none"
        >
          <option value="all">All levels</option>
          <option value="info">Info</option>
          <option value="warn">Warn</option>
          <option value="error">Error</option>
          <option value="debug">Debug</option>
        </select>
      </div>
      <div className="max-h-96 overflow-y-auto bg-neutral-950 p-3 font-mono">
        {filtered.map((log, i) => (
          <div key={i} className="flex gap-2 py-0.5 text-xs">
            <span className="text-neutral-500 flex-shrink-0">{log.timestamp}</span>
            <span className={`flex-shrink-0 w-12 ${logLevelColors[log.level]}`}>[{log.level.toUpperCase()}]</span>
            <span className="text-neutral-200">{log.message}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-4 text-center text-xs text-neutral-500">No logs match your filters</p>
        )}
      </div>
    </div>
  );
}

function ExecutionCostTab() {
  const stepCosts = mockSteps.filter((s) => s.cost && s.cost > 0);
  const totalCost = stepCosts.reduce((sum, s) => sum + (s.cost ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-neutral-900">Cost Breakdown by Step</h3>
        <div className="mt-4 space-y-3">
          {stepCosts.map((step) => {
            const pct = totalCost > 0 ? ((step.cost ?? 0) / totalCost) * 100 : 0;
            return (
              <div key={step.id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-700">{step.name}</span>
                  <span className="text-neutral-900 font-medium">${(step.cost ?? 0).toFixed(3)}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-neutral-100">
                  <div className="h-2 rounded-full bg-primary-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-0.5 flex justify-between text-xs text-neutral-400">
                  <span>{step.tokens} tokens</span>
                  <span>{pct.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 border-t border-neutral-200 pt-3 flex justify-between text-sm font-semibold text-neutral-900">
          <span>Total</span>
          <span>${totalCost.toFixed(3)}</span>
        </div>
      </div>
    </div>
  );
}

export default function ExecutionDetailPage() {
  const [activeTab, setActiveTab] = useState("timeline");

  const tabs = ["Timeline", "Logs", "Costs"];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ExecutionDetailHeader execution={mockExecution} />

        <div className="mt-6">
          <ExecutionSummary execution={mockExecution} />
        </div>

        <div className="mt-6 border-b border-neutral-200">
          <nav className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                  activeTab === tab.toLowerCase()
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === "timeline" && <ExecutionTimelineTab />}
          {activeTab === "logs" && <LogViewer />}
          {activeTab === "costs" && <ExecutionCostTab />}
        </div>
      </div>
    </div>
  );
}
