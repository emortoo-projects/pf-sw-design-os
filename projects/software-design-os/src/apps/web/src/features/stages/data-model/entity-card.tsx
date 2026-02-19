import { Plus, Trash2, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Entity, EntityField } from './types'
import { createEmptyField } from './types'
import { FieldEditor } from './field-editor'

interface EntityCardProps {
  entity: Entity
  onChange: (entity: Entity) => void
  onDelete: () => void
  isSelected: boolean
  onSelect: () => void
  drawingMode: boolean
}

export function EntityCard({
  entity,
  onChange,
  onDelete,
  isSelected,
  onSelect,
  drawingMode,
}: EntityCardProps) {
  function updateField(fieldId: string, updated: EntityField) {
    onChange({
      ...entity,
      fields: entity.fields.map((f) => (f.id === fieldId ? updated : f)),
    })
  }

  function removeField(fieldId: string) {
    onChange({
      ...entity,
      fields: entity.fields.filter((f) => f.id !== fieldId),
    })
  }

  function addField() {
    onChange({ ...entity, fields: [...entity.fields, createEmptyField()] })
  }

  return (
    <div
      onClick={drawingMode ? onSelect : undefined}
      className={cn(
        'rounded-lg border bg-white shadow-sm transition-all',
        isSelected && 'ring-2 ring-primary-400',
        drawingMode && 'cursor-crosshair hover:border-primary-400',
        !drawingMode && 'border-zinc-200',
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3">
        <Database className="h-4 w-4 shrink-0 text-primary-500" />
        <input
          type="text"
          value={entity.name}
          onChange={(e) => onChange({ ...entity, name: e.target.value })}
          placeholder="EntityName"
          className="flex-1 border-0 bg-transparent font-semibold text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-none"
        />
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="text-zinc-300 hover:text-error-500"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Description */}
      <div className="border-b border-zinc-50 px-4 py-2">
        <input
          type="text"
          value={entity.description}
          onChange={(e) => onChange({ ...entity, description: e.target.value })}
          placeholder="Entity description..."
          className="w-full border-0 bg-transparent text-xs text-zinc-400 placeholder:text-zinc-200 focus:outline-none"
        />
      </div>

      {/* Fields */}
      <div className="divide-y divide-zinc-50 px-2 py-1">
        {entity.fields.map((field) => (
          <FieldEditor
            key={field.id}
            field={field}
            onChange={(updated) => updateField(field.id, updated)}
            onRemove={() => removeField(field.id)}
          />
        ))}
      </div>

      {/* Add field */}
      <div className="border-t border-zinc-100 px-3 py-2">
        <Button variant="ghost" size="sm" onClick={addField} className="h-7 w-full text-xs">
          <Plus className="h-3 w-3" />
          Add Field
        </Button>
      </div>
    </div>
  )
}
