import { ArrowRight, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Entity, Relationship, RelationshipType } from './types'

interface RelationshipPanelProps {
  relationships: Relationship[]
  entities: Entity[]
  onChange: (relationships: Relationship[]) => void
}

const typeLabels: Record<RelationshipType, string> = {
  'one-to-one': '1:1',
  'one-to-many': '1:N',
  'many-to-many': 'M:N',
}

export function RelationshipPanel({ relationships, entities, onChange }: RelationshipPanelProps) {
  function getEntityName(id: string): string {
    return entities.find((e) => e.id === id)?.name || 'Unknown'
  }

  function handleRemove(id: string) {
    onChange(relationships.filter((r) => r.id !== id))
  }

  function handleTypeChange(id: string, type: RelationshipType) {
    onChange(relationships.map((r) => (r.id === id ? { ...r, type } : r)))
  }

  if (relationships.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-200 py-6 text-center">
        <p className="text-sm text-zinc-400">No relationships defined yet.</p>
        <p className="text-xs text-zinc-300">Use "Add Relationship" to connect entities.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-zinc-700">Relationships</h3>
      <div className="space-y-1">
        {relationships.map((rel) => (
          <div
            key={rel.id}
            className="group flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2"
          >
            <span className="text-sm font-medium text-zinc-900">{getEntityName(rel.fromEntityId)}</span>
            <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-900">{getEntityName(rel.toEntityId)}</span>

            <select
              value={rel.type}
              onChange={(e) => handleTypeChange(rel.id, e.target.value as RelationshipType)}
              className="ml-2 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-xs text-zinc-600 focus:border-primary-300 focus:outline-none"
            >
              <option value="one-to-one">1:1</option>
              <option value="one-to-many">1:N</option>
              <option value="many-to-many">M:N</option>
            </select>

            <Badge variant="outline" className="text-[10px]">
              {rel.foreignKey}
            </Badge>

            <span className="flex-1 truncate text-xs text-zinc-400">{rel.description}</span>

            <button
              onClick={() => handleRemove(rel.id)}
              className="shrink-0 text-zinc-300 opacity-0 transition-opacity hover:text-error-500 group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
