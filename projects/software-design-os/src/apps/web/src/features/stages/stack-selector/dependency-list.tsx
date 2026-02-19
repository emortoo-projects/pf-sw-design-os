import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Dependency } from './types'

interface DependencyListProps {
  dependencies: Dependency[]
  onChange: (dependencies: Dependency[]) => void
  onAddClick: () => void
}

export function DependencyList({ dependencies, onChange, onAddClick }: DependencyListProps) {
  function handleRemove(id: string) {
    onChange(dependencies.filter((dep) => dep.id !== id))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-700">
          Dependencies ({dependencies.length})
        </label>
        <Button variant="outline" size="sm" onClick={onAddClick}>
          <Plus className="h-3.5 w-3.5" />
          Add Dependency
        </Button>
      </div>

      {dependencies.length === 0 ? (
        <p className="py-4 text-center text-sm text-zinc-400">No dependencies defined.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-3 py-2 text-left font-medium text-zinc-600">Name</th>
                <th className="px-3 py-2 text-left font-medium text-zinc-600">Version</th>
                <th className="px-3 py-2 text-left font-medium text-zinc-600">Type</th>
                <th className="px-3 py-2 text-left font-medium text-zinc-600">Description</th>
                <th className="w-10 px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {dependencies.map((dep) => (
                <tr key={dep.id} className="hover:bg-zinc-50">
                  <td className="px-3 py-2">
                    <span className="font-mono text-xs text-zinc-900">{dep.name}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-mono text-xs text-zinc-700">{dep.version}</span>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={dep.dev ? 'warning' : 'secondary'} className="text-[10px]">
                      {dep.dev ? 'dev' : 'prod'}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-xs text-zinc-500">{dep.description ?? '-'}</span>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => handleRemove(dep.id)}
                      aria-label={`Remove ${dep.name}`}
                      className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-error-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
