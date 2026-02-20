import type { StageOutput } from '@sdos/shared'
import { Badge } from '@/components/ui/badge'

interface OutputVersionBarProps {
  outputs: StageOutput[]
  onActivateVersion: (version: number) => void
  isActivating: boolean
}

export function OutputVersionBar({ outputs, onActivateVersion, isActivating }: OutputVersionBarProps) {
  const sorted = [...outputs].sort((a, b) => b.version - a.version)
  const active = sorted.find((o) => o.isActive) ?? sorted[0]

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const version = parseInt(e.target.value, 10)
    if (version !== active?.version) {
      onActivateVersion(version)
    }
  }

  const formattedDate = active
    ? new Date(active.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  return (
    <div className="flex items-center justify-between rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-zinc-500">
          Version {active?.version ?? 1} of {outputs.length}
        </span>
        <select
          aria-label="Select output version"
          value={active?.version ?? 1}
          onChange={handleChange}
          disabled={isActivating}
          className="rounded border border-zinc-300 bg-white px-2 py-0.5 text-sm text-zinc-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          {sorted.map((o) => (
            <option key={o.version} value={o.version}>
              v{o.version}
              {o.isActive ? ' (active)' : ''}
            </option>
          ))}
        </select>
        {isActivating && <span className="text-xs text-zinc-400">Switching...</span>}
      </div>

      <div className="flex items-center gap-2">
        {active && (
          <Badge variant={active.generatedBy === 'ai' ? 'default' : 'secondary'}>
            {active.generatedBy === 'ai' ? 'AI' : 'Human'}
          </Badge>
        )}
        <span className="text-xs text-zinc-400">{formattedDate}</span>
      </div>
    </div>
  )
}
