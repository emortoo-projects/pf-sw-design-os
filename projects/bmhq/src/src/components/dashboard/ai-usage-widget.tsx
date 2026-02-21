"use client";

interface AIUsage {
  totalTokens: number;
  totalCost: number;
  totalRequests: number;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function AIUsageWidget({ usage }: { usage: AIUsage }) {
  return (
    <div className="rounded-lg border border-[#1A1A1A] bg-[#111111] p-4">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-3">
        AI Usage
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-white/40">Total Requests</span>
          <span className="text-[13px] font-mono text-white/70">
            {formatNumber(usage.totalRequests)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-white/40">Tokens Used</span>
          <span className="text-[13px] font-mono text-white/70">
            {formatNumber(usage.totalTokens)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-white/40">Estimated Cost</span>
          <span className="text-[13px] font-mono text-white/70">
            ${usage.totalCost.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
