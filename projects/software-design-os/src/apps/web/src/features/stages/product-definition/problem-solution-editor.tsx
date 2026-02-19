import { Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ProblemSolution } from './types'
import { generateId } from './types'

interface ProblemSolutionEditorProps {
  problems: ProblemSolution[]
  onChange: (problems: ProblemSolution[]) => void
}

export function ProblemSolutionEditor({ problems, onChange }: ProblemSolutionEditorProps) {
  function handleAdd() {
    onChange([...problems, { id: generateId(), problem: '', solution: '' }])
  }

  function handleRemove(id: string) {
    onChange(problems.filter((p) => p.id !== id))
  }

  function handleUpdate(id: string, field: 'problem' | 'solution', value: string) {
    onChange(problems.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  function handleMoveUp(index: number) {
    if (index === 0) return
    const updated = [...problems]
    ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
    onChange(updated)
  }

  function handleMoveDown(index: number) {
    if (index === problems.length - 1) return
    const updated = [...problems]
    ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-700">Problems & Solutions</h3>
        <Button variant="ghost" size="sm" onClick={handleAdd}>
          <Plus className="h-3.5 w-3.5" />
          Add Pair
        </Button>
      </div>

      {problems.length === 0 && (
        <p className="py-4 text-center text-sm text-zinc-400">
          No problem/solution pairs yet. Click Generate or add manually.
        </p>
      )}

      <div className="space-y-2">
        {problems.map((pair, index) => (
          <div key={pair.id} className="group flex gap-2 rounded-lg border border-zinc-200 bg-white p-3">
            <div className="flex flex-col items-center gap-1 pt-1">
              <button
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                className="text-zinc-300 hover:text-zinc-500 disabled:opacity-30"
              >
                <GripVertical className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleMoveDown(index)}
                disabled={index === problems.length - 1}
                className="text-zinc-300 hover:text-zinc-500 disabled:opacity-30"
              >
                <GripVertical className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex flex-1 gap-3">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-error-500">Problem</label>
                <textarea
                  value={pair.problem}
                  onChange={(e) => handleUpdate(pair.id, 'problem', e.target.value)}
                  placeholder="What problem does this solve?"
                  rows={2}
                  className="w-full resize-none rounded border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-primary-300 focus:outline-none"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-success-500">Solution</label>
                <textarea
                  value={pair.solution}
                  onChange={(e) => handleUpdate(pair.id, 'solution', e.target.value)}
                  placeholder="How does your product solve it?"
                  rows={2}
                  className="w-full resize-none rounded border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-primary-300 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => handleRemove(pair.id)}
              className="mt-1 text-zinc-300 opacity-0 transition-opacity hover:text-error-500 group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
