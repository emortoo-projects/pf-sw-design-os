import { List, Code, FileJson } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ApiViewMode = 'structured' | 'openapi' | 'json'

interface ApiViewToggleProps {
  mode: ApiViewMode
  onToggle: (mode: ApiViewMode) => void
}

const views: Array<{ value: ApiViewMode; label: string; icon: typeof List }> = [
  { value: 'structured', label: 'Structured', icon: List },
  { value: 'openapi', label: 'OpenAPI', icon: Code },
  { value: 'json', label: 'JSON', icon: FileJson },
]

export function ApiViewToggle({ mode, onToggle }: ApiViewToggleProps) {
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
