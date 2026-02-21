"use client";

import { useState } from "react";

type AgentStatus = "active" | "inactive" | "error" | "archived";
type Framework = "n8n" | "crewai" | "langgraph" | "native" | "custom";
type ExecutionStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

interface Agent {
  id: string;
  name: string;
  slug: string;
  description: string;
  framework: Framework;
  connectorId: string | null;
  mcpTools: MCPTool[];
  metadata: Record<string, unknown>;
  tags: string[];
  status: AgentStatus;
  version: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Execution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  cost: number;
}

interface LLMCall {
  id: string;
  provider: string;
  model: string;
  status: "completed" | "failed";
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  latencyMs: number;
  createdAt: string;
}

interface CostDataPoint {
  date: string;
  cost: number;
}

const mockAgent: Agent = {
  id: "1",
  name: "Research Bot",
  slug: "research-bot",
  description: "Web research and data gathering agent. Performs searches, extracts relevant information, and synthesizes findings into structured reports.",
  framework: "native",
  connectorId: null,
  mcpTools: [
    { name: "web_search", description: "Search the web for relevant information", inputSchema: { type: "object", properties: { query: { type: "string" }, maxResults: { type: "number" } } } },
    { name: "extract_content", description: "Extract structured content from a URL", inputSchema: { type: "object", properties: { url: { type: "string" }, selectors: { type: "array" } } } },
    { name: "summarize", description: "Summarize provided text into key points", inputSchema: { type: "object", properties: { text: { type: "string" }, maxLength: { type: "number" } } } },
  ],
  metadata: { provider: "openai", model: "gpt-4", systemPrompt: "You are a research assistant..." },
  tags: ["research", "data", "web-scraping"],
  status: "active",
  version: "1.3.0",
  createdBy: "user-1",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-02-10T14:20:00Z",
};

const mockExecutions: Execution[] = [
  { id: "e1", workflowId: "w1", workflowName: "Content Pipeline", status: "completed", startedAt: "2024-02-10T14:00:00Z", completedAt: "2024-02-10T14:02:30Z", durationMs: 150000, cost: 0.12 },
  { id: "e2", workflowId: "w2", workflowName: "Data Extraction", status: "completed", startedAt: "2024-02-10T13:30:00Z", completedAt: "2024-02-10T13:31:15Z", durationMs: 75000, cost: 0.08 },
  { id: "e3", workflowId: "w1", workflowName: "Content Pipeline", status: "failed", startedAt: "2024-02-10T12:00:00Z", completedAt: "2024-02-10T12:00:45Z", durationMs: 45000, cost: 0.03 },
  { id: "e4", workflowId: "w3", workflowName: "Report Generator", status: "completed", startedAt: "2024-02-09T16:00:00Z", completedAt: "2024-02-09T16:05:00Z", durationMs: 300000, cost: 0.25 },
  { id: "e5", workflowId: "w2", workflowName: "Data Extraction", status: "running", startedAt: "2024-02-10T14:10:00Z", completedAt: null, durationMs: null, cost: 0.0 },
];

const mockLLMCalls: LLMCall[] = [
  { id: "l1", provider: "openai", model: "gpt-4", status: "completed", inputTokens: 1200, outputTokens: 800, totalTokens: 2000, cost: 0.06, latencyMs: 2300, createdAt: "2024-02-10T14:01:00Z" },
  { id: "l2", provider: "openai", model: "gpt-4", status: "completed", inputTokens: 950, outputTokens: 600, totalTokens: 1550, cost: 0.047, latencyMs: 1800, createdAt: "2024-02-10T13:30:30Z" },
  { id: "l3", provider: "openai", model: "gpt-4", status: "failed", inputTokens: 1500, outputTokens: 0, totalTokens: 1500, cost: 0.045, latencyMs: 5000, createdAt: "2024-02-10T12:00:20Z" },
  { id: "l4", provider: "openai", model: "gpt-4", status: "completed", inputTokens: 2000, outputTokens: 1200, totalTokens: 3200, cost: 0.096, latencyMs: 3100, createdAt: "2024-02-09T16:02:00Z" },
  { id: "l5", provider: "openai", model: "gpt-4", status: "completed", inputTokens: 800, outputTokens: 500, totalTokens: 1300, cost: 0.039, latencyMs: 1500, createdAt: "2024-02-09T16:03:00Z" },
];

const mockCostData: CostDataPoint[] = [
  { date: "Feb 4", cost: 0.45 },
  { date: "Feb 5", cost: 0.62 },
  { date: "Feb 6", cost: 0.38 },
  { date: "Feb 7", cost: 0.71 },
  { date: "Feb 8", cost: 0.55 },
  { date: "Feb 9", cost: 0.48 },
  { date: "Feb 10", cost: 0.29 },
];

const statusColors: Record<AgentStatus, string> = {
  active: "bg-success-100 text-success-700",
  inactive: "bg-neutral-100 text-neutral-600",
  error: "bg-error-100 text-error-700",
  archived: "bg-neutral-100 text-neutral-500",
};

const execStatusColors: Record<ExecutionStatus, string> = {
  pending: "bg-neutral-100 text-neutral-600",
  running: "bg-primary-100 text-primary-700",
  completed: "bg-success-100 text-success-700",
  failed: "bg-error-100 text-error-700",
  cancelled: "bg-warning-100 text-warning-700",
};

function Breadcrumb({ agentName }: { agentName: string }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-neutral-500">
      <a href="/registry" className="hover:text-primary-600">Registry</a>
      <span>/</span>
      <span className="text-neutral-900 font-medium">{agentName}</span>
    </nav>
  );
}

function AgentDetailHeader({
  agent,
  onToggleStatus,
}: {
  agent: Agent;
  onToggleStatus: () => void;
}) {
  return (
    <div>
      <Breadcrumb agentName={agent.name} />
      <div className="mt-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-900">{agent.name}</h1>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[agent.status]}`}>
              {agent.status}
            </span>
            <span className="rounded bg-secondary-100 px-2 py-0.5 text-xs font-medium text-secondary-700">
              {agent.framework}
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-neutral-500">{agent.description}</p>
          <div className="mt-3 flex items-center gap-4 text-xs text-neutral-400">
            <span>v{agent.version}</span>
            <span>Created {new Date(agent.createdAt).toLocaleDateString()}</span>
            <span>Updated {new Date(agent.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleStatus}
            className="rounded-md border border-neutral-300 px-4 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            {agent.status === "active" ? "Deactivate" : "Activate"}
          </button>
          <button className="rounded-md border border-neutral-300 px-4 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
            Edit
          </button>
          <button className="rounded-md border border-error-300 px-4 py-1.5 text-sm font-medium text-error-700 hover:bg-error-50">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function AgentDetailTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const tabs = ["Overview", "Executions", "Costs", "Settings"];
  return (
    <div className="border-b border-neutral-200">
      <nav className="flex gap-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab.toLowerCase())}
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
  );
}

function AgentInfoCard({ agent }: { agent: Agent }) {
  const meta = agent.metadata as Record<string, string>;
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-900">Configuration</h3>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-neutral-500">Provider</p>
          <p className="mt-0.5 text-sm text-neutral-900">{meta.provider || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-neutral-500">Model</p>
          <p className="mt-0.5 text-sm text-neutral-900">{meta.model || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-neutral-500">Framework</p>
          <p className="mt-0.5 text-sm text-neutral-900">{agent.framework}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-neutral-500">Version</p>
          <p className="mt-0.5 text-sm text-neutral-900">v{agent.version}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs font-medium text-neutral-500">Tags</p>
          <div className="mt-1 flex gap-1.5">
            {agent.tags.map((tag) => (
              <span key={tag} className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MCPToolItem({ tool, expanded, onToggle }: { tool: MCPTool; expanded: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-neutral-100 last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-neutral-50"
      >
        <div>
          <p className="text-sm font-medium text-neutral-900 font-mono">{tool.name}</p>
          <p className="mt-0.5 text-xs text-neutral-500">{tool.description}</p>
        </div>
        <span className="text-neutral-400">{expanded ? "−" : "+"}</span>
      </button>
      {expanded && (
        <div className="border-t border-neutral-100 bg-neutral-50 px-4 py-3">
          <p className="text-xs font-medium text-neutral-500">Input Schema</p>
          <pre className="mt-1 overflow-x-auto rounded bg-neutral-900 p-3 text-xs text-neutral-100 font-mono">
            {JSON.stringify(tool.inputSchema, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function MCPToolList({ tools }: { tools: MCPTool[] }) {
  const [expandedTool, setExpandedTool] = useState<string | null>(null);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-neutral-900">MCP Tools ({tools.length})</h3>
      </div>
      {tools.map((tool) => (
        <MCPToolItem
          key={tool.name}
          tool={tool}
          expanded={expandedTool === tool.name}
          onToggle={() => setExpandedTool(expandedTool === tool.name ? null : tool.name)}
        />
      ))}
      {tools.length === 0 && (
        <p className="px-4 py-6 text-center text-sm text-neutral-500">No MCP tools configured</p>
      )}
    </div>
  );
}

function AgentOverviewTab({ agent }: { agent: Agent }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AgentInfoCard agent={agent} />
      <MCPToolList tools={agent.mcpTools} />
    </div>
  );
}

function AgentExecutionList({ executions }: { executions: Execution[] }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-neutral-900">Execution History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 text-left">
              <th className="px-4 py-2.5 text-xs font-medium text-neutral-500">Workflow</th>
              <th className="px-4 py-2.5 text-xs font-medium text-neutral-500">Status</th>
              <th className="px-4 py-2.5 text-xs font-medium text-neutral-500">Started</th>
              <th className="px-4 py-2.5 text-xs font-medium text-neutral-500">Duration</th>
              <th className="px-4 py-2.5 text-xs font-medium text-neutral-500 text-right">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {executions.map((exec) => (
              <tr key={exec.id} className="hover:bg-neutral-50">
                <td className="px-4 py-2.5 text-sm text-neutral-900">{exec.workflowName}</td>
                <td className="px-4 py-2.5">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${execStatusColors[exec.status]}`}>
                    {exec.status}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs text-neutral-500">
                  {new Date(exec.startedAt).toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-xs text-neutral-500">
                  {exec.durationMs ? `${(exec.durationMs / 1000).toFixed(1)}s` : "—"}
                </td>
                <td className="px-4 py-2.5 text-xs text-neutral-500 text-right">
                  ${exec.cost.toFixed(3)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {executions.length === 0 && (
        <p className="px-4 py-8 text-center text-sm text-neutral-500">No executions yet</p>
      )}
    </div>
  );
}

function AgentExecutionsTab() {
  return <AgentExecutionList executions={mockExecutions} />;
}

function AgentCostSummary() {
  const totalCost = mockLLMCalls.reduce((sum, c) => sum + c.cost, 0);
  const totalTokens = mockLLMCalls.reduce((sum, c) => sum + c.totalTokens, 0);
  const totalCalls = mockLLMCalls.length;
  const avgLatency = mockLLMCalls.reduce((sum, c) => sum + c.latencyMs, 0) / totalCalls;

  const stats = [
    { label: "Total Cost", value: `$${totalCost.toFixed(3)}` },
    { label: "Total Tokens", value: totalTokens.toLocaleString() },
    { label: "LLM Calls", value: totalCalls.toString() },
    { label: "Avg Latency", value: `${(avgLatency / 1000).toFixed(1)}s` },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-neutral-500">{stat.label}</p>
          <p className="mt-1 text-xl font-semibold text-neutral-900">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

function AgentCostChart({ data }: { data: CostDataPoint[] }) {
  const max = Math.max(...data.map((d) => d.cost));
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-900">Cost Trend (7 days)</h3>
      <div className="mt-4 flex items-end gap-2" style={{ height: 120 }}>
        {data.map((d) => (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t bg-primary-500"
              style={{ height: `${(d.cost / max) * 100}%` }}
            />
            <span className="text-xs text-neutral-500">{d.date.split(" ")[1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LLMCallTable({ calls }: { calls: LLMCall[] }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-neutral-900">LLM Calls</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 text-left">
              <th className="px-4 py-2.5 text-xs font-medium text-neutral-500">Model</th>
              <th className="px-4 py-2.5 text-xs font-medium text-neutral-500">Status</th>
              <th className="px-4 py-2.5 text-xs font-medium text-neutral-500">Tokens</th>
              <th className="px-4 py-2.5 text-xs font-medium text-neutral-500">Latency</th>
              <th className="px-4 py-2.5 text-xs font-medium text-neutral-500 text-right">Cost</th>
              <th className="px-4 py-2.5 text-xs font-medium text-neutral-500">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {calls.map((call) => (
              <tr key={call.id} className="hover:bg-neutral-50">
                <td className="px-4 py-2.5">
                  <span className="text-xs text-neutral-400">{call.provider}/</span>
                  <span className="text-sm text-neutral-900">{call.model}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    call.status === "completed" ? "bg-success-100 text-success-700" : "bg-error-100 text-error-700"
                  }`}>
                    {call.status}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs text-neutral-500">
                  {call.inputTokens} in / {call.outputTokens} out
                </td>
                <td className="px-4 py-2.5 text-xs text-neutral-500">{(call.latencyMs / 1000).toFixed(1)}s</td>
                <td className="px-4 py-2.5 text-xs text-neutral-500 text-right">${call.cost.toFixed(3)}</td>
                <td className="px-4 py-2.5 text-xs text-neutral-400">
                  {new Date(call.createdAt).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AgentCostsTab() {
  return (
    <div className="space-y-6">
      <AgentCostSummary />
      <AgentCostChart data={mockCostData} />
      <LLMCallTable calls={mockLLMCalls} />
    </div>
  );
}

function AgentSettingsForm({ agent }: { agent: Agent }) {
  const [name, setName] = useState(agent.name);
  const [description, setDescription] = useState(agent.description);
  const [version, setVersion] = useState(agent.version);
  const meta = agent.metadata as Record<string, string>;
  const [systemPrompt, setSystemPrompt] = useState(meta.systemPrompt || "");
  const [tags, setTags] = useState(agent.tags.join(", "));

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-900">Agent Settings</h3>
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700">Version</label>
            <input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">Tags (comma-separated)</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">System Prompt</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
            Reset
          </button>
          <button className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function AgentSettingsTab({ agent }: { agent: Agent }) {
  return <AgentSettingsForm agent={agent} />;
}

export default function AgentDetailPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [agent] = useState(mockAgent);

  const handleToggleStatus = () => {
    // Would call API to toggle agent status
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AgentDetailHeader agent={agent} onToggleStatus={handleToggleStatus} />

        <div className="mt-6">
          <AgentDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <div className="mt-6">
          {activeTab === "overview" && <AgentOverviewTab agent={agent} />}
          {activeTab === "executions" && <AgentExecutionsTab />}
          {activeTab === "costs" && <AgentCostsTab />}
          {activeTab === "settings" && <AgentSettingsTab agent={agent} />}
        </div>
      </div>
    </div>
  );
}
