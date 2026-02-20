import { useMemo } from 'react'
import type { Stage, StageOutput } from '@sdos/shared'
import { Card, CardContent } from '@/components/ui/card'
import { usePipelineStore } from '@/stores/pipeline-store'
import { StageInterviewWrapper } from '@/features/interview'
import type { ValidationResult } from '@/features/stages/export-preview/types'
import { StageHeader } from './stage-header'
import { StageActionBar } from './stage-action-bar'
import { LockedStageMessage } from './locked-stage-message'
import { OutputVersionBar } from './output-version-bar'
import { getStageEditor } from './stage-editor-map'

interface StageEditorContainerProps {
  stage: Stage
  allStages?: Stage[]
  outputs?: StageOutput[]
  onGenerate: () => void
  onSave: () => void
  onComplete: () => void
  onRevert: () => void
  onActivateVersion?: (version: number) => void
  isGenerating: boolean
  isCompleting: boolean
  isSaving: boolean
  isActivatingVersion?: boolean
}

export function StageEditorContainer({
  stage,
  allStages,
  outputs,
  onGenerate,
  onSave,
  onComplete,
  onRevert,
  onActivateVersion,
  isGenerating,
  isCompleting,
  isSaving,
  isActivatingVersion,
}: StageEditorContainerProps) {
  const Editor = getStageEditor(stage.stageName)
  const interviewing = usePipelineStore((s) => s.isInterviewing)
  const showVersionBar = outputs && outputs.length > 1 && onActivateVersion

  // Stage 9 (export) validation: extract error/warning counts from stage data
  const exportValidation = useMemo(() => {
    if (stage.stageNumber !== 9 || !stage.data) return null
    const validation = (stage.data as Record<string, unknown>).validation
    if (!Array.isArray(validation)) return null
    const results = validation as ValidationResult[]
    const errorCount = results.filter((r) => r.severity === 'error').length
    const warningCount = results.filter((r) => r.severity === 'warning').length
    return { errorCount, warningCount }
  }, [stage.stageNumber, stage.data])

  return (
    <Card>
      <StageHeader stage={stage} />
      <CardContent>
        {stage.status === 'locked' ? (
          <LockedStageMessage />
        ) : (
          <div className="space-y-4">
            {showVersionBar && (
              <OutputVersionBar
                outputs={outputs}
                onActivateVersion={onActivateVersion}
                isActivating={isActivatingVersion ?? false}
              />
            )}
            <StageInterviewWrapper
              key={stage.id}
              stage={stage}
              onGenerate={onGenerate}
              isGenerating={isGenerating}
            >
              <Editor stage={stage} allStages={allStages} />
            </StageInterviewWrapper>
            {!interviewing && (
              <StageActionBar
                stage={stage}
                onGenerate={onGenerate}
                onSave={onSave}
                onComplete={onComplete}
                onRevert={onRevert}
                isGenerating={isGenerating}
                isCompleting={isCompleting}
                isSaving={isSaving}
                validationBlocksComplete={exportValidation ? exportValidation.errorCount > 0 : undefined}
                validationWarningCount={exportValidation?.warningCount}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
