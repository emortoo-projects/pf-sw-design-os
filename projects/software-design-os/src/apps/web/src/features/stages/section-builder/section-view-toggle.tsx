import { LayoutDashboard, FileJson } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SectionViewMode = 'visual' | 'json'

interface SectionViewToggleProps {
  mode: SectionViewMode
  onToggle: (mode: SectionViewMode) => void
}

const views: Array<{ value: SectionViewMode; label: string; icon: typeof LayoutDashboard }> = [
  { value: 'visual', label: 'Visual', icon: LayoutDashboard },
  { value: 'json', label: 'JSON', icon: FileJson },
]

export function SectionViewToggle({ mode, onToggle }: SectionViewToggleProps) {
  return (
    <div className="inline-flex rounded-md border border-zinc-200 bg-zinc-50 p-0.5" role="radiogroup" aria-label="View mode">
      {views.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={mode === value}
          onClick={() => onToggle(value)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-sm px-3 py-1 text-xs font-medium transition-colors',
            mode === value
              ? 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-700',
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  )
}
