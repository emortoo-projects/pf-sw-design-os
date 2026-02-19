import type { Entity } from './types'
import { EntityCard } from './entity-card'

interface EntityCanvasProps {
  entities: Entity[]
  onChange: (entities: Entity[]) => void
  drawingMode: boolean
  selectedEntityId: string | null
  onEntitySelect: (id: string) => void
}

export function EntityCanvas({
  entities,
  onChange,
  drawingMode,
  selectedEntityId,
  onEntitySelect,
}: EntityCanvasProps) {
  function handleEntityChange(id: string, updated: Entity) {
    onChange(entities.map((e) => (e.id === id ? updated : e)))
  }

  function handleEntityDelete(id: string) {
    onChange(entities.filter((e) => e.id !== id))
  }

  if (entities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 py-16">
        <p className="text-sm text-zinc-400">No entities yet.</p>
        <p className="text-xs text-zinc-300">Click Generate or Add Entity to get started.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {entities.map((entity) => (
        <EntityCard
          key={entity.id}
          entity={entity}
          onChange={(updated) => handleEntityChange(entity.id, updated)}
          onDelete={() => handleEntityDelete(entity.id)}
          isSelected={selectedEntityId === entity.id}
          onSelect={() => onEntitySelect(entity.id)}
          drawingMode={drawingMode}
        />
      ))}
    </div>
  )
}
