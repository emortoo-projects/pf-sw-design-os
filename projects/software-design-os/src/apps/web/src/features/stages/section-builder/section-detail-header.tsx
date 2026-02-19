import type { SectionSpec } from './types'

interface SectionDetailHeaderProps {
  section: SectionSpec
  onChange: (updates: Partial<SectionSpec>) => void
}

export function SectionDetailHeader({ section, onChange }: SectionDetailHeaderProps) {
  return (
    <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">Section Name</label>
          <input
            type="text"
            value={section.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-300"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">Route</label>
          <input
            type="text"
            value={section.route}
            onChange={(e) => onChange({ route: e.target.value })}
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm font-mono text-zinc-900 outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-300"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-zinc-500">Description</label>
        <textarea
          value={section.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-300"
        />
      </div>
    </div>
  )
}
