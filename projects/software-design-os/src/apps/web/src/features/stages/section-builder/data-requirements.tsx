import { useState } from 'react'
import { X } from 'lucide-react'

interface DataRequirementsProps {
  requirements: string[]
  onChange: (requirements: string[]) => void
}

export function DataRequirements({ requirements, onChange }: DataRequirementsProps) {
  const [inputValue, setInputValue] = useState('')

  function handleAdd() {
    const trimmed = inputValue.trim()
    if (trimmed && !requirements.includes(trimmed)) {
      onChange([...requirements, trimmed])
      setInputValue('')
    }
  }

  function handleRemove(entity: string) {
    onChange(requirements.filter((r) => r !== entity))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-zinc-700">Data Requirements</label>
      <div className="flex flex-wrap gap-1.5">
        {requirements.map((entity) => (
          <span
            key={entity}
            className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700"
          >
            {entity}
            <button
              type="button"
              onClick={() => handleRemove(entity)}
              className="rounded-full p-0.5 hover:bg-primary-100"
              aria-label={`Remove ${entity}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type entity name and press Enter"
        className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-300"
      />
    </div>
  )
}
