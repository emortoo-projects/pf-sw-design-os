import type { Stage } from '@sdos/shared'
import { getStageConfig } from '@sdos/shared'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StageNavigationButtonsProps {
  stages: Stage[]
  currentStageNumber: number
  onNavigate: (stageNumber: number) => void
}

export function StageNavigationButtons({ stages, currentStageNumber, onNavigate }: StageNavigationButtonsProps) {
  const prevStage = stages.find((s) => s.stageNumber === currentStageNumber - 1)
  const nextStage = stages.find((s) => s.stageNumber === currentStageNumber + 1)
  const currentStage = stages.find((s) => s.stageNumber === currentStageNumber)

  const canGoPrev = prevStage && prevStage.status !== 'locked'
  const canGoNext = nextStage && nextStage.status !== 'locked' && currentStage?.status === 'complete'

  const prevConfig = prevStage ? getStageConfig(prevStage.stageNumber) : undefined
  const nextConfig = nextStage ? getStageConfig(nextStage.stageNumber) : undefined

  return (
    <div className="flex items-center justify-between">
      {canGoPrev ? (
        <Button variant="ghost" size="sm" onClick={() => onNavigate(prevStage.stageNumber)}>
          <ChevronLeft />
          {prevConfig?.label ?? `Stage ${prevStage.stageNumber}`}
        </Button>
      ) : (
        <div />
      )}
      {canGoNext ? (
        <Button variant="ghost" size="sm" onClick={() => onNavigate(nextStage.stageNumber)}>
          {nextConfig?.label ?? `Stage ${nextStage.stageNumber}`}
          <ChevronRight />
        </Button>
      ) : (
        <div />
      )}
    </div>
  )
}
