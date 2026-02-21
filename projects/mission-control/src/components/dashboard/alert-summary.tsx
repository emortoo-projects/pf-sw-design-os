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
  critical: "bg-red-100 text-red-800",
  error: "bg-red-50 text-red-700",
  warning: "bg-yellow-100 text-yellow-800",
  info: "bg-blue-100 text-blue-800",
};

export function AlertSummary({ alerts, unreadCount, loading, onViewAll }: AlertSummaryProps) {
  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Alerts</h3>
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Alerts</h3>
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onViewAll}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View all
        </button>
      </div>
      <div className="mt-4 space-y-2">
        {alerts.length === 0 ? (
          <p className="text-sm text-gray-500">No alerts</p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    severityColors[alert.severity] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {alert.severity}
                </span>
                <span className="text-sm text-gray-700">{alert.title}</span>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(alert.createdAt).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
