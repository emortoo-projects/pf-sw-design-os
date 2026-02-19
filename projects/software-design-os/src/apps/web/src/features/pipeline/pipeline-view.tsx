import { useEffect } from 'react'
import type { ProjectWithStages } from '@sdos/shared'
import { usePipelineStore } from '@/stores/pipeline-store'
import { useStageMutations } from '@/hooks/use-stage-mutations'
import { PipelineProgressBar } from './pipeline-progress-bar'
import { StageEditorContainer } from './stage-editor-container'
import { StageNavigationButtons } from './stage-navigation-buttons'
import { ConfirmRevertDialog } from './confirm-revert-dialog'

interface PipelineViewProps {
  project: ProjectWithStages
}

export function PipelineView({ project }: PipelineViewProps) {
  const { activeStageNumber, setActiveStageNumber } = usePipelineStore()
  const mutations = useStageMutations(project.id)

  const activeStage = project.stages.find((s) => s.stageNumber === activeStageNumber)

  useEffect(() => {
    const current = project.stages.find((s) => s.status === 'active' || s.status === 'generating')
    if (current) {
      setActiveStageNumber(current.stageNumber)
    }
  }, [project.id])

  function handleStageClick(stageNumber: number) {
    const stage = project.stages.find((s) => s.stageNumber === stageNumber)
    if (stage && stage.status !== 'locked') {
      setActiveStageNumber(stageNumber)
    }
  }

  function handleGenerate() {
    if (!activeStage) return
    const store = usePipelineStore.getState()
    mutations.generate.mutate({
      stageNumber: activeStage.stageNumber,
      userInput: store.userInput || undefined,
    })
  }

  function handleSave() {
    if (!activeStage) return
    const store = usePipelineStore.getState()
    const data = store.editorData ?? activeStage.data ?? {}
    mutations.save.mutate({ stageNumber: activeStage.stageNumber, data })
  }

  function handleComplete() {
    if (!activeStage) return
    mutations.complete.mutate({ stageNumber: activeStage.stageNumber })
  }

  function handleRevert() {
    if (!activeStage) return
    mutations.revert.mutate({ stageNumber: activeStage.stageNumber })
  }

  if (!activeStage) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">{project.name}</h1>
        <p className="text-sm text-zinc-500">{project.description}</p>
      </div>

      <PipelineProgressBar
        stages={project.stages}
        activeStageNumber={activeStageNumber}
        onStageClick={handleStageClick}
      />

      <StageEditorContainer
        stage={activeStage}
        onGenerate={handleGenerate}
        onSave={handleSave}
        onComplete={handleComplete}
        onRevert={() => usePipelineStore.getState().setConfirmRevertDialogOpen(true)}
        isGenerating={mutations.generate.isPending}
        isCompleting={mutations.complete.isPending}
        isSaving={mutations.save.isPending}
      />

      <StageNavigationButtons
        stages={project.stages}
        currentStageNumber={activeStageNumber}
        onNavigate={setActiveStageNumber}
      />

      <ConfirmRevertDialog
        stageName={activeStage.stageLabel}
        onConfirm={handleRevert}
        isReverting={mutations.revert.isPending}
      />
    </div>
  )
}
