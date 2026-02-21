import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { AlertCircle, X, ListChecks } from 'lucide-react'
import type { ProjectWithStages } from '@sdos/shared'
import { usePipelineStore } from '@/stores/pipeline-store'
import { useStageMutations } from '@/hooks/use-stage-mutations'
import { useStage } from '@/hooks/use-stage'
import { Button } from '@/components/ui/button'
import { assembleSDPFromStages, buildStageInputsFromStages } from '@/features/stages/export-preview'
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
  const { data: stageWithOutputs } = useStage(project.id, activeStageNumber)
  const navigate = useNavigate()

  const activeStage = project.stages.find((s) => s.stageNumber === activeStageNumber)
  const outputs = stageWithOutputs?.outputs ?? []

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

    // Stage 9 (export) — assemble client-side instead of calling backend
    if (activeStage.stageNumber === 9) {
      const inputs = buildStageInputsFromStages(project.stages)
      if (!inputs) return
      const data = assembleSDPFromStages(inputs)
      mutations.save.mutate({ stageNumber: 9, data: data as unknown as Record<string, unknown> })
      return
    }

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
    mutations.complete.mutate(
      { stageNumber: activeStage.stageNumber },
      {
        onSuccess: () => {
          const nextIncomplete = project.stages
            .filter((s) => s.stageNumber > activeStage.stageNumber && s.status !== 'complete')
            .sort((a, b) => a.stageNumber - b.stageNumber)[0]

          if (nextIncomplete) {
            setActiveStageNumber(nextIncomplete.stageNumber)
          } else {
            setActiveStageNumber(9)
          }
        },
      }
    )
  }

  function handleRevert() {
    if (!activeStage) return
    mutations.revert.mutate({ stageNumber: activeStage.stageNumber })
  }

  const allDesignStagesComplete = project.stages
    .filter((s) => s.stageNumber >= 1 && s.stageNumber <= 8)
    .every((s) => s.status === 'complete')

  if (!activeStage) return null

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{project.name}</h1>
          <p className="text-sm text-zinc-500">{project.description}</p>
        </div>
        {allDesignStagesComplete && (
          <Button
            variant="outline"
            onClick={() => navigate(`/projects/${project.id}/contracts`)}
          >
            <ListChecks className="h-4 w-4" />
            Tasks
          </Button>
        )}
      </div>

      <PipelineProgressBar
        stages={project.stages}
        activeStageNumber={activeStageNumber}
        onStageClick={handleStageClick}
      />

      <StageEditorContainer
        stage={activeStage}
        allStages={project.stages}
        outputs={outputs}
        onGenerate={handleGenerate}
        onSave={handleSave}
        onComplete={handleComplete}
        onRevert={() => usePipelineStore.getState().setConfirmRevertDialogOpen(true)}
        onActivateVersion={(version) =>
          mutations.activateVersion.mutate({ stageNumber: activeStage.stageNumber, version })
        }
        isGenerating={mutations.generate.isPending}
        isCompleting={mutations.complete.isPending}
        isSaving={mutations.save.isPending}
        isActivatingVersion={mutations.activateVersion.isPending}
      />

      {mutations.generate.isError && (
        <div role="alert" className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <p className="font-medium">Generation failed</p>
            <p className="text-red-600">
              {mutations.generate.error instanceof Error
                ? mutations.generate.error.message
                : 'An unexpected error occurred. Please try again.'}
            </p>
          </div>
          <button
            onClick={() => mutations.generate.reset()}
            aria-label="Dismiss error"
            className="shrink-0 text-red-400 hover:text-red-600"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

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
