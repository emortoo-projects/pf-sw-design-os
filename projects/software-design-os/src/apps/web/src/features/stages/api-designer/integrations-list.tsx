import { Plus, Trash2, Link } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Integration } from './types'

interface IntegrationsListProps {
  integrations: Integration[]
  onChange: (integrations: Integration[]) => void
  onAddClick: () => void
}

export function IntegrationsList({ integrations, onChange, onAddClick }: IntegrationsListProps) {
  function handleRemove(id: string) {
    onChange(integrations.filter((i) => i.id !== id))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-zinc-900">Integrations</h4>
        <Button variant="outline" size="sm" onClick={onAddClick}>
          <Plus className="h-3.5 w-3.5" />
          Add Integration
        </Button>
      </div>

      {integrations.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-200 py-6">
          <Link className="h-5 w-5 text-zinc-300" />
          <p className="text-xs text-zinc-400">No integrations configured</p>
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden divide-y divide-zinc-50">
          {integrations.map((integration) => (
            <div key={integration.id} className="flex items-center gap-3 px-4 py-2.5">
              <Link className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-900">{integration.name}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {integration.events.length} event{integration.events.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <p className="truncate text-xs text-zinc-400">{integration.url}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(integration.id)}
                className="h-7 w-7 p-0 text-zinc-400 hover:text-error-500"
                aria-label={`Remove ${integration.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
