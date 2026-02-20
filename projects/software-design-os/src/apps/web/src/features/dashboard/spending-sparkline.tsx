interface SpendingSparklineProps {
  data: Array<{ date: string; cost: number }>
}

export function SpendingSparkline({ data }: SpendingSparklineProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Spending (7 days)
        </h4>
        <p className="py-4 text-center text-sm text-zinc-400">No spending data</p>
      </div>
    )
  }

  const maxCost = Math.max(...data.map((d) => d.cost), 0.01)
  const total = data.reduce((s, d) => s + d.cost, 0)

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Spending (7 days)
        </h4>
        <span className="text-sm font-semibold text-zinc-700">${total.toFixed(2)}</span>
      </div>
      <div className="flex h-16 items-end gap-1">
        {data.map((point) => {
          const heightPct = (point.cost / maxCost) * 100
          return (
            <div
              key={point.date}
              className="flex-1 rounded-t-sm bg-primary-400 transition-colors hover:bg-primary-500"
              style={{ height: `${Math.max(heightPct, 4)}%` }}
              title={`${point.date}: $${point.cost.toFixed(3)}`}
            />
          )
        })}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-zinc-400">
        <span>{data[0]?.date.slice(5)}</span>
        <span>{data[data.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  )
}
