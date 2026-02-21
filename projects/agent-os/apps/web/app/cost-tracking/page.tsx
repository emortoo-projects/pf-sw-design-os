"use client";

import { useState } from "react";

type DateRange = "24h" | "7d" | "30d" | "90d";

interface AgentCostRow {
  agent: string;
  model: string;
  totalCost: number;
  totalTokens: number;
  runs: number;
  avgCostPerRun: number;
}

interface ModelBreakdown {
  model: string;
  cost: number;
  pct: number;
  color: string;
}

interface DailyCost {
  date: string;
  cost: number;
}

interface BudgetAlert {
  id: string;
  name: string;
  cap: number;
  spent: number;
  status: "ok" | "warning" | "exceeded";
}

const mockAgentCosts: AgentCostRow[] = [
  { agent: "Research Bot", model: "gpt-4", totalCost: 18.45, totalTokens: 1250000, runs: 45, avgCostPerRun: 0.41 },
  { agent: "Code Review", model: "claude-3-opus", totalCost: 14.20, totalTokens: 820000, runs: 32, avgCostPerRun: 0.44 },
  { agent: "Data Extractor", model: "gpt-4-turbo", totalCost: 9.80, totalTokens: 680000, runs: 28, avgCostPerRun: 0.35 },
  { agent: "Customer Support", model: "claude-3-sonnet", totalCost: 3.60, totalTokens: 420000, runs: 15, avgCostPerRun: 0.24 },
  { agent: "Report Writer", model: "gpt-4", totalCost: 2.18, totalTokens: 150000, runs: 8, avgCostPerRun: 0.27 },
  { agent: "Email Summarizer", model: "gpt-3.5-turbo", totalCost: 0.52, totalTokens: 310000, runs: 62, avgCostPerRun: 0.01 },
];

const mockModelBreakdown: ModelBreakdown[] = [
  { model: "gpt-4", cost: 20.63, pct: 42.3, color: "#0ea5e9" },
  { model: "claude-3-opus", cost: 14.20, pct: 29.1, color: "#a855f7" },
  { model: "gpt-4-turbo", cost: 9.80, pct: 20.1, color: "#38bdf8" },
  { model: "claude-3-sonnet", cost: 3.60, pct: 7.4, color: "#c084fc" },
  { model: "gpt-3.5-turbo", cost: 0.52, pct: 1.1, color: "#7dd3fc" },
];

const mockDailyCosts: DailyCost[] = [
  { date: "Feb 14", cost: 5.80 },
  { date: "Feb 15", cost: 7.20 },
  { date: "Feb 16", cost: 6.10 },
  { date: "Feb 17", cost: 8.40 },
  { date: "Feb 18", cost: 7.65 },
  { date: "Feb 19", cost: 5.90 },
  { date: "Feb 20", cost: 7.70 },
];

const mockBudgets: BudgetAlert[] = [
  { id: "b1", name: "Monthly Total", cap: 200, spent: 48.75, status: "ok" },
  { id: "b2", name: "Research Bot Cap", cap: 25, spent: 18.45, status: "warning" },
  { id: "b3", name: "Customer Support Cap", cap: 5, spent: 3.60, status: "ok" },
  { id: "b4", name: "Code Review Cap", cap: 15, spent: 14.20, status: "warning" },
];

function CostTrackingHeader({
  dateRange,
  onDateRangeChange,
}: {
  dateRange: DateRange;
  onDateRangeChange: (r: DateRange) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Cost Tracking</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Monitor spend by agent, model, and time period
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
          Export CSV
        </button>
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value as DateRange)}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
        >
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>
    </div>
  );
}

function SummaryCards() {
  const totalCost = mockAgentCosts.reduce((s, a) => s + a.totalCost, 0);
  const totalTokens = mockAgentCosts.reduce((s, a) => s + a.totalTokens, 0);
  const totalRuns = mockAgentCosts.reduce((s, a) => s + a.runs, 0);
  const avgPerRun = totalRuns > 0 ? totalCost / totalRuns : 0;

  const cards = [
    { label: "Total Spend", value: `$${totalCost.toFixed(2)}`, change: "-12%", positive: true },
    { label: "Total Tokens", value: `${(totalTokens / 1_000_000).toFixed(1)}M`, change: "+8%", positive: false },
    { label: "Total Runs", value: totalRuns.toString(), change: "+15%", positive: true },
    { label: "Avg Cost / Run", value: `$${avgPerRun.toFixed(2)}`, change: "-18%", positive: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-neutral-500">{c.label}</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">{c.value}</p>
          <p className={`mt-1 text-xs font-medium ${c.positive ? "text-success-600" : "text-neutral-500"}`}>
            {c.change}
          </p>
        </div>
      ))}
    </div>
  );
}

function CostTrendChart({ data }: { data: DailyCost[] }) {
  const max = Math.max(...data.map((d) => d.cost));
  const h = 140;
  const w = 100;
  const points = data
    .map((d, i) => `${(i / (data.length - 1)) * w},${h - (d.cost / max) * h}`)
    .join(" ");

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-900">Cost Trend</h3>
      <div className="mt-4" style={{ height: h }}>
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
          <polyline points={points} fill="none" stroke="#0ea5e9" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
          {data.map((d, i) => (
            <circle
              key={d.date}
              cx={(i / (data.length - 1)) * w}
              cy={h - (d.cost / max) * h}
              r={2}
              fill="#0ea5e9"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      </div>
      <div className="mt-2 flex justify-between text-xs text-neutral-400">
        {data.map((d) => (
          <span key={d.date}>{d.date}</span>
        ))}
      </div>
    </div>
  );
}

function ModelBreakdownChart({ data }: { data: ModelBreakdown[] }) {
  const total = data.reduce((s, d) => s + d.cost, 0);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-900">Cost by Model</h3>
      <div className="mt-4 flex items-center gap-6">
        {/* Bar chart */}
        <div className="flex-1 space-y-2">
          {data.map((d) => (
            <div key={d.model} className="flex items-center gap-3">
              <span className="w-28 truncate text-xs font-medium text-neutral-700">{d.model}</span>
              <div className="flex-1 h-5 rounded bg-neutral-100">
                <div
                  className="h-5 rounded"
                  style={{ width: `${d.pct}%`, backgroundColor: d.color }}
                />
              </div>
              <span className="w-14 text-right text-xs text-neutral-500">${d.cost.toFixed(2)}</span>
            </div>
          ))}
        </div>
        {/* Total */}
        <div className="text-center">
          <p className="text-3xl font-bold text-neutral-900">${total.toFixed(2)}</p>
          <p className="text-xs text-neutral-500">total</p>
        </div>
      </div>
    </div>
  );
}

function AgentCostTable({ data }: { data: AgentCostRow[] }) {
  const [sortField, setSortField] = useState<keyof AgentCostRow>("totalCost");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...data].sort((a, b) => {
    const av = a[sortField];
    const bv = b[sortField];
    if (typeof av === "number" && typeof bv === "number") return sortAsc ? av - bv : bv - av;
    return sortAsc
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  function handleSort(field: keyof AgentCostRow) {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  }

  const sortIcon = (field: keyof AgentCostRow) =>
    sortField === field ? (sortAsc ? " \u25B2" : " \u25BC") : "";

  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-neutral-900">Cost by Agent</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 text-left">
              <th className="cursor-pointer px-4 py-2.5 text-xs font-medium text-neutral-500" onClick={() => handleSort("agent")}>
                Agent{sortIcon("agent")}
              </th>
              <th className="cursor-pointer px-4 py-2.5 text-xs font-medium text-neutral-500" onClick={() => handleSort("model")}>
                Model{sortIcon("model")}
              </th>
              <th className="cursor-pointer px-4 py-2.5 text-xs font-medium text-neutral-500 text-right" onClick={() => handleSort("totalCost")}>
                Total Cost{sortIcon("totalCost")}
              </th>
              <th className="cursor-pointer px-4 py-2.5 text-xs font-medium text-neutral-500 text-right" onClick={() => handleSort("totalTokens")}>
                Total Tokens{sortIcon("totalTokens")}
              </th>
              <th className="cursor-pointer px-4 py-2.5 text-xs font-medium text-neutral-500 text-right" onClick={() => handleSort("runs")}>
                Runs{sortIcon("runs")}
              </th>
              <th className="cursor-pointer px-4 py-2.5 text-xs font-medium text-neutral-500 text-right" onClick={() => handleSort("avgCostPerRun")}>
                Avg/Run{sortIcon("avgCostPerRun")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {sorted.map((row) => (
              <tr key={row.agent} className="hover:bg-neutral-50">
                <td className="px-4 py-2.5 text-sm font-medium text-neutral-900">{row.agent}</td>
                <td className="px-4 py-2.5 text-sm text-neutral-600 font-mono text-xs">{row.model}</td>
                <td className="px-4 py-2.5 text-sm text-neutral-700 text-right">${row.totalCost.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-xs text-neutral-500 text-right">{(row.totalTokens / 1000).toFixed(0)}K</td>
                <td className="px-4 py-2.5 text-xs text-neutral-500 text-right">{row.runs}</td>
                <td className="px-4 py-2.5 text-sm text-neutral-700 text-right">${row.avgCostPerRun.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BudgetAlerts({ budgets }: { budgets: BudgetAlert[] }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900">Budget Alerts</h3>
          <button className="text-xs font-medium text-primary-600 hover:text-primary-800">
            + Add Budget
          </button>
        </div>
      </div>
      <div className="divide-y divide-neutral-100">
        {budgets.map((b) => {
          const pct = b.cap > 0 ? Math.min((b.spent / b.cap) * 100, 100) : 0;
          const barColor =
            b.status === "exceeded"
              ? "bg-error-500"
              : b.status === "warning"
              ? "bg-warning-500"
              : "bg-success-500";
          const badgeColor =
            b.status === "exceeded"
              ? "bg-error-100 text-error-700"
              : b.status === "warning"
              ? "bg-warning-100 text-warning-700"
              : "bg-success-100 text-success-700";

          return (
            <div key={b.id} className="px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-900">{b.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">
                    ${b.spent.toFixed(2)} / ${b.cap.toFixed(2)}
                  </span>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badgeColor}`}>
                    {pct.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-neutral-100">
                <div className={`h-2 rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CostTrackingPage() {
  const [dateRange, setDateRange] = useState<DateRange>("7d");

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CostTrackingHeader dateRange={dateRange} onDateRangeChange={setDateRange} />

        <div className="mt-6">
          <SummaryCards />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <CostTrendChart data={mockDailyCosts} />
          <ModelBreakdownChart data={mockModelBreakdown} />
        </div>

        <div className="mt-6">
          <AgentCostTable data={mockAgentCosts} />
        </div>

        <div className="mt-6">
          <BudgetAlerts budgets={mockBudgets} />
        </div>
      </div>
    </div>
  );
}
