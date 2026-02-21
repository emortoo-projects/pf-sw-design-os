"use client";

import { useState } from "react";

type TimeRange = "1h" | "6h" | "24h" | "7d" | "30d";

interface MetricData {
  label: string;
  value: string;
  change: number;
  sparkline: number[];
  status: "success" | "warning" | "error" | "neutral";
}

interface CostBreakdownItem {
  name: string;
  cost: number;
  calls: number;
  tokens: number;
  pct: number;
}

interface ErrorEvent {
  id: string;
  message: string;
  type: string;
  count: number;
  lastOccurrence: string;
  workflow: string;
}

interface LiveEvent {
  id: string;
  type: "execution_start" | "execution_complete" | "execution_fail" | "guardrail_trigger";
  message: string;
  time: string;
}

const mockMetrics: MetricData[] = [
  { label: "Total Executions", value: "1,284", change: 12.5, sparkline: [40, 45, 38, 52, 60, 55, 65], status: "success" },
  { label: "Success Rate", value: "96.5%", change: 0.8, sparkline: [94, 95, 96, 95, 97, 96, 97], status: "success" },
  { label: "Total Cost", value: "$48.23", change: -8.2, sparkline: [52, 48, 55, 45, 50, 48, 42], status: "success" },
  { label: "Avg Latency", value: "1.8s", change: -0.3, sparkline: [2.1, 2.0, 1.9, 1.8, 2.0, 1.8, 1.7], status: "success" },
  { label: "Error Rate", value: "3.5%", change: 1.2, sparkline: [2, 3, 2, 4, 3, 4, 5], status: "warning" },
  { label: "Token Usage", value: "2.4M", change: 15.0, sparkline: [1800, 2000, 2100, 2200, 2300, 2200, 2400], status: "neutral" },
];

const mockCostData = [
  { date: "Mon", openai: 5.20, anthropic: 3.10 },
  { date: "Tue", openai: 6.50, anthropic: 2.80 },
  { date: "Wed", openai: 4.80, anthropic: 3.50 },
  { date: "Thu", openai: 7.10, anthropic: 4.20 },
  { date: "Fri", openai: 5.82, anthropic: 3.80 },
  { date: "Sat", openai: 3.60, anthropic: 2.10 },
  { date: "Sun", openai: 4.20, anthropic: 2.50 },
];

const mockCostBreakdown: CostBreakdownItem[] = [
  { name: "openai/gpt-4", cost: 22.50, calls: 450, tokens: 1200000, pct: 46.7 },
  { name: "openai/gpt-4-turbo", cost: 12.30, calls: 280, tokens: 800000, pct: 25.5 },
  { name: "anthropic/claude-3-opus", cost: 8.20, calls: 120, tokens: 350000, pct: 17.0 },
  { name: "anthropic/claude-3-sonnet", cost: 3.50, calls: 200, tokens: 250000, pct: 7.3 },
  { name: "openai/gpt-3.5-turbo", cost: 1.73, calls: 234, tokens: 180000, pct: 3.5 },
];

const mockLatencyData = [
  { time: "00:00", p50: 1.2, p90: 2.8, p99: 5.1 },
  { time: "04:00", p50: 1.1, p90: 2.5, p99: 4.8 },
  { time: "08:00", p50: 1.5, p90: 3.2, p99: 6.0 },
  { time: "12:00", p50: 1.8, p90: 3.5, p99: 7.2 },
  { time: "16:00", p50: 1.6, p90: 3.0, p99: 5.5 },
  { time: "20:00", p50: 1.3, p90: 2.7, p99: 4.9 },
];

const mockErrors: ErrorEvent[] = [
  { id: "err-1", message: "Timeout exceeded: agent execution took >30s", type: "TimeoutError", count: 8, lastOccurrence: "2 min ago", workflow: "Customer Support Triage" },
  { id: "err-2", message: "Rate limit exceeded for openai/gpt-4", type: "RateLimitError", count: 5, lastOccurrence: "15 min ago", workflow: "Content Pipeline" },
  { id: "err-3", message: "Invalid response format from agent", type: "ValidationError", count: 3, lastOccurrence: "1 hour ago", workflow: "Data Extraction" },
  { id: "err-4", message: "Webhook endpoint unreachable", type: "ConnectionError", count: 2, lastOccurrence: "3 hours ago", workflow: "Code Review Pipeline" },
];

const mockLiveEvents: LiveEvent[] = [
  { id: "le-1", type: "execution_complete", message: "Content Pipeline completed (2.3s, $0.12)", time: "Just now" },
  { id: "le-2", type: "execution_start", message: "Data Extraction started via webhook", time: "30s ago" },
  { id: "le-3", type: "guardrail_trigger", message: "Cost cap warning on Research Bot ($4.50/$5.00)", time: "2 min ago" },
  { id: "le-4", type: "execution_fail", message: "Customer Support Triage failed: timeout", time: "5 min ago" },
  { id: "le-5", type: "execution_complete", message: "Email Summarizer completed (1.5s, $0.06)", time: "8 min ago" },
  { id: "le-6", type: "execution_start", message: "Report Generator started via schedule", time: "10 min ago" },
];

function ObservabilityHeader({
  timeRange,
  onTimeRangeChange,
  autoRefresh,
  onToggleAutoRefresh,
}: {
  timeRange: TimeRange;
  onTimeRangeChange: (r: TimeRange) => void;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Observability</h1>
        <p className="mt-1 text-sm text-neutral-500">Real-time metrics, cost tracking, and performance analysis</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleAutoRefresh}
          className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
            autoRefresh ? "border-primary-300 bg-primary-50 text-primary-700" : "border-neutral-300 text-neutral-700"
          }`}
        >
          {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
        </button>
        <select
          value={timeRange}
          onChange={(e) => onTimeRangeChange(e.target.value as TimeRange)}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
        >
          <option value="1h">Last 1 hour</option>
          <option value="6h">Last 6 hours</option>
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
      </div>
    </div>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 24;
  const w = 64;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");

  return (
    <svg width={w} height={h} className="flex-shrink-0">
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  );
}

function MetricCard({ metric }: { metric: MetricData }) {
  const changeColor = metric.change > 0
    ? (metric.label === "Error Rate" ? "text-error-600" : "text-success-600")
    : (metric.label === "Error Rate" ? "text-success-600" : metric.label === "Total Cost" || metric.label === "Avg Latency" ? "text-success-600" : "text-error-600");
  const sparkColor = metric.status === "success" ? "#22c55e" : metric.status === "warning" ? "#f59e0b" : metric.status === "error" ? "#ef4444" : "#a3a3a3";

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-neutral-500">{metric.label}</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">{metric.value}</p>
          <p className={`mt-0.5 text-xs font-medium ${changeColor}`}>
            {metric.change > 0 ? "+" : ""}{metric.change}%
          </p>
        </div>
        <Sparkline data={metric.sparkline} color={sparkColor} />
      </div>
    </div>
  );
}

function CostTrendChart({ data }: { data: typeof mockCostData }) {
  const maxTotal = Math.max(...data.map((d) => d.openai + d.anthropic));

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900">Cost Trend</h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-primary-500" /> OpenAI</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-secondary-500" /> Anthropic</span>
        </div>
      </div>
      <div className="mt-4 flex items-end gap-3" style={{ height: 140 }}>
        {data.map((d) => (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full flex-col gap-0.5" style={{ height: `${((d.openai + d.anthropic) / maxTotal) * 100}%` }}>
              <div className="flex-none rounded-t bg-primary-500" style={{ height: `${(d.openai / (d.openai + d.anthropic)) * 100}%` }} />
              <div className="flex-none rounded-b bg-secondary-400" style={{ height: `${(d.anthropic / (d.openai + d.anthropic)) * 100}%` }} />
            </div>
            <span className="text-xs text-neutral-500">{d.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CostBreakdownTable({ data }: { data: CostBreakdownItem[] }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-neutral-900">Cost by Model</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 text-left">
              <th className="px-4 py-2.5 text-xs font-medium text-neutral-500">Model</th>
              <th className="px-4 py-2.5 text-xs font-medium text-neutral-500 text-right">Cost</th>
              <th className="px-4 py-2.5 text-xs font-medium text-neutral-500 text-right">Calls</th>
              <th className="px-4 py-2.5 text-xs font-medium text-neutral-500 text-right">Tokens</th>
              <th className="px-4 py-2.5 text-xs font-medium text-neutral-500 w-32">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {data.map((item) => (
              <tr key={item.name} className="hover:bg-neutral-50">
                <td className="px-4 py-2.5 text-sm font-medium text-neutral-900 font-mono">{item.name}</td>
                <td className="px-4 py-2.5 text-sm text-neutral-700 text-right">${item.cost.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-xs text-neutral-500 text-right">{item.calls}</td>
                <td className="px-4 py-2.5 text-xs text-neutral-500 text-right">{(item.tokens / 1000).toFixed(0)}K</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-neutral-100">
                      <div className="h-1.5 rounded-full bg-primary-500" style={{ width: `${item.pct}%` }} />
                    </div>
                    <span className="text-xs text-neutral-500 w-10 text-right">{item.pct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LatencyChart({ data }: { data: typeof mockLatencyData }) {
  const max = Math.max(...data.map((d) => d.p99));

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900">Latency Distribution</h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-success-500" /> p50</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-warning-500" /> p90</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-error-500" /> p99</span>
        </div>
      </div>
      <div className="mt-4 flex items-end gap-4" style={{ height: 120 }}>
        {data.map((d) => (
          <div key={d.time} className="flex flex-1 flex-col items-center gap-1">
            <div className="relative w-full" style={{ height: `${(d.p99 / max) * 100}%` }}>
              <div className="absolute bottom-0 left-1/2 w-4 -translate-x-1/2 rounded-t bg-error-200" style={{ height: "100%" }} />
              <div className="absolute bottom-0 left-1/2 w-4 -translate-x-1/2 rounded-t bg-warning-300" style={{ height: `${(d.p90 / d.p99) * 100}%` }} />
              <div className="absolute bottom-0 left-1/2 w-4 -translate-x-1/2 rounded-t bg-success-400" style={{ height: `${(d.p50 / d.p99) * 100}%` }} />
            </div>
            <span className="text-xs text-neutral-500">{d.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorTracker({ errors }: { errors: ErrorEvent[] }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-neutral-900">Recent Errors</h3>
      </div>
      <div className="divide-y divide-neutral-100">
        {errors.map((err) => (
          <div key={err.id} className="px-4 py-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-900 truncate">{err.message}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
                  <span className="rounded bg-error-100 px-1.5 py-0.5 text-error-700 font-medium">{err.type}</span>
                  <span>{err.workflow}</span>
                  <span>{err.lastOccurrence}</span>
                </div>
              </div>
              <span className="ml-3 flex-shrink-0 rounded-full bg-error-100 px-2 py-0.5 text-xs font-medium text-error-700">
                {err.count}x
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveActivityFeed({ events, paused, onTogglePause }: { events: LiveEvent[]; paused: boolean; onTogglePause: () => void }) {
  const eventColors: Record<string, string> = {
    execution_start: "bg-primary-100 text-primary-700",
    execution_complete: "bg-success-100 text-success-700",
    execution_fail: "bg-error-100 text-error-700",
    guardrail_trigger: "bg-warning-100 text-warning-700",
  };

  const eventLabels: Record<string, string> = {
    execution_start: "started",
    execution_complete: "completed",
    execution_fail: "failed",
    guardrail_trigger: "guardrail",
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-neutral-900">Live Activity</h3>
          {!paused && <span className="h-2 w-2 animate-pulse rounded-full bg-success-500" />}
        </div>
        <button onClick={onTogglePause} className="text-xs text-neutral-500 hover:text-neutral-700">
          {paused ? "Resume" : "Pause"}
        </button>
      </div>
      <div className="divide-y divide-neutral-100 max-h-72 overflow-y-auto">
        {events.map((event) => (
          <div key={event.id} className="flex items-start gap-3 px-4 py-2.5">
            <span className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${eventColors[event.type]}`}>
              {eventLabels[event.type]}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-700">{event.message}</p>
              <p className="mt-0.5 text-xs text-neutral-400">{event.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ObservabilityDashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [feedPaused, setFeedPaused] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ObservabilityHeader
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          autoRefresh={autoRefresh}
          onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
        />

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {mockMetrics.map((m) => (
            <MetricCard key={m.label} metric={m} />
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <CostTrendChart data={mockCostData} />
          <LatencyChart data={mockLatencyData} />
        </div>

        <div className="mt-6">
          <CostBreakdownTable data={mockCostBreakdown} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ErrorTracker errors={mockErrors} />
          <LiveActivityFeed events={mockLiveEvents} paused={feedPaused} onTogglePause={() => setFeedPaused(!feedPaused)} />
        </div>
      </div>
    </div>
  );
}
