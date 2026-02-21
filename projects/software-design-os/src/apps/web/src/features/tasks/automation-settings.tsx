import { useState, useEffect } from 'react'
import { Shield, ShieldCheck, ShieldAlert, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAutomationConfig, useAutomationMutations } from '@/hooks/use-automation'
import type { AutomationConfig, TrustLevel } from '@sdos/shared'

interface AutomationSettingsProps {
  projectId: string
}

const DEFAULT_CONFIG: AutomationConfig = {
  trustLevel: 'manual',
  qualityGates: {
    typescriptCompiles: true,
    testsPass: true,
    lintClean: false,
    noNewWarnings: false,
  },
  boundaries: {
    protectEnvFiles: true,
    protectConfigFiles: true,
    protectedPaths: [],
  },
  batchLimits: {
    maxTasks: 10,
    maxConsecutiveFailures: 3,
  },
}

const TRUST_LEVELS: { level: TrustLevel; title: string; description: string; icon: typeof Shield }[] = [
  { level: 'manual', title: 'Manual', description: 'You review and approve every contract before execution', icon: Shield },
  { level: 'semi_auto', title: 'Semi-Auto', description: 'Claude executes contracts but you review results before merging', icon: ShieldCheck },
  { level: 'full_auto', title: 'Full Auto', description: 'Claude executes and auto-approves when quality gates pass', icon: ShieldAlert },
]

export function AutomationSettings({ projectId }: AutomationSettingsProps) {
  const { data: savedConfig, isLoading } = useAutomationConfig(projectId)
  const { saveConfig } = useAutomationMutations(projectId)
  const [config, setConfig] = useState<AutomationConfig>(DEFAULT_CONFIG)
  const [protectedPathInput, setProtectedPathInput] = useState('')

  useEffect(() => {
    setConfig(savedConfig ?? DEFAULT_CONFIG)
  }, [savedConfig])

  const handleSave = () => {
    saveConfig.mutate(config)
  }

  const toggleGate = (key: keyof AutomationConfig['qualityGates']) => {
    setConfig((prev) => ({
      ...prev,
      qualityGates: { ...prev.qualityGates, [key]: !prev.qualityGates[key] },
    }))
  }

  const toggleBoundary = (key: 'protectEnvFiles' | 'protectConfigFiles') => {
    setConfig((prev) => ({
      ...prev,
      boundaries: { ...prev.boundaries, [key]: !prev.boundaries[key] },
    }))
  }

  const addProtectedPath = () => {
    const path = protectedPathInput.trim()
    if (path && !config.boundaries.protectedPaths.includes(path)) {
      setConfig((prev) => ({
        ...prev,
        boundaries: {
          ...prev.boundaries,
          protectedPaths: [...prev.boundaries.protectedPaths, path],
        },
      }))
      setProtectedPathInput('')
    }
  }

  const removeProtectedPath = (path: string) => {
    setConfig((prev) => ({
      ...prev,
      boundaries: {
        ...prev.boundaries,
        protectedPaths: prev.boundaries.protectedPaths.filter((p) => p !== path),
      },
    }))
  }

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center text-sm text-zinc-400">Loading settings...</div>
  }

  return (
    <div className="space-y-6">
      {/* Trust Level */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-zinc-700">Trust Level</h3>
        <div className="grid grid-cols-3 gap-3">
          {TRUST_LEVELS.map(({ level, title, description, icon: Icon }) => (
            <button
              key={level}
              onClick={() => setConfig((prev) => ({ ...prev, trustLevel: level }))}
              className={`rounded-lg border-2 p-4 text-left transition-colors ${
                config.trustLevel === level
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-zinc-200 bg-white hover:border-zinc-300'
              }`}
            >
              <Icon className={`mb-2 h-5 w-5 ${config.trustLevel === level ? 'text-blue-600' : 'text-zinc-400'}`} />
              <div className="text-sm font-medium text-zinc-900">{title}</div>
              <div className="mt-1 text-xs text-zinc-500">{description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quality Gates */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Quality Gates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {([
            ['typescriptCompiles', 'TypeScript Compiles'],
            ['testsPass', 'Tests Pass'],
            ['lintClean', 'Lint Clean'],
            ['noNewWarnings', 'No New Warnings'],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center justify-between">
              <span className="text-sm text-zinc-700">{label}</span>
              <button
                onClick={() => toggleGate(key)}
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  config.qualityGates[key] ? 'bg-blue-500' : 'bg-zinc-300'
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                    config.qualityGates[key] ? 'translate-x-4' : ''
                  }`}
                />
              </button>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Boundaries */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Boundaries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {([
            ['protectEnvFiles', 'Protect .env files'],
            ['protectConfigFiles', 'Protect config files (tsconfig, eslint, etc.)'],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center justify-between">
              <span className="text-sm text-zinc-700">{label}</span>
              <button
                onClick={() => toggleBoundary(key)}
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  config.boundaries[key] ? 'bg-blue-500' : 'bg-zinc-300'
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                    config.boundaries[key] ? 'translate-x-4' : ''
                  }`}
                />
              </button>
            </label>
          ))}
          <div>
            <label className="mb-1 block text-sm text-zinc-700">Protected Paths</label>
            <div className="flex gap-2">
              <input
                value={protectedPathInput}
                onChange={(e) => setProtectedPathInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addProtectedPath()}
                placeholder="e.g. src/config/"
                className="flex-1 rounded-md border border-zinc-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              />
              <Button variant="outline" size="sm" onClick={addProtectedPath}>Add</Button>
            </div>
            {config.boundaries.protectedPaths.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {config.boundaries.protectedPaths.map((path) => (
                  <span
                    key={path}
                    className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700"
                  >
                    {path}
                    <button onClick={() => removeProtectedPath(path)} className="text-zinc-400 hover:text-zinc-600">&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Batch Limits */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Batch Limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="block">
            <span className="text-sm text-zinc-700">Max tasks per run</span>
            <input
              type="number"
              min={1}
              max={100}
              value={config.batchLimits.maxTasks}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  batchLimits: { ...prev.batchLimits, maxTasks: parseInt(e.target.value) || 1 },
                }))
              }
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-sm text-zinc-700">Max consecutive failures before stopping</span>
            <input
              type="number"
              min={1}
              max={20}
              value={config.batchLimits.maxConsecutiveFailures}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  batchLimits: { ...prev.batchLimits, maxConsecutiveFailures: parseInt(e.target.value) || 1 },
                }))
              }
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </label>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saveConfig.isPending}>
          <Save className="mr-2 h-4 w-4" />
          {saveConfig.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}
