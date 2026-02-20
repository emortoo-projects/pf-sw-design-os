import { useState } from 'react'
import {
  Bot,
  Plus,
  Trash2,
  Star,
  Pencil,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { AIProvider, ProviderType, UpdateAIProviderInput } from '@/lib/api-client'
import {
  useAIProviders,
  useCreateAIProvider,
  useDeleteAIProvider,
  useUpdateAIProvider,
  useTestAIProvider,
} from '@/hooks/use-ai-providers'

interface ProviderOption {
  id: ProviderType
  label: string
  modelPlaceholder: string
  defaultBaseUrl?: string
  showBaseUrl: boolean
}

const PROVIDER_OPTIONS: ProviderOption[] = [
  { id: 'anthropic', label: 'Anthropic (Claude)', modelPlaceholder: 'claude-sonnet-4-5-20250929', showBaseUrl: false },
  { id: 'openai', label: 'OpenAI', modelPlaceholder: 'gpt-4o', showBaseUrl: false },
  { id: 'openrouter', label: 'OpenRouter', modelPlaceholder: 'google/gemini-2.0-flash', defaultBaseUrl: 'https://openrouter.ai/api/v1', showBaseUrl: false },
  { id: 'deepseek', label: 'DeepSeek', modelPlaceholder: 'deepseek-chat', defaultBaseUrl: 'https://api.deepseek.com/v1', showBaseUrl: false },
  { id: 'kimi', label: 'Kimi (Moonshot)', modelPlaceholder: 'moonshot-v1-128k', defaultBaseUrl: 'https://api.moonshot.cn/v1', showBaseUrl: false },
  { id: 'custom', label: 'Custom (OpenAI-Compatible)', modelPlaceholder: 'your-model-name', showBaseUrl: true },
]

const INPUT_CLASS =
  'mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'

type ConnectionStatus = 'connected' | 'error' | 'untested'

const STATUS_DISPLAY: Record<ConnectionStatus, { icon: typeof CheckCircle2; color: string; label: string }> = {
  connected: { icon: CheckCircle2, color: 'text-emerald-500', label: 'Connected' },
  error: { icon: XCircle, color: 'text-red-500', label: 'Error' },
  untested: { icon: HelpCircle, color: 'text-zinc-400', label: 'Untested' },
}

function ProviderCard({
  provider,
  status,
  onTest,
  onEdit,
  onDelete,
  onSetDefault,
  testing,
}: {
  provider: AIProvider
  status: ConnectionStatus
  onTest: () => void
  onEdit: () => void
  onDelete: () => void
  onSetDefault: () => void
  testing: boolean
}) {
  const statusConfig = STATUS_DISPLAY[status]
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
              {PROVIDER_OPTIONS.find((t) => t.id === provider.provider)?.label ?? provider.provider} &middot; {provider.defaultModel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <StatusIcon className={cn('h-4 w-4', statusConfig.color)} />
          <span className={cn('text-xs', statusConfig.color)}>{statusConfig.label}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onTest} disabled={testing || !provider.apiKeySet}>
          {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {testing ? 'Testing...' : 'Test Connection'}
        </Button>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
        {!provider.isDefault && (
          <Button variant="ghost" size="sm" onClick={onSetDefault}>
            <Star className="h-3.5 w-3.5" />
            Set Default
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-red-500 hover:text-red-700"
          aria-label={`Delete ${provider.label}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

export function AIProviderManager() {
  const { data: providers = [], isLoading } = useAIProviders()
  const createProvider = useCreateAIProvider()
  const deleteProvider = useDeleteAIProvider()
  const editProvider = useUpdateAIProvider()
  const setDefaultProvider = useUpdateAIProvider()
  const testProvider = useTestAIProvider()

  const [addOpen, setAddOpen] = useState(false)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [statusMap, setStatusMap] = useState<Record<string, ConnectionStatus>>({})
  const [newLabel, setNewLabel] = useState('')
  const [newType, setNewType] = useState<ProviderType>('anthropic')
  const [newModel, setNewModel] = useState('')
  const [newApiKey, setNewApiKey] = useState('')
  const [newBaseUrl, setNewBaseUrl] = useState('')

  // Edit dialog state
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editModel, setEditModel] = useState('')
  const [editApiKey, setEditApiKey] = useState('')
  const [editBaseUrl, setEditBaseUrl] = useState('')

  // Delete confirmation state
  const [deletingProvider, setDeletingProvider] = useState<AIProvider | null>(null)

  const selectedOption = PROVIDER_OPTIONS.find((o) => o.id === newType) ?? PROVIDER_OPTIONS[0]
  const editProviderOption = editingProvider
    ? PROVIDER_OPTIONS.find((o) => o.id === editingProvider.provider)
    : null

  function resetAddForm() {
    setNewLabel('')
    setNewType('anthropic')
    setNewModel('')
    setNewApiKey('')
    setNewBaseUrl('')
  }

  function closeEditDialog() {
    setEditingProvider(null)
    setEditApiKey('')
  }

  function handleTypeChange(type: ProviderType) {
    setNewType(type)
    setNewModel('')
    setNewBaseUrl('')
  }

  function handleTest(id: string) {
    setTestingId(id)
    testProvider.mutate(id, {
      onSuccess: (result) => {
        setStatusMap((prev) => ({ ...prev, [id]: result.success ? 'connected' : 'error' }))
        setTestingId(null)
      },
      onError: () => {
        setStatusMap((prev) => ({ ...prev, [id]: 'error' }))
        setTestingId(null)
      },
    })
  }

  function handleEditOpen(provider: AIProvider) {
    setEditingProvider(provider)
    setEditLabel(provider.label)
    setEditModel(provider.defaultModel)
    setEditApiKey('')
    setEditBaseUrl(provider.baseUrl ?? '')
  }

  function handleEditSave() {
    if (!editingProvider || !editLabel.trim() || !editModel.trim()) return
    const updates: UpdateAIProviderInput = {
      label: editLabel.trim(),
      defaultModel: editModel.trim(),
    }
    if (editApiKey.trim()) updates.apiKey = editApiKey.trim()
    if (editBaseUrl.trim()) {
      updates.baseUrl = editBaseUrl.trim()
    } else if (editingProvider.baseUrl) {
      updates.baseUrl = null
    }
    editProvider.mutate({ id: editingProvider.id, ...updates }, {
      onSuccess: () => closeEditDialog(),
    })
  }

  function handleDeleteConfirm() {
    if (!deletingProvider) return
    const deletedId = deletingProvider.id
    deleteProvider.mutate(deletedId, {
      onSuccess: () => {
        setDeletingProvider(null)
        setStatusMap((prev) => {
          const { [deletedId]: _, ...rest } = prev
          return rest
        })
      },
    })
  }

  function handleSetDefault(id: string) {
    setDefaultProvider.mutate({ id, isDefault: true })
  }

  function handleAdd() {
    if (!newLabel.trim() || !newModel.trim() || !newApiKey.trim()) return
    createProvider.mutate(
      {
        provider: newType,
        label: newLabel.trim(),
        apiKey: newApiKey.trim(),
        defaultModel: newModel.trim(),
        baseUrl: newBaseUrl.trim() || undefined,
        isDefault: providers.length === 0,
      },
      {
        onSuccess: () => {
          resetAddForm()
          setAddOpen(false)
        },
      },
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    )
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
            status={statusMap[provider.id] ?? 'untested'}
            onTest={() => handleTest(provider.id)}
            onEdit={() => handleEditOpen(provider)}
            onDelete={() => setDeletingProvider(provider)}
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

      {/* Add dialog */}
      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          if (!open) resetAddForm()
          setAddOpen(open)
        }}
      >
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
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label htmlFor="prov-type" className="text-sm font-medium text-zinc-700">Provider Type</label>
            <select
              id="prov-type"
              value={newType}
              onChange={(e) => handleTypeChange(e.target.value as ProviderType)}
              className={INPUT_CLASS}
            >
              {PROVIDER_OPTIONS.map((t) => (
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
              placeholder={selectedOption.modelPlaceholder}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label htmlFor="prov-key" className="text-sm font-medium text-zinc-700">API Key</label>
            <input
              id="prov-key"
              type="password"
              autoComplete="off"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              placeholder="sk-..."
              className={INPUT_CLASS}
            />
          </div>
          {selectedOption.showBaseUrl && (
            <div>
              <label htmlFor="prov-url" className="text-sm font-medium text-zinc-700">Base URL</label>
              <input
                id="prov-url"
                type="url"
                value={newBaseUrl}
                onChange={(e) => setNewBaseUrl(e.target.value)}
                placeholder="https://your-provider.com/v1"
                className={INPUT_CLASS}
              />
            </div>
          )}
          {createProvider.isError && (
            <p className="text-xs text-red-600">
              {createProvider.error instanceof Error ? createProvider.error.message : 'Failed to add provider'}
            </p>
          )}
        </div>
        <DialogFooter className="mt-6">
          <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAdd}
            disabled={!newLabel.trim() || !newModel.trim() || !newApiKey.trim() || createProvider.isPending}
          >
            {createProvider.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Add Provider
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editingProvider} onOpenChange={(open) => { if (!open) closeEditDialog() }}>
        <DialogHeader>
          <DialogTitle>Edit Provider</DialogTitle>
          <DialogDescription>
            {editProviderOption?.label ?? editingProvider?.provider}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="edit-label" className="text-sm font-medium text-zinc-700">Label</label>
            <input
              id="edit-label"
              type="text"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              autoFocus
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label htmlFor="edit-model" className="text-sm font-medium text-zinc-700">Model</label>
            <input
              id="edit-model"
              type="text"
              value={editModel}
              onChange={(e) => setEditModel(e.target.value)}
              placeholder={editProviderOption?.modelPlaceholder}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label htmlFor="edit-key" className="text-sm font-medium text-zinc-700">API Key</label>
            <input
              id="edit-key"
              type="password"
              autoComplete="off"
              value={editApiKey}
              onChange={(e) => setEditApiKey(e.target.value)}
              placeholder="Leave blank to keep current key"
              className={INPUT_CLASS}
            />
          </div>
          {(editProviderOption?.showBaseUrl || editingProvider?.baseUrl) && (
            <div>
              <label htmlFor="edit-url" className="text-sm font-medium text-zinc-700">Base URL</label>
              <input
                id="edit-url"
                type="url"
                value={editBaseUrl}
                onChange={(e) => setEditBaseUrl(e.target.value)}
                placeholder="https://your-provider.com/v1"
                className={INPUT_CLASS}
              />
            </div>
          )}
          {editProvider.isError && (
            <p className="text-xs text-red-600">
              {editProvider.error instanceof Error ? editProvider.error.message : 'Failed to save changes'}
            </p>
          )}
        </div>
        <DialogFooter className="mt-6">
          <Button variant="ghost" onClick={closeEditDialog}>Cancel</Button>
          <Button
            onClick={handleEditSave}
            disabled={!editLabel.trim() || !editModel.trim() || editProvider.isPending}
          >
            {editProvider.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deletingProvider} onOpenChange={(open) => { if (!open) setDeletingProvider(null) }}>
        <DialogHeader>
          <DialogTitle>Delete Provider</DialogTitle>
          <DialogDescription>Permanently remove this provider configuration.</DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-3">
          <p className="text-sm text-zinc-600">
            Are you sure you want to delete <strong>{deletingProvider?.label}</strong>?
          </p>
          {deletingProvider?.isDefault && providers.length > 1 && (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-xs text-amber-700">
                This is your default provider. After deleting, set another provider as default so AI generation works.
              </p>
            </div>
          )}
          {deletingProvider?.isDefault && providers.length === 1 && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="text-xs text-red-700">
                This is your only provider. Deleting it will disable AI generation until you add a new one.
              </p>
            </div>
          )}
          {deleteProvider.isError && (
            <p className="text-xs text-red-600">
              {deleteProvider.error instanceof Error ? deleteProvider.error.message : 'Failed to delete provider'}
            </p>
          )}
        </div>
        <DialogFooter className="mt-6">
          <Button variant="ghost" onClick={() => setDeletingProvider(null)}>Cancel</Button>
          <Button
            variant="destructive"
            onClick={handleDeleteConfirm}
            disabled={deleteProvider.isPending}
          >
            {deleteProvider.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
