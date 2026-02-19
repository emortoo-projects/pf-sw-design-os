import { useState } from 'react'
import { Coins, Zap, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UsageSummary, UsagePeriod } from './types'

interface UsageStatsProps {
  usage: UsageSummary
  onPeriodChange: (period: UsagePeriod) => void
}

const PERIODS: Array<{ id: UsagePeriod; label: string }> = [
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: '90d', label: '90 days' },
  { id: 'all', label: 'All time' },
]

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function BarChart({
  items,
  labelKey,
  valueKey,
  maxValue,
  colorFn,
}: {
  items: Array<Record<string, unknown>>
  labelKey: string
  valueKey: string
  maxValue: number
  colorFn: (i: number) => string
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const label = String(item[labelKey])
        const value = Number(item[valueKey])
        const pct = maxValue > 0 ? (value / maxValue) * 100 : 0
        return (
          <div key={label} className="space-y-0.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-700 truncate">{label}</span>
              <span className="text-zinc-500">${value.toFixed(2)}</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-100">
              <div
                className={cn('h-2 rounded-full', colorFn(i))}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TrendChart({ data }: { data: Array<{ date: string; cost: number }> }) {
  if (data.length === 0) return null
  const maxCost = Math.max(...data.map((d) => d.cost), 0.01)
  const barWidth = 100 / data.length

  return (
    <div className="flex h-24 items-end gap-px">
      {data.map((point) => {
        const heightPct = (point.cost / maxCost) * 100
        return (
          <div
            key={point.date}
            className="bg-primary-400 rounded-t-sm hover:bg-primary-500 transition-colors"
            style={{
              width: `${barWidth}%`,
              height: `${Math.max(heightPct, 2)}%`,
            }}
            title={`${point.date}: $${point.cost.toFixed(3)}`}
          />
        )
      })}
    </div>
  )
}

const BAR_COLORS = [
  'bg-primary-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-rose-500',
]

export function UsageStats({ usage, onPeriodChange }: UsageStatsProps) {
  const [period, setPeriod] = useState<UsagePeriod>('30d')

  function handlePeriodChange(p: UsagePeriod) {
    setPeriod(p)
    onPeriodChange(p)
  }

  const maxProjectCost = Math.max(...usage.byProject.map((p) => p.cost), 0.01)
  const maxModelCost = Math.max(...usage.byModel.map((m) => m.cost), 0.01)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">Usage & Costs</h3>
          <p className="text-xs text-zinc-500">AI generation usage and spending</p>
        </div>
        <div className="flex rounded-md border border-zinc-200 text-xs">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePeriodChange(p.id)}
              className={cn(
                'px-2.5 py-1 font-medium first:rounded-l-md last:rounded-r-md',
                period === p.id
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-600 hover:bg-zinc-100',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-50">
            <Zap className="h-4 w-4 text-primary-600" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">Total Tokens</p>
            <p className="text-lg font-semibold text-zinc-900">{formatTokens(usage.totalTokens)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50">
            <Coins className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">Total Cost</p>
            <p className="text-lg font-semibold text-zinc-900">${usage.totalCost.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-50">
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">Avg Daily</p>
            <p className="text-lg font-semibold text-zinc-900">
              ${usage.trend.length > 0 ? (usage.totalCost / usage.trend.length).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <h4 className="mb-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
          Spending Trend
        </h4>
        <TrendChart data={usage.trend} />
        <div className="mt-1 flex justify-between text-[10px] text-zinc-400">
          <span>{usage.trend[0]?.date}</span>
          <span>{usage.trend[usage.trend.length - 1]?.date}</span>
        </div>
      </div>

      {/* Breakdown Charts */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <h4 className="mb-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
            By Project
          </h4>
          <BarChart
            items={usage.byProject as unknown as Array<Record<string, unknown>>}
            labelKey="projectName"
            valueKey="cost"
            maxValue={maxProjectCost}
            colorFn={(i) => BAR_COLORS[i % BAR_COLORS.length]}
          />
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <h4 className="mb-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
            By Model
          </h4>
          <BarChart
            items={usage.byModel as unknown as Array<Record<string, unknown>>}
            labelKey="model"
            valueKey="cost"
            maxValue={maxModelCost}
            colorFn={(i) => BAR_COLORS[i % BAR_COLORS.length]}
          />
        </div>
      </div>
    </div>
  )
}
