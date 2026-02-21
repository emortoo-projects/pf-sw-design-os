"use client";

import { useState } from "react";

type Period = "day" | "week" | "month";

interface CostEntry {
  id: string;
  date: string;
  provider: string;
  model: string;
  tokens: number;
  cost: number;
  agentName: string;
}

interface BudgetSummary {
  id: string;
  name: string;
  limit: string;
  currentSpend: string;
  period: string;
}

const providerColors: Record<string, string> = {
  openai: "bg-green-500",
  anthropic: "bg-purple-500",
  google: "bg-blue-500",
  other: "bg-gray-500",
};

export default function CostAnalyticsPage() {
  const [period, setPeriod] = useState<Period>("week");

  // Placeholder data - will be connected to tRPC
  const totalCost = 0;
  const costsByProvider: Record<string, number> = {};
  const costEntries: CostEntry[] = [];
  const budgets: BudgetSummary[] = [];
  const loading = false;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cost Analytics</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track and analyze API spending across providers
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(["day", "week", "month"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  period === p
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 border"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Spend ({period})</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">${totalCost.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Active Providers</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{Object.keys(costsByProvider).length}</p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Active Budgets</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{budgets.length}</p>
          </div>
        </div>

        {/* Provider Breakdown */}
        <div className="mt-8 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Cost by Provider</h2>
          <div className="mt-4">
            {Object.keys(costsByProvider).length === 0 ? (
              <p className="text-sm text-gray-500">No cost data available</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(costsByProvider).map(([provider, cost]) => {
                  const percent = totalCost > 0 ? (cost / totalCost) * 100 : 0;
                  return (
                    <div key={provider}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize text-gray-700">{provider}</span>
                        <span className="text-gray-500">${cost.toFixed(2)} ({percent.toFixed(1)}%)</span>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                        <div
                          className={`h-2 rounded-full ${providerColors[provider] || providerColors.other}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Budget Tracking */}
        <div className="mt-8 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Budget Tracking</h2>
          <div className="mt-4 space-y-4">
            {budgets.length === 0 ? (
              <p className="text-sm text-gray-500">No budgets configured</p>
            ) : (
              budgets.map((budget) => {
                const limit = parseFloat(budget.limit);
                const spent = parseFloat(budget.currentSpend);
                const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
                return (
                  <div key={budget.id} className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{budget.name}</span>
                      <span className="text-sm text-gray-500 capitalize">{budget.period}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-gray-500">${spent.toFixed(2)} / ${limit.toFixed(2)}</span>
                      <span className={`font-medium ${percent > 80 ? "text-red-600" : "text-gray-600"}`}>
                        {percent.toFixed(0)}%
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                      <div
                        className={`h-2 rounded-full transition-all ${percent > 80 ? "bg-red-500" : "bg-blue-500"}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Cost History Table */}
        <div className="mt-8 rounded-lg border bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Cost History</h2>
          </div>
          {loading ? (
            <div className="p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="mb-3 h-10 animate-pulse rounded bg-gray-100" />
              ))}
            </div>
          ) : costEntries.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-gray-500">No cost entries found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Agent</th>
                    <th className="px-6 py-3">Provider</th>
                    <th className="px-6 py-3">Model</th>
                    <th className="px-6 py-3 text-right">Tokens</th>
                    <th className="px-6 py-3 text-right">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {costEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-500">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{entry.agentName}</td>
                      <td className="px-6 py-3 text-sm capitalize text-gray-500">{entry.provider}</td>
                      <td className="px-6 py-3 text-sm text-gray-500">{entry.model}</td>
                      <td className="px-6 py-3 text-right text-sm text-gray-500">
                        {entry.tokens.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                        ${entry.cost.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
