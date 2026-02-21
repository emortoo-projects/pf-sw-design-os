"use client";

interface Metric {
  label: string;
  value: string | number;
  description?: string;
}

export function MetricsWidget({
  metrics,
}: {
  metrics: Metric[];
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, i) => (
        <div
          key={metric.label}
          className="rounded-lg border border-[#1A1A1A] bg-[#111111] p-4"
          style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
            {metric.label}
          </p>
          <p className="text-[24px] font-semibold font-mono text-white/90 mt-1">
            {metric.value}
          </p>
          {metric.description && (
            <p className="text-[11px] text-white/30 mt-0.5">
              {metric.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
