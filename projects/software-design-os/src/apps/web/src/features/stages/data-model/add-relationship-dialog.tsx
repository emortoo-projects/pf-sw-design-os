import { useState } from 'react'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Entity, Relationship, RelationshipType } from './types'
import { generateId } from './types'

interface AddRelationshipDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entities: Entity[]
  sourceEntityId?: string
  targetEntityId?: string
  onAdd: (relationship: Relationship) => void
}

export function AddRelationshipDialog({
  open,
  onOpenChange,
  entities,
  sourceEntityId,
  targetEntityId,
  onAdd,
}: AddRelationshipDialogProps) {
  const [fromId, setFromId] = useState(sourceEntityId ?? '')
  const [toId, setToId] = useState(targetEntityId ?? '')
  const [type, setType] = useState<RelationshipType>('one-to-many')
  const [foreignKey, setForeignKey] = useState('')
  const [description, setDescription] = useState('')

  // Update from/to when props change (from drawing mode)
  useState(() => {
    if (sourceEntityId) setFromId(sourceEntityId)
    if (targetEntityId) setToId(targetEntityId)
  })

  function handleSubmit() {
    if (!fromId || !toId) return
    const fromEntity = entities.find((e) => e.id === fromId)
    const fk = foreignKey || `${(fromEntity?.name ?? 'entity').charAt(0).toLowerCase() + (fromEntity?.name ?? 'entity').slice(1)}Id`
    onAdd({
      id: generateId('rel'),
      fromEntityId: fromId,
      toEntityId: toId,
      type,
      foreignKey: fk,
      description: description || `${fromEntity?.name ?? ''} has ${type === 'one-to-many' ? 'many' : type === 'one-to-one' ? 'one' : 'many'} ${entities.find((e) => e.id === toId)?.name ?? ''}`,
    })
    onOpenChange(false)
    setFromId('')
    setToId('')
    setType('one-to-many')
    setForeignKey('')
    setDescription('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Add Relationship</DialogTitle>
        <DialogDescription>Connect two entities with a relationship.</DialogDescription>
      </DialogHeader>

      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700">From Entity</label>
            <select
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              className="w-full rounded border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-primary-300 focus:outline-none"
            >
              <option value="">Select...</option>
              {entities.map((e) => (
                <option key={e.id} value={e.id}>{e.name || 'Unnamed'}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700">To Entity</label>
            <select
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className="w-full rounded border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-primary-300 focus:outline-none"
            >
              <option value="">Select...</option>
              {entities.map((e) => (
                <option key={e.id} value={e.id}>{e.name || 'Unnamed'}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as RelationshipType)}
              className="w-full rounded border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-primary-300 focus:outline-none"
            >
              <option value="one-to-one">One-to-One (1:1)</option>
              <option value="one-to-many">One-to-Many (1:N)</option>
              <option value="many-to-many">Many-to-Many (M:N)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700">Foreign Key</label>
            <input
              type="text"
              value={foreignKey}
              onChange={(e) => setForeignKey(e.target.value)}
              placeholder="Auto-generated"
              className="w-full rounded border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-300 focus:border-primary-300 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-700">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this relationship..."
            className="w-full rounded border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-300 focus:border-primary-300 focus:outline-none"
          />
        </div>
      </div>

      <DialogFooter className="mt-4">
        <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={!fromId || !toId}>
          Add Relationship
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
