import { useState } from 'react'
import {
  Bot,
  Plus,
  Trash2,
  Star,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { AIProviderConfig, AIProviderType } from './types'
import { generateSettingsId } from './types'

interface AIProviderManagerProps {
  providers: AIProviderConfig[]
  onChange: (providers: AIProviderConfig[]) => void
}

const PROVIDER_TYPES: Array<{ id: AIProviderType; label: string }> = [
  { id: 'anthropic', label: 'Anthropic (Claude)' },
  { id: 'openai', label: 'OpenAI' },
  { id: 'openai-compatible', label: 'OpenAI-Compatible' },
]

const STATUS_DISPLAY: Record<AIProviderConfig['status'], { icon: typeof CheckCircle2; color: string; label: string }> = {
  connected: { icon: CheckCircle2, color: 'text-emerald-500', label: 'Connected' },
  error: { icon: XCircle, color: 'text-red-500', label: 'Error' },
  untested: { icon: HelpCircle, color: 'text-zinc-400', label: 'Untested' },
}

function ProviderCard({
  provider,
  onTest,
  onDelete,
  onSetDefault,
  testing,
}: {
  provider: AIProviderConfig
  onTest: () => void
  onDelete: () => void
  onSetDefault: () => void
  testing: boolean
}) {
  const statusConfig = STATUS_DISPLAY[provider.status]
  const StatusIcon = statusConfig.icon

  return (
    <div
      className={cn(
        'rounded-lg border bg-white p-4',
        provider.isDefault ? 'border-primary-300 ring-1 ring-primary-100' : 'border-zinc-200',
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-100">
            <Bot className="h-4 w-4 text-zinc-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-900">{provider.label}</span>
              {provider.isDefault && (
                <Badge variant="default" className="text-[10px] px-1.5 py-0">Default</Badge>
              )}
            </div>
            <p className="text-xs text-zinc-500">
              {PROVIDER_TYPES.find((t) => t.id === provider.providerType)?.label} &middot; {provider.model}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <StatusIcon className={cn('h-4 w-4', statusConfig.color)} />
          <span className={cn('text-xs', statusConfig.color)}>{statusConfig.label}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onTest} disabled={testing}>
          {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {testing ? 'Testing...' : 'Test Connection'}
        </Button>
        {!provider.isDefault && (
          <Button variant="ghost" size="sm" onClick={onSetDefault}>
            <Star className="h-3.5 w-3.5" />
            Set Default
          </Button>
        )}
        {!provider.isDefault && (
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-500 hover:text-red-700">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}

export function AIProviderManager({ providers, onChange }: AIProviderManagerProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [newLabel, setNewLabel] = useState('')
  const [newType, setNewType] = useState<AIProviderType>('anthropic')
  const [newModel, setNewModel] = useState('')

  function handleTest(id: string) {
    setTestingId(id)
    // Simulate API test
    setTimeout(() => {
      onChange(
        providers.map((p) =>
          p.id === id
            ? { ...p, status: 'connected' as const, lastTestedAt: new Date().toISOString() }
            : p,
        ),
      )
      setTestingId(null)
    }, 1500)
  }

  function handleDelete(id: string) {
    onChange(providers.filter((p) => p.id !== id))
  }

  function handleSetDefault(id: string) {
    onChange(
      providers.map((p) => ({
        ...p,
        isDefault: p.id === id,
      })),
    )
  }

  function handleAdd() {
    if (!newLabel.trim() || !newModel.trim()) return
    if (newLabel.length > 100 || newModel.length > 100) return
    const newProvider: AIProviderConfig = {
      id: generateSettingsId('prov'),
      label: newLabel.trim(),
      providerType: newType,
      model: newModel.trim(),
      apiKeySet: false,
      isDefault: providers.length === 0,
      status: 'untested',
    }
    onChange([...providers, newProvider])
    setNewLabel('')
    setNewModel('')
    setAddOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">AI Providers</h3>
          <p className="text-xs text-zinc-500">Manage your AI provider configurations</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add Provider
        </Button>
      </div>

      <div className="space-y-3">
        {providers.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            onTest={() => handleTest(provider.id)}
            onDelete={() => handleDelete(provider.id)}
            onSetDefault={() => handleSetDefault(provider.id)}
            testing={testingId === provider.id}
          />
        ))}
        {providers.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-zinc-200 py-8 text-center">
            <Bot className="mx-auto h-8 w-8 text-zinc-300" />
            <p className="mt-2 text-sm text-zinc-500">No AI providers configured</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setAddOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Add Provider
            </Button>
          </div>
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogHeader>
          <DialogTitle>Add AI Provider</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="prov-label" className="text-sm font-medium text-zinc-700">Label</label>
            <input
              id="prov-label"
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="My Provider"
              autoFocus
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label htmlFor="prov-type" className="text-sm font-medium text-zinc-700">Provider Type</label>
            <select
              id="prov-type"
              value={newType}
              onChange={(e) => setNewType(e.target.value as AIProviderType)}
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {PROVIDER_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="prov-model" className="text-sm font-medium text-zinc-700">Model</label>
            <input
              id="prov-model"
              type="text"
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
              placeholder="claude-sonnet-4-5-20250929"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd} disabled={!newLabel.trim() || !newModel.trim()}>Add Provider</Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
