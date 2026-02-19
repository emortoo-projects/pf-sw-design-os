import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { SchemaIndex, IndexType } from './types'

interface IndexingStrategyProps {
  indexes: SchemaIndex[]
  onChange: (indexes: SchemaIndex[]) => void
  onAddClick: () => void
}

const typeColors: Record<IndexType, 'default' | 'secondary' | 'success' | 'warning' | 'outline'> = {
  btree: 'secondary',
  hash: 'secondary',
  gin: 'default',
  gist: 'default',
  unique: 'warning',
}

export function IndexingStrategy({ indexes, onChange, onAddClick }: IndexingStrategyProps) {
  function handleRemove(id: string) {
    onChange(indexes.filter((idx) => idx.id !== id))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-700">
          Indexing Strategy ({indexes.length})
        </label>
        <Button variant="outline" size="sm" onClick={onAddClick}>
          <Plus className="h-3.5 w-3.5" />
          Add Index
        </Button>
      </div>

      {indexes.length === 0 ? (
        <p className="py-4 text-center text-sm text-zinc-400">No indexes defined.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-3 py-2 text-left font-medium text-zinc-600">Table</th>
                <th className="px-3 py-2 text-left font-medium text-zinc-600">Columns</th>
                <th className="px-3 py-2 text-left font-medium text-zinc-600">Type</th>
                <th className="px-3 py-2 text-left font-medium text-zinc-600">Rationale</th>
                <th className="w-10 px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {indexes.map((idx) => (
                <tr key={idx.id} className="hover:bg-zinc-50">
                  <td className="px-3 py-2">
                    <span className="font-mono text-xs text-zinc-900">{idx.table}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-mono text-xs text-zinc-700">
                      {idx.columns.join(', ')}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={typeColors[idx.type]} className="text-[10px] uppercase">
                      {idx.type}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-xs text-zinc-500">{idx.rationale}</span>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => handleRemove(idx.id)}
                      aria-label={`Remove index on ${idx.table}(${idx.columns.join(', ')})`}
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
