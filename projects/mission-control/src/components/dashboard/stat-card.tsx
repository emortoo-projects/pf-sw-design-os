"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: { direction: "up" | "down"; value: number };
  icon: React.ReactNode;
}

export function StatCard({ label, value, trend, icon }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-500">{label}</span>
        <span className="text-neutral-400">{icon}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-neutral-900">{value}</span>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend.direction === "up" ? "text-success-600" : "text-error-600"
            }`}
          >
            {trend.direction === "up" ? "+" : "-"}{trend.value}%
          </span>
        )}
      </div>
    </div>
  );
}
