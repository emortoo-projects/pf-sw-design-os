import { ChevronDown, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { EndpointDetail } from './endpoint-detail'
import type { Endpoint, HttpMethod } from './types'
import { METHOD_COLORS } from './types'

interface EndpointListProps {
  endpoints: Endpoint[]
  expandedId: string | null
  onToggle: (id: string) => void
}

function groupByTag(endpoints: Endpoint[]): Record<string, Endpoint[]> {
  const groups: Record<string, Endpoint[]> = {}
  for (const ep of endpoints) {
    const tag = ep.tag || 'Other'
    if (!groups[tag]) groups[tag] = []
    groups[tag].push(ep)
  }
  return groups
}

export function EndpointList({ endpoints, expandedId, onToggle }: EndpointListProps) {
  const groups = groupByTag(endpoints)

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([tag, eps]) => (
        <div key={tag} className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
          <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-zinc-900">{tag}</h4>
            <span className="text-xs text-zinc-400">{eps.length} endpoint{eps.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="divide-y divide-zinc-50">
            {eps.map((ep) => {
              const isExpanded = expandedId === ep.id
              return (
                <div key={ep.id}>
                  <button
                    type="button"
                    onClick={() => onToggle(ep.id)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-zinc-50',
                      isExpanded && 'bg-zinc-50',
                    )}
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                    )}
                    <Badge
                      variant={METHOD_COLORS[ep.method] as 'default' | 'success' | 'warning' | 'destructive'}
                      className="w-16 justify-center text-[10px] uppercase"
                    >
                      {ep.method}
                    </Badge>
                    <span className="font-mono text-xs text-zinc-700">{ep.path}</span>
                    <span className="ml-auto text-xs text-zinc-400 truncate max-w-[200px]">{ep.summary}</span>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-zinc-100 bg-zinc-50/50 px-4 py-3">
                      <EndpointDetail endpoint={ep} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
