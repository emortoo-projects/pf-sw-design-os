import type { Stage } from '@sdos/shared'
import { Card, CardContent } from '@/components/ui/card'
import { StageInterviewWrapper, useIsInterviewing } from '@/features/interview'
import { StageHeader } from './stage-header'
import { StageActionBar } from './stage-action-bar'
import { LockedStageMessage } from './locked-stage-message'
import { getStageEditor } from './stage-editor-map'

interface StageEditorContainerProps {
  stage: Stage
  onGenerate: () => void
  onSave: () => void
  onComplete: () => void
  onRevert: () => void
  isGenerating: boolean
  isCompleting: boolean
  isSaving: boolean
}

export function StageEditorContainer({
  stage,
  onGenerate,
  onSave,
  onComplete,
  onRevert,
  isGenerating,
  isCompleting,
  isSaving,
}: StageEditorContainerProps) {
  const Editor = getStageEditor(stage.stageName)
  const interviewing = useIsInterviewing(stage)

  return (
    <Card>
      <StageHeader stage={stage} />
      <CardContent>
        {stage.status === 'locked' ? (
          <LockedStageMessage />
        ) : (
          <div className="space-y-4">
            <StageInterviewWrapper
              stage={stage}
              onGenerate={onGenerate}
              isGenerating={isGenerating}
            >
              <Editor stage={stage} />
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
