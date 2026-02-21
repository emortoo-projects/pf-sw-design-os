"use client";

import { useState } from "react";

type AlertType = "budget_threshold" | "agent_error" | "job_stuck" | "performance_anomaly" | "credential_expiry";
type AlertSeverity = "info" | "warning" | "error" | "critical";
type AlertStatus = "unread" | "read" | "dismissed" | "resolved";
type AlertRuleScope = "global" | "project" | "agent";
type ActiveTab = "alerts" | "rules";

interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  status: AlertStatus;
  entityType: string | null;
  entityId: string | null;
  readAt: string | null;
  createdAt: string;
}

interface AlertRule {
  id: string;
  name: string;
  type: AlertType;
  enabled: boolean;
  conditions: Record<string, unknown>;
  scope: AlertRuleScope;
  createdAt: string;
}

interface AlertRuleFormData {
  name: string;
  type: AlertType;
  scope: AlertRuleScope;
  enabled: boolean;
}

const severityColors: Record<AlertSeverity, string> = {
  info: "bg-blue-100 text-blue-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
  critical: "bg-red-200 text-red-900",
};

const statusColors: Record<AlertStatus, string> = {
  unread: "bg-blue-100 text-blue-800",
  read: "bg-gray-100 text-gray-800",
  dismissed: "bg-gray-100 text-gray-600",
  resolved: "bg-green-100 text-green-800",
};

const mockAlerts: Alert[] = [
  { id: "alt1", type: "budget_threshold", severity: "warning", title: "Research Bot budget at 84%", message: "The Research Bot agent has consumed $168.45 of its $200.00 monthly budget. Consider reviewing usage or increasing the cap.", status: "unread", entityType: "agent", entityId: "ag1", readAt: null, createdAt: "2026-02-21T14:10:00Z" },
  { id: "alt2", type: "agent_error", severity: "error", title: "Email Summarizer failed", message: "The Email Summarizer agent encountered an unhandled error during webhook delivery. Error: API timeout after 30s. Last 3 runs have failed.", status: "unread", entityType: "agent", entityId: "ag4", readAt: null, createdAt: "2026-02-21T13:55:00Z" },
  { id: "alt3", type: "credential_expiry", severity: "info", title: "OpenAI API key expires in 7 days", message: "Your OpenAI API credential 'prod-openai-key' will expire on Feb 28, 2026. Rotate it before expiration to avoid service disruption.", status: "unread", entityType: "credential", entityId: "cred-openai", readAt: null, createdAt: "2026-02-21T12:00:00Z" },
  { id: "alt4", type: "job_stuck", severity: "critical", title: "HubSpot Data Extract stuck for 45 min", message: "Job 'HubSpot Data Extract' has been in running state for 45 minutes without progress. The average completion time is 5 minutes. Manual intervention may be required.", status: "read", entityType: "job", entityId: "j8", readAt: "2026-02-21T11:30:00Z", createdAt: "2026-02-21T11:15:00Z" },
  { id: "alt5", type: "performance_anomaly", severity: "warning", title: "Code Review latency spike", message: "The Code Review agent's average response time increased by 340% compared to the 7-day baseline (34.5s vs 10.1s). This may indicate model degradation or increased load.", status: "read", entityType: "agent", entityId: "ag2", readAt: "2026-02-21T10:00:00Z", createdAt: "2026-02-21T09:45:00Z" },
  { id: "alt6", type: "budget_threshold", severity: "warning", title: "Monthly total budget at 49%", message: "You have spent $487.52 of your $1000.00 monthly budget with 7 days remaining. Current burn rate projects $695 at month end.", status: "dismissed", entityType: null, entityId: null, readAt: "2026-02-20T16:00:00Z", createdAt: "2026-02-20T15:30:00Z" },
  { id: "alt7", type: "agent_error", severity: "error", title: "Data Extractor HubSpot connection failed", message: "The Data Extractor agent could not connect to HubSpot API. Error: 401 Unauthorized. The API key may have been rotated.", status: "resolved", entityType: "agent", entityId: "ag3", readAt: "2026-02-20T12:00:00Z", createdAt: "2026-02-20T11:15:00Z" },
  { id: "alt8", type: "credential_expiry", severity: "info", title: "DeepSeek API key rotated successfully", message: "The DeepSeek API credential was automatically rotated. New key is active. Previous key will remain valid for 24 hours.", status: "resolved", entityType: "credential", entityId: "cred-deepseek", readAt: "2026-02-19T14:00:00Z", createdAt: "2026-02-19T13:00:00Z" },
];

const mockRules: AlertRule[] = [
  { id: "rule1", name: "Budget 80% Warning", type: "budget_threshold", enabled: true, conditions: { threshold: 80, unit: "percent" }, scope: "global", createdAt: "2026-01-15T10:00:00Z" },
  { id: "rule2", name: "Agent Error Alert", type: "agent_error", enabled: true, conditions: { consecutiveFailures: 2 }, scope: "global", createdAt: "2026-01-15T10:00:00Z" },
  { id: "rule3", name: "Job Stuck > 30 min", type: "job_stuck", enabled: true, conditions: { stuckMinutes: 30 }, scope: "global", createdAt: "2026-01-20T09:00:00Z" },
  { id: "rule4", name: "Credential Expiry 7 Day Warning", type: "credential_expiry", enabled: true, conditions: { daysBeforeExpiry: 7 }, scope: "global", createdAt: "2026-01-20T09:00:00Z" },
  { id: "rule5", name: "Performance Anomaly Detection", type: "performance_anomaly", enabled: true, conditions: { thresholdMultiplier: 3, baselineDays: 7 }, scope: "global", createdAt: "2026-02-01T08:00:00Z" },
  { id: "rule6", name: "Research Bot Budget 90%", type: "budget_threshold", enabled: false, conditions: { threshold: 90, unit: "percent", agentId: "ag1" }, scope: "agent", createdAt: "2026-02-10T11:00:00Z" },
];

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("alerts");
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleFormData, setRuleFormData] = useState<AlertRuleFormData>({
    name: "",
    type: "budget_threshold",
    scope: "global",
    enabled: true,
  });

  const alerts = mockAlerts;
  const rules = mockRules;
  const unreadCount = alerts.filter((a) => a.status === "unread").length;

  const handleMarkAllRead = () => {
    // Will connect to tRPC mutation
  };

  const handleRuleSubmit = () => {
    setShowRuleModal(false);
    setRuleFormData({ name: "", type: "budget_threshold", scope: "global", enabled: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
              <p className="mt-1 text-sm text-gray-500">
                Alert management with configurable rules and notification history
              </p>
            </div>
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-medium text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeTab === "alerts" && unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="rounded-md border bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Mark all read
              </button>
            )}
            {activeTab === "rules" && (
              <button
                onClick={() => setShowRuleModal(true)}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Create Rule
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 border-b">
          <button
            onClick={() => setActiveTab("alerts")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "alerts"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Alerts
            {unreadCount > 0 && (
              <span className="ml-1.5 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "rules"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Rules
          </button>
        </div>

        {/* Alert List */}
        {activeTab === "alerts" && (
          <div className="mt-6 space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className={`cursor-pointer rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md ${
                  alert.status === "unread" ? "border-l-4 border-l-blue-500" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${severityColors[alert.severity]}`}>
                        {alert.severity}
                      </span>
                      <h3 className="text-sm font-medium text-gray-900">{alert.title}</h3>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 line-clamp-1">{alert.message}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[alert.status]}`}>
                      {alert.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="rounded px-2 py-1 text-xs text-green-600 hover:bg-green-50"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alert Rules */}
        {activeTab === "rules" && (
          <div className="mt-6 space-y-2">
            {rules.map((rule) => (
              <div key={rule.id} className="rounded-lg border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${rule.enabled ? "bg-green-500" : "bg-gray-300"}`}
                    />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{rule.name}</h3>
                      <p className="text-xs text-gray-500">
                        {rule.type.replace(/_/g, " ")} &middot; {rule.scope} scope
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className={`rounded-md px-3 py-1 text-xs font-medium ${
                        rule.enabled
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {rule.enabled ? "Enabled" : "Disabled"}
                    </button>
                    <button className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50">
                      Edit
                    </button>
                    <button className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alert Detail Modal */}
        {selectedAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${severityColors[selectedAlert.severity]}`}>
                    {selectedAlert.severity}
                  </span>
                  <h2 className="text-lg font-semibold text-gray-900">{selectedAlert.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="rounded-md p-1 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500">Message</label>
                  <p className="mt-1 text-sm text-gray-700">{selectedAlert.message}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Type</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAlert.type.replace(/_/g, " ")}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Status</label>
                    <span className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[selectedAlert.status]}`}>
                      {selectedAlert.status}
                    </span>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Created</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedAlert.createdAt).toLocaleString()}</p>
                  </div>
                  {selectedAlert.readAt && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">Read At</label>
                      <p className="mt-1 text-sm text-gray-900">{new Date(selectedAlert.readAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  Resolve
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alert Rule Form Modal */}
        {showRuleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Create Alert Rule</h2>
                <button
                  onClick={() => setShowRuleModal(false)}
                  className="rounded-md p-1 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rule Name</label>
                  <input
                    type="text"
                    value={ruleFormData.name}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, name: e.target.value })}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Budget over 80%"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Alert Type</label>
                    <select
                      value={ruleFormData.type}
                      onChange={(e) => setRuleFormData({ ...ruleFormData, type: e.target.value as AlertType })}
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="budget_threshold">Budget Threshold</option>
                      <option value="agent_error">Agent Error</option>
                      <option value="job_stuck">Job Stuck</option>
                      <option value="performance_anomaly">Performance Anomaly</option>
                      <option value="credential_expiry">Credential Expiry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Scope</label>
                    <select
                      value={ruleFormData.scope}
                      onChange={(e) => setRuleFormData({ ...ruleFormData, scope: e.target.value as AlertRuleScope })}
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="global">Global</option>
                      <option value="project">Project</option>
                      <option value="agent">Agent</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={ruleFormData.enabled}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, enabled: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label className="text-sm text-gray-700">Enabled</label>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowRuleModal(false)}
                  className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRuleSubmit}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Create Rule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
