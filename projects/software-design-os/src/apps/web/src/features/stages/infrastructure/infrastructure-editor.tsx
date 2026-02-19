import { useState, useEffect, useCallback } from 'react'
import type { Stage } from '@sdos/shared'
import { usePipelineStore } from '@/stores/pipeline-store'
import { SchemaPreview } from '@/features/stages/database-designer/schema-preview'
import { InfraViewToggle, type InfraViewMode } from './infra-view-toggle'
import { HostingSelector } from './hosting-selector'
import { DockerPreview } from './docker-preview'
import { CIPipelineEditor } from './ci-pipeline-editor'
import { EnvVarManager } from './env-var-manager'
import type {
  InfrastructureData,
  DockerConfig,
  CIStep,
  CIStage,
  CIPipeline,
  EnvVar,
  HostingProvider,
} from './types'
import { createEmptyInfrastructureData, HOSTING_OPTIONS } from './types'

interface InfrastructureEditorProps {
  stage: Stage
}

// --- Runtime type guards ---

function isDockerConfig(v: unknown): v is DockerConfig {
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as DockerConfig).dockerfile === 'string' &&
    typeof (v as DockerConfig).compose === 'string'
  )
}

function isCIStep(v: unknown): v is CIStep {
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as CIStep).id === 'string' &&
    typeof (v as CIStep).name === 'string' &&
    typeof (v as CIStep).command === 'string' &&
    typeof (v as CIStep).enabled === 'boolean'
  )
}

function isCIStage(v: unknown): v is CIStage {
  if (typeof v !== 'object' || v === null) return false
  const s = v as CIStage
  return (
    typeof s.id === 'string' &&
    typeof s.name === 'string' &&
    Array.isArray(s.steps) &&
    s.steps.every(isCIStep)
  )
}

function isCIPipeline(v: unknown): v is CIPipeline {
  if (typeof v !== 'object' || v === null) return false
  const p = v as CIPipeline
  return (
    typeof p.name === 'string' &&
    typeof p.trigger === 'string' &&
    Array.isArray(p.stages) &&
    p.stages.every(isCIStage)
  )
}

function isEnvVar(v: unknown): v is EnvVar {
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as EnvVar).id === 'string' &&
    typeof (v as EnvVar).name === 'string' &&
    typeof (v as EnvVar).required === 'boolean' &&
    typeof (v as EnvVar).defaultValue === 'string' &&
    typeof (v as EnvVar).description === 'string'
  )
}

function isHostingProvider(v: unknown): v is HostingProvider {
  return typeof v === 'string' && HOSTING_OPTIONS.some((o) => o.id === v)
}

function isInfrastructureData(data: unknown): data is InfrastructureData {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return (
    isHostingProvider(d.hosting) &&
    isDockerConfig(d.docker) &&
    isCIPipeline(d.ciPipeline) &&
    Array.isArray(d.envVars) &&
    d.envVars.every(isEnvVar)
  )
}

function parseInfrastructureData(data: Record<string, unknown> | undefined): InfrastructureData {
  if (!data || !isInfrastructureData(data)) return createEmptyInfrastructureData()
  return {
    hosting: data.hosting,
    docker: data.docker,
    ciPipeline: data.ciPipeline,
    envVars: data.envVars,
  }
}

export function InfrastructureEditor({ stage }: InfrastructureEditorProps) {
  const { setEditorDirty, setEditorData } = usePipelineStore()
  const [viewMode, setViewMode] = useState<InfraViewMode>('visual')
  const [infraData, setInfraData] = useState<InfrastructureData>(() =>
    parseInfrastructureData(stage.data),
  )

  const hasContent =
    infraData.hosting !== 'docker-local' ||
    infraData.docker.dockerfile !== '' ||
    infraData.docker.compose !== '' ||
    infraData.ciPipeline.name !== '' ||
    infraData.ciPipeline.stages.some((s) => s.steps.length > 0) ||
    infraData.envVars.length > 0

  useEffect(() => {
    if (stage.data && Object.keys(stage.data).length > 0) {
      setInfraData(parseInfrastructureData(stage.data))
    }
  }, [stage.data])

  const updateInfraData = useCallback(
    (updater: Partial<InfrastructureData> | ((prev: InfrastructureData) => InfrastructureData)) => {
      setInfraData((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
        setEditorData(next as unknown as Record<string, unknown>)
        setEditorDirty(true)
        return next
      })
    },
    [setEditorData, setEditorDirty],
  )

  return (
    <div className="space-y-6">
      {hasContent && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">Infrastructure Config</h3>
            <InfraViewToggle mode={viewMode} onToggle={setViewMode} />
          </div>

          {viewMode === 'visual' && (
            <div className="space-y-6">
              <HostingSelector
                selected={infraData.hosting}
                onChange={(hosting) => updateInfraData({ hosting })}
              />
              <DockerPreview
                docker={infraData.docker}
                onChange={(docker) => updateInfraData({ docker })}
              />
              <CIPipelineEditor
                pipeline={infraData.ciPipeline}
                onChange={(ciPipeline) => updateInfraData({ ciPipeline })}
              />
              <EnvVarManager
                envVars={infraData.envVars}
                onChange={(envVars) => updateInfraData({ envVars })}
              />
            </div>
          )}

          {viewMode === 'json' && (
            <SchemaPreview
              schema={JSON.stringify(infraData, null, 2)}
              language="json"
            />
          )}
        </>
      )}

      {!hasContent && stage.status === 'active' && (
        <div className="flex flex-col items-center justify-center gap-2 py-8">
          <p className="text-xs text-zinc-300">
            Click Generate to create infrastructure configuration from your stack and database choices.
          </p>
        </div>
      )}
    </div>
  )
}
