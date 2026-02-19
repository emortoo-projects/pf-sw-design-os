import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { EnvVar } from './types'
import { createEmptyEnvVar } from './types'

interface EnvVarManagerProps {
  envVars: EnvVar[]
  onChange: (envVars: EnvVar[]) => void
}

function EnvVarRow({ envVar, onUpdate, onRemove }: { envVar: EnvVar; onUpdate: (updates: Partial<EnvVar>) => void; onRemove: () => void }) {
  return (
    <tr className="border-b border-zinc-100 last:border-0">
      <td className="py-1.5 pr-2">
        <input
          type="text"
          value={envVar.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="VAR_NAME"
          className="w-full rounded border border-zinc-200 bg-white px-2 py-1 font-mono text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </td>
      <td className="py-1.5 px-2 text-center">
        <input
          type="checkbox"
          checked={envVar.required}
          onChange={(e) => onUpdate({ required: e.target.checked })}
          className="h-3.5 w-3.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="py-1.5 px-2">
        <input
          type="text"
          value={envVar.defaultValue}
          onChange={(e) => onUpdate({ defaultValue: e.target.value })}
          placeholder="default"
          className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </td>
      <td className="py-1.5 px-2">
        <input
          type="text"
          value={envVar.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Description"
          className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </td>
      <td className="py-1.5 pl-2 text-right">
        <button type="button" onClick={onRemove} aria-label="Remove variable" className="text-zinc-300 hover:text-red-500 transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  )
}

export function EnvVarManager({ envVars, onChange }: EnvVarManagerProps) {
  function updateVar(id: string, updates: Partial<EnvVar>) {
    onChange(envVars.map((v) => (v.id === id ? { ...v, ...updates } : v)))
  }

  function removeVar(id: string) {
    onChange(envVars.filter((v) => v.id !== id))
  }

  function addVar() {
    onChange([...envVars, createEmptyEnvVar()])
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-700">Environment Variables</label>
        <Button variant="ghost" size="sm" onClick={addVar}>
          <Plus className="h-3.5 w-3.5" />
          Add Variable
        </Button>
      </div>

      {envVars.length === 0 && (
        <p className="py-4 text-center text-xs text-zinc-400">No environment variables defined.</p>
      )}

      {envVars.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="py-2 pr-2 pl-3 text-left font-medium text-zinc-600">Name</th>
                <th className="py-2 px-2 text-center font-medium text-zinc-600">Required</th>
                <th className="py-2 px-2 text-left font-medium text-zinc-600">Default</th>
                <th className="py-2 px-2 text-left font-medium text-zinc-600">Description</th>
                <th className="py-2 pl-2 pr-3 text-right font-medium text-zinc-600"></th>
              </tr>
            </thead>
            <tbody className="px-3">
              {envVars.map((envVar) => (
                <EnvVarRow
                  key={envVar.id}
                  envVar={envVar}
                  onUpdate={(updates) => updateVar(envVar.id, updates)}
                  onRemove={() => removeVar(envVar.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
