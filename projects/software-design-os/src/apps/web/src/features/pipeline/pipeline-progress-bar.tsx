import type { Stage } from '@sdos/shared'
import { STAGE_CONFIGS } from '@sdos/shared'
import { Check, Lock, Loader2 } from 'lucide-react'
import { Tooltip } from '@/components/ui/tooltip'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { cn } from '@/lib/utils'

interface PipelineProgressBarProps {
  stages: Stage[]
  activeStageNumber: number
  onStageClick: (stageNumber: number) => void
}

export function PipelineProgressBar({ stages, activeStageNumber, onStageClick }: PipelineProgressBarProps) {
  return (
    <div className="flex items-center gap-0">
      {STAGE_CONFIGS.map((config, index) => {
        const stage = stages.find((s) => s.stageNumber === config.number)
        const status = stage?.status ?? 'locked'
        const isActive = config.number === activeStageNumber
        const isLast = index === STAGE_CONFIGS.length - 1

        return (
          <div key={config.number} className="flex items-center">
            <Tooltip content={`${config.label} — ${status}`}>
              <button
                onClick={() => onStageClick(config.number)}
                disabled={status === 'locked'}
                className={cn(
                  'relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                  status === 'complete' && 'border-success-500 bg-success-500 text-white',
                  status === 'active' && !isActive && 'border-primary-400 bg-primary-50 text-primary-600',
                  status === 'active' && isActive && 'border-primary-500 bg-primary-500 text-white animate-pulse',
                  status === 'generating' && 'border-primary-400 bg-primary-100 text-primary-600',
                  status === 'review' && !isActive && 'border-warning-500 bg-warning-50 text-warning-600',
                  status === 'review' && isActive && 'border-warning-500 bg-warning-500 text-white',
                  status === 'locked' && 'border-zinc-300 bg-zinc-100 text-zinc-400 cursor-not-allowed',
                  isActive && status !== 'locked' && 'ring-2 ring-offset-2 ring-primary-300',
                )}
              >
                {status === 'complete' && <Check className="h-4 w-4" />}
                {status === 'generating' && <Loader2 className="h-4 w-4 animate-spin" />}
                {status === 'locked' && <Lock className="h-3.5 w-3.5" />}
                {(status === 'active' || status === 'review') && (
                  <DynamicIcon name={config.icon} className="h-4 w-4" />
                )}
              </button>
            </Tooltip>

            {!isLast && (
              <div
                className={cn(
                  'h-0.5 w-6 sm:w-8 lg:w-12',
                  stage?.status === 'complete' ? 'bg-success-500' : 'bg-zinc-200',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
