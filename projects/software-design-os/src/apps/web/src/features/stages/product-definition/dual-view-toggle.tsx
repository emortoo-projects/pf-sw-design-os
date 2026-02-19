import { FileText, Code2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ViewMode = 'structured' | 'raw'

interface DualViewToggleProps {
  mode: ViewMode
  onToggle: (mode: ViewMode) => void
}

export function DualViewToggle({ mode, onToggle }: DualViewToggleProps) {
  return (
    <div className="inline-flex items-center rounded-md border border-zinc-200 bg-zinc-100 p-0.5">
      <button
        onClick={() => onToggle('structured')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors',
          mode === 'structured'
            ? 'bg-white text-zinc-900 shadow-sm'
            : 'text-zinc-500 hover:text-zinc-700',
        )}
      >
        <FileText className="h-3.5 w-3.5" />
        Structured
      </button>
      <button
        onClick={() => onToggle('raw')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors',
          mode === 'raw'
            ? 'bg-white text-zinc-900 shadow-sm'
            : 'text-zinc-500 hover:text-zinc-700',
        )}
      >
        <Code2 className="h-3.5 w-3.5" />
        Raw JSON
      </button>
    </div>
  )
}
