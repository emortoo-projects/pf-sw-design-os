import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Dependency } from './types'
import { generateId } from './types'

interface AddDependencyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (dependency: Dependency) => void
}

export function AddDependencyDialog({ open, onOpenChange, onAdd }: AddDependencyDialogProps) {
  const [name, setName] = useState('')
  const [version, setVersion] = useState('^1.0.0')
  const [description, setDescription] = useState('')
  const [dev, setDev] = useState(false)

  useEffect(() => {
    if (!open) {
      setName('')
      setVersion('^1.0.0')
      setDescription('')
      setDev(false)
    }
  }, [open])

  const isValid = name.trim().length > 0 && version.trim().length > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    onAdd({
      id: generateId('dep'),
      name: name.trim(),
      version: version.trim(),
      description: description.trim() || undefined,
      dev,
    })
    setName('')
    setVersion('^1.0.0')
    setDescription('')
    setDev(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Add Dependency</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">Package Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., @tanstack/react-query"
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-mono placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">Version</label>
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="e.g., ^1.0.0"
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-mono placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">Description (optional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this package"
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="dev-dependency"
            checked={dev}
            onChange={(e) => setDev(e.target.checked)}
            className="rounded border-zinc-300 text-primary-600 focus:ring-primary-300"
          />
          <label htmlFor="dev-dependency" className="text-sm text-zinc-700">
            Dev dependency
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={!isValid}>
            Add Dependency
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
