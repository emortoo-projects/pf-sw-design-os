import { ArrowRight } from 'lucide-react'
import type { Migration } from './types'

interface MigrationPlanProps {
  migrations: Migration[]
}

export function MigrationPlan({ migrations }: MigrationPlanProps) {
  if (migrations.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-zinc-400">No migrations generated yet.</p>
    )
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-700">
        Migration Plan ({migrations.length} steps)
      </label>
      <div className="space-y-2">
        {migrations.map((migration, index) => (
          <div key={migration.id} className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-white px-4 py-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
              {migration.step}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono font-medium text-zinc-900">{migration.name}</p>
                {index < migrations.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-zinc-300" />
                )}
              </div>
              <p className="mt-0.5 text-xs text-zinc-500">{migration.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
