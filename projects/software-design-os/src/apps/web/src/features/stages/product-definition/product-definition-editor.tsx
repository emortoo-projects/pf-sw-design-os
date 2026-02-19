import { useState, useEffect, useCallback } from 'react'
import type { Stage } from '@sdos/shared'
import { usePipelineStore } from '@/stores/pipeline-store'
import { ProductIdeaInput } from './product-idea-input'
import { ProductOverviewCard } from './product-overview-card'
import { ProblemSolutionEditor } from './problem-solution-editor'
import { FeatureList } from './feature-list'
import { PersonaCards } from './persona-cards'
import { DualViewToggle, type ViewMode } from './dual-view-toggle'
import { RawJsonEditor } from './raw-json-editor'
import type { ProductDefinition, ProblemSolution, Feature, Persona } from './types'
import { createEmptyProductDefinition } from './types'

interface ProductDefinitionEditorProps {
  stage: Stage
}

function parseDefinition(data: Record<string, unknown> | undefined): ProductDefinition {
  if (!data || !data.name) return createEmptyProductDefinition()
  return {
    name: (data.name as string) ?? '',
    tagline: (data.tagline as string) ?? '',
    description: (data.description as string) ?? '',
    problems: Array.isArray(data.problems) ? data.problems : [],
    features: Array.isArray(data.features) ? data.features : [],
    personas: Array.isArray(data.personas) ? data.personas : [],
  }
}

export function ProductDefinitionEditor({ stage }: ProductDefinitionEditorProps) {
  const { setEditorDirty, setEditorData, userInput, setUserInput } = usePipelineStore()
  const [viewMode, setViewMode] = useState<ViewMode>('structured')
  const [definition, setDefinition] = useState<ProductDefinition>(() =>
    parseDefinition(stage.data),
  )

  const hasDefinition = !!definition.name

  // Sync stage.data changes (after generate/save) into local state
  useEffect(() => {
    const parsed = parseDefinition(stage.data)
    if (parsed.name) {
      setDefinition(parsed)
    }
  }, [stage.data])

  const updateDefinition = useCallback(
    (updates: Partial<ProductDefinition>) => {
      setDefinition((prev) => {
        const next = { ...prev, ...updates }
        setEditorData(next as unknown as Record<string, unknown>)
        setEditorDirty(true)
        return next
      })
    },
    [setEditorData, setEditorDirty],
  )

  function handleRawChange(data: ProductDefinition) {
    setDefinition(data)
    setEditorData(data as unknown as Record<string, unknown>)
    setEditorDirty(true)
  }

  // If stage is active and no definition yet, show the idea input
  const showIdeaInput = stage.status === 'active' && !hasDefinition

  return (
    <div className="space-y-6">
      {/* Always show idea input at top if active */}
      {(showIdeaInput || stage.status === 'active') && (
        <ProductIdeaInput
          value={userInput}
          onChange={setUserInput}
          onSubmit={() => {
            // Generate is handled by the pipeline action bar
            // The userInput is available in the store
          }}
          isGenerating={stage.status === 'generating'}
        />
      )}

      {/* Show definition editor if we have data */}
      {hasDefinition && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">Product Definition</h3>
            <DualViewToggle mode={viewMode} onToggle={setViewMode} />
          </div>

          {viewMode === 'structured' ? (
            <div className="space-y-6">
              <ProductOverviewCard
                name={definition.name}
                tagline={definition.tagline}
                description={definition.description}
                onNameChange={(name) => updateDefinition({ name })}
                onTaglineChange={(tagline) => updateDefinition({ tagline })}
                onDescriptionChange={(description) => updateDefinition({ description })}
              />
              <ProblemSolutionEditor
                problems={definition.problems}
                onChange={(problems: ProblemSolution[]) => updateDefinition({ problems })}
              />
              <FeatureList
                features={definition.features}
                onChange={(features: Feature[]) => updateDefinition({ features })}
              />
              <PersonaCards
                personas={definition.personas}
                onChange={(personas: Persona[]) => updateDefinition({ personas })}
              />
            </div>
          ) : (
            <RawJsonEditor data={definition} onChange={handleRawChange} />
          )}
        </>
      )}

      {/* Empty state when locked or no data generated yet */}
      {!hasDefinition && stage.status !== 'active' && stage.status !== 'generating' && (
        <div className="flex flex-col items-center justify-center gap-2 py-12">
          <p className="text-sm text-zinc-400">No product definition yet.</p>
          <p className="text-xs text-zinc-300">Enter your product idea and click Generate to get started.</p>
        </div>
      )}
    </div>
  )
}
