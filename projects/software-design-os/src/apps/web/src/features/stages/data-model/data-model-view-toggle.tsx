import { LayoutGrid, Code2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type DataModelViewMode = 'visual' | 'typescript'

interface DataModelViewToggleProps {
  mode: DataModelViewMode
  onToggle: (mode: DataModelViewMode) => void
}

export function DataModelViewToggle({ mode, onToggle }: DataModelViewToggleProps) {
  return (
    <div className="inline-flex items-center rounded-md border border-zinc-200 bg-zinc-100 p-0.5">
      <button
        onClick={() => onToggle('visual')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors',
          mode === 'visual'
            ? 'bg-white text-zinc-900 shadow-sm'
            : 'text-zinc-500 hover:text-zinc-700',
        )}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Visual
      </button>
      <button
        onClick={() => onToggle('typescript')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors',
          mode === 'typescript'
            ? 'bg-white text-zinc-900 shadow-sm'
            : 'text-zinc-500 hover:text-zinc-700',
        )}
      >
        <Code2 className="h-3.5 w-3.5" />
        TypeScript
      </button>
    </div>
  )
}
