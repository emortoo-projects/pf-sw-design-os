import { useState } from 'react'
import type { SetupInput } from '@/hooks/use-setup'

const INPUT_CLASS =
  'mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'

type ProviderType = NonNullable<SetupInput['provider']>['provider']

interface ProviderOption {
  id: ProviderType
  label: string
  modelPlaceholder: string
  showBaseUrl: boolean
}

const PROVIDER_OPTIONS: ProviderOption[] = [
  { id: 'anthropic', label: 'Anthropic (Claude)', modelPlaceholder: 'claude-sonnet-4-5-20250929', showBaseUrl: false },
  { id: 'openai', label: 'OpenAI', modelPlaceholder: 'gpt-4o', showBaseUrl: false },
  { id: 'openrouter', label: 'OpenRouter', modelPlaceholder: 'google/gemini-2.0-flash', showBaseUrl: false },
  { id: 'deepseek', label: 'DeepSeek', modelPlaceholder: 'deepseek-chat', showBaseUrl: false },
  { id: 'kimi', label: 'Kimi (Moonshot)', modelPlaceholder: 'moonshot-v1-128k', showBaseUrl: false },
  { id: 'custom', label: 'Custom (OpenAI-Compatible)', modelPlaceholder: 'your-model-name', showBaseUrl: true },
]

interface AIProviderStepProps {
  value: SetupInput['provider'] | undefined
  onChange: (v: SetupInput['provider'] | undefined) => void
}

export function AIProviderStep({ value, onChange }: AIProviderStepProps) {
  const [enabled, setEnabled] = useState(!!value)
  const [provider, setProvider] = useState<ProviderType>(value?.provider ?? 'anthropic')
  const [label, setLabel] = useState(value?.label ?? '')
  const [apiKey, setApiKey] = useState(value?.apiKey ?? '')
  const [model, setModel] = useState(value?.defaultModel ?? '')
  const [baseUrl, setBaseUrl] = useState(value?.baseUrl ?? '')

  const selectedOption = PROVIDER_OPTIONS.find((o) => o.id === provider) ?? PROVIDER_OPTIONS[0]

  const update = (partial: Partial<NonNullable<SetupInput['provider']>>) => {
    const next = {
      provider: partial.provider ?? provider,
      label: partial.label ?? label,
      apiKey: partial.apiKey ?? apiKey,
      defaultModel: partial.defaultModel ?? model,
      baseUrl: (partial.baseUrl ?? baseUrl) || undefined,
    }
    // Only emit when all required fields are filled
    if (next.label.trim() && next.apiKey.trim() && next.defaultModel.trim()) {
      onChange(next)
    } else {
      onChange(undefined)
    }
  }

  if (!enabled) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-600">
          Configure an AI provider to enable AI-powered generation. You can skip this and add one later in Settings.
        </p>
        <button
          type="button"
          onClick={() => setEnabled(true)}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Configure AI Provider
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-600">
        Configure your AI provider for stage generation.
      </p>

      <div>
        <label htmlFor="setup-prov-type" className="text-sm font-medium text-zinc-700">
          Provider
        </label>
        <select
          id="setup-prov-type"
          value={provider}
          onChange={(e) => {
            const p = e.target.value as ProviderType
            setProvider(p)
            setModel('')
            setBaseUrl('')
            update({ provider: p, defaultModel: '', baseUrl: undefined })
          }}
          className={INPUT_CLASS}
        >
          {PROVIDER_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="setup-prov-label" className="text-sm font-medium text-zinc-700">
          Label
        </label>
        <input
          id="setup-prov-label"
          type="text"
          value={label}
          onChange={(e) => { setLabel(e.target.value); update({ label: e.target.value }) }}
          placeholder="My Provider"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label htmlFor="setup-prov-key" className="text-sm font-medium text-zinc-700">
          API Key
        </label>
        <input
          id="setup-prov-key"
          type="password"
          autoComplete="off"
          value={apiKey}
          onChange={(e) => { setApiKey(e.target.value); update({ apiKey: e.target.value }) }}
          placeholder="sk-..."
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label htmlFor="setup-prov-model" className="text-sm font-medium text-zinc-700">
          Model
        </label>
        <input
          id="setup-prov-model"
          type="text"
          value={model}
          onChange={(e) => { setModel(e.target.value); update({ defaultModel: e.target.value }) }}
          placeholder={selectedOption.modelPlaceholder}
          className={INPUT_CLASS}
        />
      </div>

      {selectedOption.showBaseUrl && (
        <div>
          <label htmlFor="setup-prov-url" className="text-sm font-medium text-zinc-700">
            Base URL
          </label>
          <input
            id="setup-prov-url"
            type="url"
            value={baseUrl}
            onChange={(e) => { setBaseUrl(e.target.value); update({ baseUrl: e.target.value }) }}
            placeholder="https://your-provider.com/v1"
            className={INPUT_CLASS}
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => { setEnabled(false); onChange(undefined) }}
        className="text-sm text-zinc-500 hover:text-zinc-700"
      >
        Skip this step
      </button>
    </div>
  )
}
