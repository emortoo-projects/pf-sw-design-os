import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Feature } from './types'
import { generateId } from './types'

interface FeatureListProps {
  features: Feature[]
  onChange: (features: Feature[]) => void
}

export function FeatureList({ features, onChange }: FeatureListProps) {
  function handleAdd() {
    onChange([...features, { id: generateId(), name: '', description: '' }])
  }

  function handleRemove(id: string) {
    onChange(features.filter((f) => f.id !== id))
  }

  function handleUpdate(id: string, field: 'name' | 'description', value: string) {
    onChange(features.map((f) => (f.id === id ? { ...f, [field]: value } : f)))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-700">Key Features</h3>
        <Button variant="ghost" size="sm" onClick={handleAdd}>
          <Plus className="h-3.5 w-3.5" />
          Add Feature
        </Button>
      </div>

      {features.length === 0 && (
        <p className="py-4 text-center text-sm text-zinc-400">
          No features yet. Click Generate or add manually.
        </p>
      )}

      <div className="space-y-2">
        {features.map((feature) => (
          <div key={feature.id} className="group flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary-100 text-xs font-bold text-primary-600">
              F
            </div>
            <div className="flex-1 space-y-1">
              <input
                type="text"
                value={feature.name}
                onChange={(e) => handleUpdate(feature.id, 'name', e.target.value)}
                placeholder="Feature name"
                className="w-full border-0 bg-transparent text-sm font-semibold text-zinc-900 placeholder:text-zinc-300 focus:outline-none"
              />
              <textarea
                value={feature.description}
                onChange={(e) => handleUpdate(feature.id, 'description', e.target.value)}
                placeholder="Brief description of what this feature does..."
                rows={2}
                className="w-full resize-none border-0 bg-transparent text-sm text-zinc-500 placeholder:text-zinc-300 focus:outline-none"
              />
            </div>
            <button
              onClick={() => handleRemove(feature.id)}
              className="text-zinc-300 opacity-0 transition-opacity hover:text-error-500 group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
