import { Palette, FileJson, Code } from 'lucide-react'
import { cn } from '@/lib/utils'

export type DesignViewMode = 'visual' | 'json' | 'css'

interface DesignViewToggleProps {
  mode: DesignViewMode
  onToggle: (mode: DesignViewMode) => void
}

const views: Array<{ value: DesignViewMode; label: string; icon: typeof Palette }> = [
  { value: 'visual', label: 'Visual', icon: Palette },
  { value: 'json', label: 'JSON', icon: FileJson },
  { value: 'css', label: 'CSS', icon: Code },
]

export function DesignViewToggle({ mode, onToggle }: DesignViewToggleProps) {
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
