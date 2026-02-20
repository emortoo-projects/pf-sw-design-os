import type { Stage, StageOutput } from '@sdos/shared'
import { Card, CardContent } from '@/components/ui/card'
import { usePipelineStore } from '@/stores/pipeline-store'
import { StageInterviewWrapper } from '@/features/interview'
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
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
