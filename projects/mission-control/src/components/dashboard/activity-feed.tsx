"use client";

interface Activity {
  id: string;
  agentName: string;
  type: string;
  status: string;
  createdAt: string;
}

interface DashboardActivityFeedProps {
  activities: Activity[];
  loading?: boolean;
  onViewAll: () => void;
}

const statusColors: Record<string, string> = {
  completed: "bg-success-100 text-success-800",
  running: "bg-primary-100 text-primary-800",
  failed: "bg-error-100 text-error-800",
  pending: "bg-warning-100 text-warning-800",
};

export function DashboardActivityFeed({ activities, loading, onViewAll }: DashboardActivityFeedProps) {
  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-900">Recent Activities</h3>
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-neutral-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Recent Activities</h3>
        <button
          onClick={onViewAll}
          className="text-sm font-medium text-primary-600 hover:text-primary-800"
        >
          View all
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {activities.length === 0 ? (
          <p className="text-sm text-neutral-500">No recent activities</p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between rounded-md border px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-neutral-900">{activity.agentName}</p>
                <p className="text-xs text-neutral-500">{activity.type}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    statusColors[activity.status] || "bg-neutral-100 text-gray-800"
                  }`}
                >
                  {activity.status}
                </span>
                <span className="text-xs text-neutral-400">
                  {new Date(activity.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
