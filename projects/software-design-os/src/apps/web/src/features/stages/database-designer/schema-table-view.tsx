import { Key, Link2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { SchemaTable } from './types'

interface SchemaTableViewProps {
  tables: SchemaTable[]
}

export function SchemaTableView({ tables }: SchemaTableViewProps) {
  if (tables.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-400">No tables generated yet.</p>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {tables.map((table) => (
        <div key={table.name} className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
          {/* Table header */}
          <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-2">
            <h4 className="text-sm font-semibold text-zinc-900 font-mono">{table.name}</h4>
          </div>
          {/* Columns */}
          <div className="divide-y divide-zinc-50">
            {table.columns.map((col) => (
              <div key={col.name} className="flex items-center gap-2 px-4 py-1.5">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  {col.isPrimaryKey && (
                    <Key className="h-3 w-3 shrink-0 text-warning-500" />
                  )}
                  {col.isForeignKey && !col.isPrimaryKey && (
                    <Link2 className="h-3 w-3 shrink-0 text-primary-500" />
                  )}
                  <span className="text-xs font-mono text-zinc-900 truncate">{col.name}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 shrink-0">{col.type}</span>
                {!col.nullable && (
                  <Badge variant="secondary" className="text-[9px] px-1 py-0">NOT NULL</Badge>
                )}
              </div>
            ))}
          </div>
          {/* Column count */}
          <div className="border-t border-zinc-100 px-4 py-1.5">
            <p className="text-[10px] text-zinc-400">{table.columns.length} columns</p>
          </div>
        </div>
      ))}
    </div>
  )
}
