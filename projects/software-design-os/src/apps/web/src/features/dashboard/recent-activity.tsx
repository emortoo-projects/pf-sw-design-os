import { Clock, Zap } from 'lucide-react'
import type { RecentGeneration } from '@/lib/api-client'

interface RecentActivityProps {
  generations: RecentGeneration[]
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function RecentActivity({ generations }: RecentActivityProps) {
  if (generations.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Recent Activity
        </h4>
        <p className="py-4 text-center text-sm text-zinc-400">No recent generations</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Recent Activity
      </h4>
      <div className="space-y-3">
        {generations.map((gen) => (
          <div key={gen.id} className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-100">
              <Zap className="h-3.5 w-3.5 text-zinc-500" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-zinc-800">
                  {gen.stageLabel}
                </p>
                <span className="shrink-0 text-xs text-zinc-400">${gen.cost.toFixed(3)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <span className="truncate">{gen.projectName}</span>
                <span>&middot;</span>
                <span>{gen.model}</span>
                <span>&middot;</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {timeAgo(gen.createdAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
