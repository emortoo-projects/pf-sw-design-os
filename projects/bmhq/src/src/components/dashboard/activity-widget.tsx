"use client";

interface Activity {
  id: string;
  activityType: string;
  title: string;
  description: string | null;
  occurredAt: Date | string;
}

function formatRelativeTime(date: Date | string) {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function ActivityItem({ activity }: { activity: Activity }) {
  return (
    <div className="flex items-start gap-3 py-2 px-1 rounded-md hover:bg-white/[0.02] transition-colors duration-150">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-white/70 truncate">
          {activity.title}
        </p>
        {activity.description && (
          <p className="text-[11px] text-white/30 truncate">
            {activity.description}
          </p>
        )}
      </div>
      <span className="text-[11px] text-white/30 whitespace-nowrap shrink-0">
        {formatRelativeTime(activity.occurredAt)}
      </span>
    </div>
  );
}

export function ActivityWidget({
  activities,
  limit = 10,
}: {
  activities: Activity[];
  limit?: number;
}) {
  const displayed = activities.slice(0, limit);

  return (
    <div className="rounded-lg border border-[#1A1A1A] bg-[#111111] p-4">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-3">
        Recent Activity
      </h3>
      {displayed.length === 0 ? (
        <p className="text-[13px] text-white/30">No recent activity</p>
      ) : (
        <div className="space-y-0">
          {displayed.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}
