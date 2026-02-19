import { Plus, Trash2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Persona } from './types'
import { generateId } from './types'

interface PersonaCardsProps {
  personas: Persona[]
  onChange: (personas: Persona[]) => void
}

export function PersonaCards({ personas, onChange }: PersonaCardsProps) {
  function handleAdd() {
    onChange([...personas, { id: generateId(), name: '', description: '' }])
  }

  function handleRemove(id: string) {
    onChange(personas.filter((p) => p.id !== id))
  }

  function handleUpdate(id: string, field: 'name' | 'description', value: string) {
    onChange(personas.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-700">Target Personas</h3>
        <Button variant="ghost" size="sm" onClick={handleAdd}>
          <Plus className="h-3.5 w-3.5" />
          Add Persona
        </Button>
      </div>

      {personas.length === 0 && (
        <p className="py-4 text-center text-sm text-zinc-400">
          No personas yet. Click Generate or add manually.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {personas.map((persona) => (
          <div key={persona.id} className="group relative rounded-lg border border-zinc-200 bg-white p-4">
            <button
              onClick={() => handleRemove(persona.id)}
              className="absolute right-2 top-2 text-zinc-300 opacity-0 transition-opacity hover:text-error-500 group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-secondary-600">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <input
                  type="text"
                  value={persona.name}
                  onChange={(e) => handleUpdate(persona.id, 'name', e.target.value)}
                  placeholder="Persona name"
                  className="w-full border-0 bg-transparent text-sm font-semibold text-zinc-900 placeholder:text-zinc-300 focus:outline-none"
                />
                <textarea
                  value={persona.description}
                  onChange={(e) => handleUpdate(persona.id, 'description', e.target.value)}
                  placeholder="Who is this person and what do they need?"
                  rows={3}
                  className="w-full resize-none border-0 bg-transparent text-xs text-zinc-500 placeholder:text-zinc-300 focus:outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
