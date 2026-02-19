import { ArrowRight, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Interaction } from './types'
import { createEmptyInteraction } from './types'

interface InteractionEditorProps {
  interactions: Interaction[]
  onChange: (interactions: Interaction[]) => void
}

export function InteractionEditor({ interactions, onChange }: InteractionEditorProps) {
  function handleAdd() {
    onChange([...interactions, createEmptyInteraction()])
  }

  function handleRemove(id: string) {
    onChange(interactions.filter((i) => i.id !== id))
  }

  function handleUpdate(id: string, field: 'trigger' | 'behavior', value: string) {
    onChange(interactions.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-zinc-700">Interactions</label>
        <Button variant="ghost" size="sm" onClick={handleAdd} className="h-6 gap-1 text-xs">
          <Plus className="h-3 w-3" />
          Add Interaction
        </Button>
      </div>
      <div className="space-y-1.5">
        {interactions.map((interaction) => (
          <div key={interaction.id} className="flex items-center gap-2">
            <input
              type="text"
              value={interaction.trigger}
              onChange={(e) => handleUpdate(interaction.id, 'trigger', e.target.value)}
              placeholder="Trigger"
              className="flex-1 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-900 outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-300"
            />
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            <input
              type="text"
              value={interaction.behavior}
              onChange={(e) => handleUpdate(interaction.id, 'behavior', e.target.value)}
              placeholder="Behavior"
              className="flex-1 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-900 outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-300"
            />
            <button
              type="button"
              onClick={() => handleRemove(interaction.id)}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-red-500"
              aria-label="Remove interaction"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {interactions.length === 0 && (
          <p className="text-xs text-zinc-400">No interactions defined yet.</p>
        )}
      </div>
    </div>
  )
}
