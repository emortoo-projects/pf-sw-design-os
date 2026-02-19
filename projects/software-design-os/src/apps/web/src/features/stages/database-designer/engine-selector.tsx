import { Database, Server, HardDrive, FileJson, Cloud, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DB_ENGINES, type DbEngine } from './types'

interface EngineSelectorProps {
  selected: DbEngine
  onChange: (engine: DbEngine) => void
}

const engineIcons: Record<DbEngine, typeof Database> = {
  postgresql: Database,
  mysql: Server,
  sqlite: HardDrive,
  mongodb: FileJson,
  supabase: Cloud,
  planetscale: Zap,
}

export function EngineSelector({ selected, onChange }: EngineSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-700">Database Engine</label>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-label="Database engine">
        {DB_ENGINES.map((engine) => {
          const Icon = engineIcons[engine.id]
          const isSelected = selected === engine.id
          return (
            <button
              key={engine.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(engine.id)}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-3 text-left transition-all',
                isSelected
                  ? 'border-primary-400 bg-primary-50 ring-1 ring-primary-200'
                  : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50',
              )}
            >
              <div
                className={cn(
                  'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                  isSelected ? 'bg-primary-100 text-primary-600' : 'bg-zinc-100 text-zinc-500',
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className={cn('text-sm font-semibold', isSelected ? 'text-primary-900' : 'text-zinc-900')}>
                  {engine.name}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{engine.description}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
