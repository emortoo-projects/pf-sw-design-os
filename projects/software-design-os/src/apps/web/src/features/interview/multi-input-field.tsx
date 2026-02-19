import { useState, useRef } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Entry {
  id: number
  value: string
}

interface MultiInputFieldProps {
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  addButtonLabel?: string
  maxItems?: number
}

export function MultiInputField({
  values,
  onChange,
  placeholder,
  addButtonLabel = '+ Add another',
  maxItems = 8,
}: MultiInputFieldProps) {
  const nextId = useRef(0)
  const [entries, setEntries] = useState<Entry[]>(() => {
    const vals = values.length === 0 ? [''] : values
    return vals.map((v) => ({ id: nextId.current++, value: v }))
  })

  function syncToParent(next: Entry[]) {
    setEntries(next)
    onChange(next.map((e) => e.value))
  }

  function handleChange(id: number, value: string) {
    syncToParent(entries.map((e) => (e.id === id ? { ...e, value } : e)))
  }

  function handleAdd() {
    if (entries.length < maxItems) {
      syncToParent([...entries, { id: nextId.current++, value: '' }])
    }
  }

  function handleRemove(id: number) {
    if (entries.length <= 1) {
      syncToParent([{ id: nextId.current++, value: '' }])
      return
    }
    syncToParent(entries.filter((e) => e.id !== id))
  }

  return (
    <div className="space-y-2">
      {entries.map((entry, index) => (
        <div key={entry.id} className="flex items-start gap-2">
          <span className="mt-2.5 text-xs font-medium text-zinc-400 tabular-nums w-5 shrink-0">
            {index + 1}.
          </span>
          <textarea
            value={entry.value}
            onChange={(e) => handleChange(entry.id, e.target.value)}
            placeholder={placeholder}
            rows={2}
            aria-label={`Item ${index + 1}`}
            className="flex-1 resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
          />
          <button
            type="button"
            onClick={() => handleRemove(entry.id)}
            aria-label={`Remove item ${index + 1}`}
            className="mt-2 shrink-0 rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      {entries.length < maxItems && (
        <Button variant="ghost" size="sm" onClick={handleAdd} className="text-primary-600">
          <Plus className="h-3.5 w-3.5" />
          {addButtonLabel}
        </Button>
      )}
    </div>
  )
}
