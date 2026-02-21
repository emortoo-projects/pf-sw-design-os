"use client";

import { useState } from "react";

type AgentStatus = "active" | "paused" | "archived";
type ProviderType = "claude" | "openai" | "deepseek" | "openrouter" | "custom";

interface Agent {
  id: string;
  name: string;
  description: string | null;
  provider: ProviderType;
  model: string;
  systemPrompt: string | null;
  configuration: Record<string, unknown> | null;
  version: number;
  status: AgentStatus;
  createdAt: string;
  updatedAt: string;
}

interface AgentFormData {
  name: string;
  description: string;
  provider: ProviderType;
  model: string;
  systemPrompt: string;
}

const statusColors: Record<AgentStatus, string> = {
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  archived: "bg-gray-100 text-gray-800",
};

const providerColors: Record<ProviderType, string> = {
  claude: "bg-purple-100 text-purple-800",
  openai: "bg-green-100 text-green-800",
  deepseek: "bg-blue-100 text-blue-800",
  openrouter: "bg-orange-100 text-orange-800",
  custom: "bg-gray-100 text-gray-800",
};

const mockAgents: Agent[] = [
  { id: "ag1", name: "Research Bot", description: "Performs deep market research and competitive analysis using web search and document analysis", provider: "claude", model: "claude-sonnet-4-5", systemPrompt: "You are a market research analyst...", configuration: { maxTokens: 4096, temperature: 0.3 }, version: 3, status: "active", createdAt: "2026-01-15T10:00:00Z", updatedAt: "2026-02-20T14:30:00Z" },
  { id: "ag2", name: "Code Review", description: "Automated code review agent for pull requests with security and quality checks", provider: "claude", model: "claude-opus-4", systemPrompt: "You are an expert code reviewer...", configuration: { maxTokens: 8192, temperature: 0.1 }, version: 5, status: "active", createdAt: "2026-01-20T09:00:00Z", updatedAt: "2026-02-21T10:15:00Z" },
  { id: "ag3", name: "Data Extractor", description: "Extracts structured data from CRM systems and APIs", provider: "openai", model: "gpt-4-turbo", systemPrompt: "You are a data extraction specialist...", configuration: { maxTokens: 2048, temperature: 0.0 }, version: 2, status: "active", createdAt: "2026-02-01T08:00:00Z", updatedAt: "2026-02-18T16:45:00Z" },
  { id: "ag4", name: "Email Summarizer", description: "Summarizes email threads and generates digest reports", provider: "openai", model: "gpt-4o-mini", systemPrompt: null, configuration: null, version: 1, status: "paused", createdAt: "2026-02-05T11:00:00Z", updatedAt: "2026-02-21T13:55:00Z" },
  { id: "ag5", name: "Report Writer", description: "Generates formatted business reports from raw data and templates", provider: "claude", model: "claude-sonnet-4-5", systemPrompt: "You are a professional report writer...", configuration: { maxTokens: 16384, temperature: 0.5 }, version: 2, status: "active", createdAt: "2026-01-25T14:00:00Z", updatedAt: "2026-02-19T09:20:00Z" },
  { id: "ag6", name: "Customer Support", description: "Handles tier-1 support tickets with auto-triage and response generation", provider: "claude", model: "claude-haiku-4-5", systemPrompt: "You are a helpful customer support agent...", configuration: { maxTokens: 2048, temperature: 0.2 }, version: 4, status: "active", createdAt: "2026-01-10T08:00:00Z", updatedAt: "2026-02-21T13:20:00Z" },
  { id: "ag7", name: "Translation Agent", description: "Translates documentation and content between languages", provider: "deepseek", model: "deepseek-v3", systemPrompt: null, configuration: null, version: 1, status: "active", createdAt: "2026-02-10T10:00:00Z", updatedAt: "2026-02-19T11:30:00Z" },
  { id: "ag8", name: "Slack Notifier", description: "Dispatches formatted notifications to Slack channels", provider: "custom", model: "internal-v1", systemPrompt: null, configuration: { webhookUrl: "https://hooks.slack.com/..." }, version: 1, status: "active", createdAt: "2026-02-12T09:00:00Z", updatedAt: "2026-02-21T12:30:00Z" },
  { id: "ag9", name: "Ops Monitor", description: "Monitors infrastructure health and database backup status", provider: "openai", model: "gpt-4o", systemPrompt: "You are a DevOps monitoring agent...", configuration: { maxTokens: 1024, temperature: 0.0 }, version: 2, status: "active", createdAt: "2026-01-08T08:00:00Z", updatedAt: "2026-02-21T06:00:00Z" },
  { id: "ag10", name: "Legacy Classifier", description: "Old document classification agent (deprecated)", provider: "openrouter", model: "meta-llama/llama-3-70b", systemPrompt: null, configuration: null, version: 1, status: "archived", createdAt: "2025-11-20T10:00:00Z", updatedAt: "2026-01-05T14:00:00Z" },
];

export default function AgentRegistryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [formData, setFormData] = useState<AgentFormData>({
    name: "",
    description: "",
    provider: "claude",
    model: "",
    systemPrompt: "",
  });

  const agents = mockAgents;

  const filteredAgents = agents.filter((agent) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      agent.name.toLowerCase().includes(q) ||
      agent.provider.toLowerCase().includes(q) ||
      agent.model.toLowerCase().includes(q)
    );
  });

  const handleSubmit = () => {
    setShowCreateModal(false);
    setFormData({ name: "", description: "", provider: "claude", model: "", systemPrompt: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agent Registry</h1>
            <p className="mt-1 text-sm text-gray-500">
              Centralized agent management with configuration and version history
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create Agent
          </button>
        </div>

        {/* Search */}
        <div className="mt-6">
          <input
            type="text"
            placeholder="Search agents by name, provider, or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Agent Grid */}
        <div className="mt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className="cursor-pointer rounded-lg border bg-white p-5 shadow-sm transition hover:shadow-md"
                onClick={() => {
                  setSelectedAgent(agent);
                  setShowDetailPanel(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{agent.name}</h3>
                    {agent.description && (
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">{agent.description}</p>
                    )}
                  </div>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[agent.status]}`}>
                    {agent.status}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${providerColors[agent.provider]}`}>
                    {agent.provider}
                  </span>
                  <span className="text-xs text-gray-500">{agent.model}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span>v{agent.version}</span>
                  <span>{new Date(agent.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); }}
                    className="rounded border px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    Clone
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); }}
                    className="rounded border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Agent Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Create Agent</h2>
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
                    placeholder="Agent name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Provider</label>
                    <select
                      value={formData.provider}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value as ProviderType })}
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="claude">Claude</option>
                      <option value="openai">OpenAI</option>
                      <option value="deepseek">DeepSeek</option>
                      <option value="openrouter">OpenRouter</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Model</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="e.g. claude-sonnet-4-5-20250514"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">System Prompt</label>
                  <textarea
                    value={formData.systemPrompt}
                    onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={4}
                    placeholder="You are a helpful assistant..."
                  />
                </div>
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
                  Create Agent
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Agent Detail Panel */}
        {showDetailPanel && selectedAgent && (
          <div className="fixed inset-y-0 right-0 z-50 w-[28rem] overflow-y-auto border-l bg-white shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{selectedAgent.name}</h2>
                <button
                  onClick={() => {
                    setShowDetailPanel(false);
                    setSelectedAgent(null);
                  }}
                  className="rounded-md p-1 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[selectedAgent.status]}`}>
                  {selectedAgent.status}
                </span>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${providerColors[selectedAgent.provider]}`}>
                  {selectedAgent.provider}
                </span>
                <span className="text-xs text-gray-500">v{selectedAgent.version}</span>
              </div>

              <div className="mt-6 space-y-4">
                {selectedAgent.description && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Description</label>
                    <p className="mt-1 text-sm text-gray-700">{selectedAgent.description}</p>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-gray-500">Model</label>
                  <p className="mt-1 text-sm font-mono text-gray-900">{selectedAgent.model}</p>
                </div>
                {selectedAgent.systemPrompt && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">System Prompt</label>
                    <pre className="mt-1 max-h-48 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-700">
                      {selectedAgent.systemPrompt}
                    </pre>
                  </div>
                )}
                {selectedAgent.configuration && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Configuration</label>
                    <pre className="mt-1 max-h-32 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-700">
                      {JSON.stringify(selectedAgent.configuration, null, 2)}
                    </pre>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Created</label>
                    <p className="mt-1 text-sm text-gray-700">
                      {new Date(selectedAgent.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Updated</label>
                    <p className="mt-1 text-sm text-gray-700">
                      {new Date(selectedAgent.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  Edit
                </button>
                <button className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Clone
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
