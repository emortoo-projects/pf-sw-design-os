import { Trash2 } from 'lucide-react'
import type { EntityField, FieldType } from './types'
import { FIELD_TYPES } from './types'

interface FieldEditorProps {
  field: EntityField
  onChange: (field: EntityField) => void
  onRemove: () => void
}

export function FieldEditor({ field, onChange, onRemove }: FieldEditorProps) {
  function update(updates: Partial<EntityField>) {
    onChange({ ...field, ...updates })
  }

  const isEnumType = field.type.startsWith('enum(')

  return (
    <div className="group flex items-center gap-2 rounded px-2 py-1 hover:bg-zinc-50">
      <input
        type="text"
        value={field.name}
        onChange={(e) => update({ name: e.target.value })}
        placeholder="field_name"
        className="w-28 shrink-0 border-0 bg-transparent font-mono text-xs text-zinc-900 placeholder:text-zinc-300 focus:outline-none"
      />

      {isEnumType ? (
        <input
          type="text"
          value={field.type}
          onChange={(e) => update({ type: e.target.value as FieldType })}
          placeholder="enum(a,b,c)"
          className="w-32 shrink-0 rounded border border-zinc-200 bg-white px-2 py-0.5 font-mono text-xs text-zinc-600 focus:border-primary-300 focus:outline-none"
        />
      ) : (
        <select
          value={field.type}
          onChange={(e) => update({ type: e.target.value as FieldType })}
          className="w-24 shrink-0 rounded border border-zinc-200 bg-white px-1 py-0.5 text-xs text-zinc-600 focus:border-primary-300 focus:outline-none"
        >
          {FIELD_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
          <option value="enum()">enum(...)</option>
        </select>
      )}

      <button
        onClick={() => update({ required: !field.required })}
        className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
          field.required
            ? 'bg-error-50 text-error-500'
            : 'bg-zinc-100 text-zinc-400'
        }`}
      >
        {field.required ? 'REQ' : 'OPT'}
      </button>

      <input
        type="text"
        value={field.description}
        onChange={(e) => update({ description: e.target.value })}
        placeholder="Description..."
        className="min-w-0 flex-1 border-0 bg-transparent text-xs text-zinc-400 placeholder:text-zinc-200 focus:outline-none"
      />

      <button
        onClick={onRemove}
        className="shrink-0 text-zinc-200 opacity-0 transition-opacity hover:text-error-500 group-hover:opacity-100"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  )
}
