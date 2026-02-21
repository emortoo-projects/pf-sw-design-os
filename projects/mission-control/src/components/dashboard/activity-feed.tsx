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
  completed: "bg-green-100 text-green-800",
  running: "bg-blue-100 text-blue-800",
  failed: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
};

export function DashboardActivityFeed({ activities, loading, onViewAll }: DashboardActivityFeedProps) {
  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
        <button
          onClick={onViewAll}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View all
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {activities.length === 0 ? (
          <p className="text-sm text-gray-500">No recent activities</p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between rounded-md border px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{activity.agentName}</p>
                <p className="text-xs text-gray-500">{activity.type}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    statusColors[activity.status] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {activity.status}
                </span>
                <span className="text-xs text-gray-400">
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
