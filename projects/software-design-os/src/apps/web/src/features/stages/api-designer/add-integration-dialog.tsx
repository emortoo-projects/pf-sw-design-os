import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Integration } from './types'
import { generateId } from './types'

interface AddIntegrationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (integration: Integration) => void
}

export function AddIntegrationDialog({ open, onOpenChange, onAdd }: AddIntegrationDialogProps) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [events, setEvents] = useState('')
  const [payloadFormat, setPayloadFormat] = useState<'json' | 'form'>('json')
  const [description, setDescription] = useState('')

  const isValidUrl = (() => {
    try {
      const u = new URL(url.trim())
      return u.protocol === 'https:' || u.protocol === 'http:'
    } catch {
      return false
    }
  })()
  const isValid = name.trim().length > 0 && isValidUrl

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    onAdd({
      id: generateId('int'),
      name: name.trim(),
      url: url.trim(),
      events: events.split(',').map((s) => s.trim()).filter(Boolean),
      payloadFormat,
      description: description.trim() || undefined,
    })
    setName('')
    setUrl('')
    setEvents('')
    setPayloadFormat('json')
    setDescription('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Add Integration</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., OpenAI API"
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/webhook"
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-mono placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">Events</label>
          <input
            type="text"
            value={events}
            onChange={(e) => setEvents(e.target.value)}
            placeholder="generate, complete, export"
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
          <p className="text-xs text-zinc-400">Comma-separated list of event names</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">Payload Format</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="payloadFormat"
                value="json"
                checked={payloadFormat === 'json'}
                onChange={() => setPayloadFormat('json')}
                className="text-primary-600"
              />
              JSON
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="payloadFormat"
                value="form"
                checked={payloadFormat === 'form'}
                onChange={() => setPayloadFormat('form')}
                className="text-primary-600"
              />
              Form Data
            </label>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">Description (optional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this integration"
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={!isValid}>
            Add Integration
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
