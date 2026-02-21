"use client";

interface Alert {
  id: string;
  title: string;
  severity: string;
  status: string;
  createdAt: string;
}

interface AlertSummaryProps {
  alerts: Alert[];
  unreadCount: number;
  loading?: boolean;
  onViewAll: () => void;
}

const severityColors: Record<string, string> = {
  critical: "bg-error-100 text-error-800",
  error: "bg-error-50 text-error-700",
  warning: "bg-warning-100 text-warning-800",
  info: "bg-primary-100 text-primary-800",
};

export function AlertSummary({ alerts, unreadCount, loading, onViewAll }: AlertSummaryProps) {
  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-900">Alerts</h3>
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-neutral-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-neutral-900">Alerts</h3>
          {unreadCount > 0 && (
            <span className="rounded-full bg-error-500 px-2 py-0.5 text-xs font-medium text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onViewAll}
          className="text-sm font-medium text-primary-600 hover:text-primary-800"
        >
          View all
        </button>
      </div>
      <div className="mt-4 space-y-2">
        {alerts.length === 0 ? (
          <p className="text-sm text-neutral-500">No alerts</p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    severityColors[alert.severity] || "bg-neutral-100 text-neutral-800"
                  }`}
                >
                  {alert.severity}
                </span>
                <span className="text-sm text-neutral-700">{alert.title}</span>
              </div>
              <span className="text-xs text-neutral-400">
                {new Date(alert.createdAt).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
