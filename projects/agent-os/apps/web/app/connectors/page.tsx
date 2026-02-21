"use client";

import { useState } from "react";

type ConnectorType = "n8n" | "crewai" | "langgraph" | "custom";
type ConnectorStatus = "connected" | "disconnected" | "error";
type TestStatus = "idle" | "testing" | "success" | "error";

interface Connector {
  id: string;
  name: string;
  type: ConnectorType;
  status: ConnectorStatus;
  endpointUrl: string;
  lastSynced: string;
  agentCount: number;
}

const connectorMeta: Record<ConnectorType, { label: string; color: string; description: string }> = {
  n8n: { label: "n8n", color: "#ea4b71", description: "Workflow automation platform" },
  crewai: { label: "CrewAI", color: "#3b82f6", description: "Multi-agent AI framework" },
  langgraph: { label: "LangGraph", color: "#10b981", description: "LangChain agent orchestration" },
  custom: { label: "Custom API", color: "#a855f7", description: "Custom REST/gRPC endpoint" },
};

const mockConnectors: Connector[] = [
  {
    id: "c1",
    name: "Production n8n",
    type: "n8n",
    status: "connected",
    endpointUrl: "https://n8n.example.com/api/v1",
    lastSynced: "5 min ago",
    agentCount: 3,
  },
  {
    id: "c2",
    name: "Research Crew",
    type: "crewai",
    status: "connected",
    endpointUrl: "https://crew.example.com",
    lastSynced: "1 hour ago",
    agentCount: 4,
  },
  {
    id: "c3",
    name: "LangGraph Dev",
    type: "langgraph",
    status: "disconnected",
    endpointUrl: "http://localhost:8123",
    lastSynced: "3 days ago",
    agentCount: 2,
  },
  {
    id: "c4",
    name: "Internal Tools API",
    type: "custom",
    status: "error",
    endpointUrl: "https://api.internal.example.com/agents",
    lastSynced: "Never",
    agentCount: 0,
  },
];

function ConnectorIcon({ type }: { type: ConnectorType }) {
  const meta = connectorMeta[type];
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
      style={{ backgroundColor: meta.color }}
    >
      {meta.label.charAt(0)}
    </div>
  );
}

function StatusDot({ status }: { status: ConnectorStatus }) {
  const colors: Record<ConnectorStatus, string> = {
    connected: "bg-success-500",
    disconnected: "bg-neutral-400",
    error: "bg-error-500",
  };
  const labels: Record<ConnectorStatus, string> = {
    connected: "Connected",
    disconnected: "Disconnected",
    error: "Error",
  };

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700">
      <span className={`h-2 w-2 rounded-full ${colors[status]}`} />
      {labels[status]}
    </span>
  );
}

function ConnectorCard({
  connector,
  onSync,
}: {
  connector: Connector;
  onSync: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <ConnectorIcon type={connector.type} />
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">{connector.name}</h3>
            <p className="mt-0.5 text-xs text-neutral-500">{connectorMeta[connector.type].description}</p>
          </div>
        </div>
        <StatusDot status={connector.status} />
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500">Endpoint</span>
          <span className="truncate max-w-[200px] text-xs font-mono text-neutral-700">{connector.endpointUrl}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500">Last synced</span>
          <span className="text-xs text-neutral-700">{connector.lastSynced}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500">Agents imported</span>
          <span className="text-xs font-medium text-neutral-900">{connector.agentCount}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-neutral-100 pt-3">
        <button
          onClick={() => onSync(connector.id)}
          disabled={connector.status === "disconnected"}
          className="flex-1 rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Sync Agents
        </button>
        <button className="flex-1 rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
          Configure
        </button>
      </div>
    </div>
  );
}

function AddConnectorDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [type, setType] = useState<ConnectorType>("n8n");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");

  if (!open) return null;

  function handleTest() {
    setTestStatus("testing");
    setTimeout(() => {
      setTestStatus(url.startsWith("https://") ? "success" : "error");
    }, 1500);
  }

  function handleSave() {
    onClose();
    setName("");
    setUrl("");
    setApiKey("");
    setTestStatus("idle");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg border border-neutral-200 bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Add Connector</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {/* Type selector */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">Connector Type</label>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              {(Object.keys(connectorMeta) as ConnectorType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                    type === t
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  {connectorMeta[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Connector"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">Endpoint URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Test Connection */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleTest}
              disabled={!url || testStatus === "testing"}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {testStatus === "testing" ? "Testing..." : "Test Connection"}
            </button>
            {testStatus === "success" && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-success-600">
                <span className="h-2 w-2 rounded-full bg-success-500" />
                Connection successful
              </span>
            )}
            {testStatus === "error" && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-error-600">
                <span className="h-2 w-2 rounded-full bg-error-500" />
                Connection failed
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-neutral-100 pt-4">
          <button
            onClick={onClose}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name || !url}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Connector
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConnectorsPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [connectors] = useState(mockConnectors);

  const connectedCount = connectors.filter((c) => c.status === "connected").length;
  const totalAgents = connectors.reduce((s, c) => s + c.agentCount, 0);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Connectors</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Manage external agent framework integrations
            </p>
          </div>
          <button
            onClick={() => setShowAddDialog(true)}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            + Add Connector
          </button>
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-neutral-500">Total Connectors</p>
            <p className="mt-1 text-2xl font-semibold text-neutral-900">{connectors.length}</p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-neutral-500">Connected</p>
            <p className="mt-1 text-2xl font-semibold text-success-600">{connectedCount}</p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-neutral-500">Agents Imported</p>
            <p className="mt-1 text-2xl font-semibold text-neutral-900">{totalAgents}</p>
          </div>
        </div>

        {/* Connector Cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {connectors.map((c) => (
            <ConnectorCard key={c.id} connector={c} onSync={() => {}} />
          ))}
        </div>

        <AddConnectorDialog open={showAddDialog} onClose={() => setShowAddDialog(false)} />
      </div>
    </div>
  );
}
