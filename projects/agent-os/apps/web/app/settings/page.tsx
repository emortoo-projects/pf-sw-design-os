"use client";

import { useState } from "react";

type SettingsSection = "general" | "credentials" | "connectors" | "webhooks" | "integrations";
type ConnectorStatus = "connected" | "disconnected" | "error";
type CredentialType = "api_key" | "oauth" | "token";

interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
}

interface Credential {
  id: string;
  name: string;
  type: CredentialType;
  provider: string;
  maskedValue: string;
  lastUsedAt: string | null;
  createdAt: string;
}

interface Connector {
  id: string;
  name: string;
  framework: string;
  url: string;
  status: ConnectorStatus;
  lastHealthCheck: string | null;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  enabled: boolean;
  lastTriggeredAt: string | null;
}

const mockMembers: WorkspaceMember[] = [
  { id: "m1", name: "Alice Johnson", email: "alice@example.com", role: "owner", joinedAt: "2024-01-01T00:00:00Z" },
  { id: "m2", name: "Bob Smith", email: "bob@example.com", role: "admin", joinedAt: "2024-01-10T00:00:00Z" },
  { id: "m3", name: "Carol Williams", email: "carol@example.com", role: "member", joinedAt: "2024-02-01T00:00:00Z" },
];

const mockCredentials: Credential[] = [
  { id: "c1", name: "OpenAI Production", type: "api_key", provider: "openai", maskedValue: "sk-...4x8f", lastUsedAt: "2024-02-10T14:00:00Z", createdAt: "2024-01-05T00:00:00Z" },
  { id: "c2", name: "Anthropic API Key", type: "api_key", provider: "anthropic", maskedValue: "sk-ant-...2k9j", lastUsedAt: "2024-02-10T13:30:00Z", createdAt: "2024-01-10T00:00:00Z" },
  { id: "c3", name: "GitHub Token", type: "token", provider: "github", maskedValue: "ghp_...a3b1", lastUsedAt: "2024-02-08T16:00:00Z", createdAt: "2024-01-20T00:00:00Z" },
];

const mockConnectors: Connector[] = [
  { id: "cn1", name: "n8n Cloud", framework: "n8n", url: "https://n8n.example.com", status: "connected", lastHealthCheck: "2024-02-10T14:00:00Z" },
  { id: "cn2", name: "CrewAI Instance", framework: "crewai", url: "https://crewai.example.com", status: "connected", lastHealthCheck: "2024-02-10T13:55:00Z" },
  { id: "cn3", name: "LangGraph Dev", framework: "langgraph", url: "https://langgraph.example.com", status: "error", lastHealthCheck: "2024-02-10T12:00:00Z" },
];

const mockWebhooks: Webhook[] = [
  { id: "wh1", name: "Slack Notifications", url: "https://hooks.slack.com/services/...", events: ["execution.completed", "execution.failed"], enabled: true, lastTriggeredAt: "2024-02-10T14:02:00Z" },
  { id: "wh2", name: "PagerDuty Alerts", url: "https://events.pagerduty.com/...", events: ["execution.failed", "guardrail.triggered"], enabled: true, lastTriggeredAt: "2024-02-10T12:00:00Z" },
  { id: "wh3", name: "Analytics Webhook", url: "https://analytics.example.com/...", events: ["execution.completed"], enabled: false, lastTriggeredAt: null },
];

const sections: { key: SettingsSection; label: string }[] = [
  { key: "general", label: "General" },
  { key: "credentials", label: "Credentials" },
  { key: "connectors", label: "Connectors" },
  { key: "webhooks", label: "Webhooks" },
  { key: "integrations", label: "Integrations" },
];

const connectorStatusColors: Record<ConnectorStatus, string> = {
  connected: "bg-success-100 text-success-700",
  disconnected: "bg-neutral-100 text-neutral-600",
  error: "bg-error-100 text-error-700",
};

function SettingsSidebar({
  active,
  onChange,
}: {
  active: SettingsSection;
  onChange: (s: SettingsSection) => void;
}) {
  return (
    <nav className="w-48 flex-shrink-0 space-y-1">
      {sections.map((s) => (
        <button
          key={s.key}
          onClick={() => onChange(s.key)}
          className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
            active === s.key
              ? "bg-primary-50 text-primary-700"
              : "text-neutral-600 hover:bg-neutral-100"
          }`}
        >
          {s.label}
        </button>
      ))}
    </nav>
  );
}

function GeneralSettings() {
  const [name, setName] = useState("My Workspace");
  const [description, setDescription] = useState("Production workspace for AI agents");

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-neutral-900">Workspace Details</h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
          <div className="flex justify-end">
            <button className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Save Changes</button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900">Members</h3>
          <button className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50">Invite Member</button>
        </div>
        <div className="mt-4 divide-y divide-neutral-100">
          {mockMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-neutral-900">{member.name}</p>
                <p className="text-xs text-neutral-500">{member.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <select defaultValue={member.role} className="rounded-md border border-neutral-300 px-2 py-1 text-xs focus:border-primary-500 focus:outline-none">
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </select>
                {member.role !== "owner" && (
                  <button className="text-xs text-error-600 hover:text-error-700">Remove</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-error-200 bg-error-50 p-5">
        <h3 className="text-sm font-semibold text-error-900">Danger Zone</h3>
        <p className="mt-1 text-xs text-error-700">Permanently delete this workspace and all its data.</p>
        <button className="mt-3 rounded-md border border-error-300 px-4 py-1.5 text-sm font-medium text-error-700 hover:bg-error-100">
          Delete Workspace
        </button>
      </div>
    </div>
  );
}

function CredentialsSettings() {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">API Credentials</h3>
          <p className="mt-0.5 text-xs text-neutral-500">Manage API keys and tokens for LLM providers and services</p>
        </div>
        <button onClick={() => setShowDialog(true)} className="rounded-md bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-700">
          Add Credential
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {mockCredentials.map((cred) => (
          <div key={cred.id} className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-neutral-900">{cred.name}</p>
                  <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500">{cred.type}</span>
                </div>
                <p className="mt-0.5 text-xs text-neutral-500">Provider: {cred.provider}</p>
                <p className="mt-0.5 text-xs text-neutral-400 font-mono">{cred.maskedValue}</p>
              </div>
              <div className="flex gap-2">
                <button className="rounded px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100">Rotate</button>
                <button className="rounded px-2 py-1 text-xs text-error-600 hover:bg-error-50">Delete</button>
              </div>
            </div>
            <div className="mt-2 flex gap-4 text-xs text-neutral-400">
              {cred.lastUsedAt && <span>Last used: {new Date(cred.lastUsedAt).toLocaleDateString()}</span>}
              <span>Created: {new Date(cred.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-neutral-900">Add Credential</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700">Name</label>
                <input placeholder="e.g., OpenAI Production" className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-700">Provider</label>
                  <select className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none">
                    <option>openai</option>
                    <option>anthropic</option>
                    <option>custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700">Type</label>
                  <select className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none">
                    <option>api_key</option>
                    <option>oauth</option>
                    <option>token</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">Value</label>
                <input type="password" placeholder="sk-..." className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowDialog(false)} className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">Cancel</button>
              <button onClick={() => setShowDialog(false)} className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConnectorsSettings() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">Framework Connectors</h3>
          <p className="mt-0.5 text-xs text-neutral-500">Connect to external agent frameworks (n8n, CrewAI, LangGraph)</p>
        </div>
        <button className="rounded-md bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-700">
          Add Connector
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {mockConnectors.map((conn) => (
          <div key={conn.id} className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-neutral-900">{conn.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${connectorStatusColors[conn.status]}`}>
                    {conn.status}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-neutral-500">Framework: {conn.framework}</p>
                <p className="mt-0.5 text-xs text-neutral-400 font-mono">{conn.url}</p>
              </div>
              <div className="flex gap-2">
                <button className="rounded px-2 py-1 text-xs text-primary-600 hover:bg-primary-50">Health Check</button>
                <button className="rounded px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100">Edit</button>
                <button className="rounded px-2 py-1 text-xs text-error-600 hover:bg-error-50">Delete</button>
              </div>
            </div>
            {conn.lastHealthCheck && (
              <p className="mt-2 text-xs text-neutral-400">Last check: {new Date(conn.lastHealthCheck).toLocaleString()}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function WebhooksSettings() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">Webhooks</h3>
          <p className="mt-0.5 text-xs text-neutral-500">Configure outgoing webhooks for event notifications</p>
        </div>
        <button className="rounded-md bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-700">
          Add Webhook
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {mockWebhooks.map((wh) => (
          <div key={wh.id} className={`rounded-lg border bg-white p-4 shadow-sm ${wh.enabled ? "border-neutral-200" : "border-neutral-100 opacity-60"}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-neutral-900">{wh.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${wh.enabled ? "bg-success-100 text-success-700" : "bg-neutral-100 text-neutral-600"}`}>
                    {wh.enabled ? "Active" : "Disabled"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-neutral-400 font-mono truncate max-w-md">{wh.url}</p>
                <div className="mt-1 flex gap-1">
                  {wh.events.map((ev) => (
                    <span key={ev} className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500">{ev}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={`relative h-5 w-9 rounded-full transition-colors ${wh.enabled ? "bg-primary-500" : "bg-neutral-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${wh.enabled ? "translate-x-4" : ""}`} />
                </button>
                <button className="rounded px-2 py-1 text-xs text-error-600 hover:bg-error-50">Delete</button>
              </div>
            </div>
            {wh.lastTriggeredAt && (
              <p className="mt-2 text-xs text-neutral-400">Last triggered: {new Date(wh.lastTriggeredAt).toLocaleString()}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function IntegrationsSettings() {
  const integrations = [
    { name: "Slack", description: "Receive execution notifications in Slack channels", connected: true },
    { name: "GitHub", description: "Trigger workflows from GitHub events", connected: true },
    { name: "Jira", description: "Create and update Jira tickets from workflows", connected: false },
    { name: "PagerDuty", description: "Alert on-call engineers for critical failures", connected: true },
    { name: "Datadog", description: "Export metrics and traces to Datadog", connected: false },
  ];

  return (
    <div>
      <h3 className="text-sm font-semibold text-neutral-900">Integrations</h3>
      <p className="mt-0.5 text-xs text-neutral-500">Connect Agent OS with external services</p>
      <div className="mt-4 space-y-3">
        {integrations.map((integration) => (
          <div key={integration.name} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-neutral-900">{integration.name}</p>
                {integration.connected && (
                  <span className="rounded-full bg-success-100 px-2 py-0.5 text-xs font-medium text-success-700">Connected</span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-neutral-500">{integration.description}</p>
            </div>
            <button
              className={`rounded-md px-4 py-1.5 text-sm font-medium ${
                integration.connected
                  ? "border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                  : "bg-primary-600 text-white hover:bg-primary-700"
              }`}
            >
              {integration.connected ? "Configure" : "Connect"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("general");

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
          <p className="mt-1 text-sm text-neutral-500">Manage workspace configuration, credentials, and integrations</p>
        </div>

        <div className="mt-8 flex gap-8">
          <SettingsSidebar active={activeSection} onChange={setActiveSection} />
          <div className="flex-1">
            {activeSection === "general" && <GeneralSettings />}
            {activeSection === "credentials" && <CredentialsSettings />}
            {activeSection === "connectors" && <ConnectorsSettings />}
            {activeSection === "webhooks" && <WebhooksSettings />}
            {activeSection === "integrations" && <IntegrationsSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}
