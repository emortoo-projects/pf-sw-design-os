import type { ModelUsage } from '@/lib/api-client'

interface ModelBreakdownProps {
  models: ModelUsage[]
}

const BAR_COLORS = [
  'bg-primary-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-rose-500',
]

export function ModelBreakdown({ models }: ModelBreakdownProps) {
  if (models.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Model Usage
        </h4>
        <p className="py-4 text-center text-sm text-zinc-400">No model data</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Model Usage
      </h4>
      <div className="space-y-2.5">
        {models.map((m, i) => (
          <div key={m.model} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-700">{m.model}</span>
              <span className="text-zinc-500">{m.percentage}%</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-100">
              <div
                className={`h-2 rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
                style={{ width: `${m.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
