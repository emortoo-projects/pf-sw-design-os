import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { SchemaIndex, SchemaTable, IndexType } from './types'
import { generateId } from './types'

interface AddIndexDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tables: SchemaTable[]
  onAdd: (index: SchemaIndex) => void
}

const INDEX_TYPES: IndexType[] = ['btree', 'hash', 'gin', 'gist', 'unique']

export function AddIndexDialog({ open, onOpenChange, tables, onAdd }: AddIndexDialogProps) {
  const [table, setTable] = useState(tables[0]?.name ?? '')
  const [columns, setColumns] = useState('')
  const [type, setType] = useState<IndexType>('btree')
  const [rationale, setRationale] = useState('')

  const selectedTable = tables.find((t) => t.name === table)
  const isValid = table && columns.trim().length > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    onAdd({
      id: generateId('idx'),
      table,
      columns: columns.split(',').map((c) => c.trim()).filter(Boolean),
      type,
      rationale: rationale || `Index on ${table}(${columns})`,
    })
    // Reset all state
    setTable(tables[0]?.name ?? '')
    setColumns('')
    setType('btree')
    setRationale('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Add Index</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Table select */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">Table</label>
          <select
            value={table}
            onChange={(e) => setTable(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            {tables.map((t) => (
              <option key={t.name} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Columns */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">Columns</label>
          {selectedTable && (
            <p className="text-xs text-zinc-400">
              Available: {selectedTable.columns.map((c) => c.name).join(', ')}
            </p>
          )}
          <input
            type="text"
            value={columns}
            onChange={(e) => setColumns(e.target.value)}
            placeholder="e.g., user_id, created_at"
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-mono placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        {/* Type */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">Index Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as IndexType)}
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            {INDEX_TYPES.map((t) => (
              <option key={t} value={t}>{t.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* Rationale */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">Rationale</label>
          <input
            type="text"
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Why this index is needed"
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={!isValid}>
            Add Index
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
