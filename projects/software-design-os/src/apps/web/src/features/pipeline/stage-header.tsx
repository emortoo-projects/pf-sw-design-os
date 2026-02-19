import type { Stage } from '@sdos/shared'
import { getStageConfig } from '@sdos/shared'
import { Badge } from '@/components/ui/badge'
import { CardHeader } from '@/components/ui/card'
import { DynamicIcon } from '@/components/ui/dynamic-icon'

const statusVariant: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'outline'> = {
  locked: 'secondary',
  active: 'default',
  generating: 'default',
  review: 'warning',
  complete: 'success',
}

const statusLabel: Record<string, string> = {
  locked: 'Locked',
  active: 'Active',
  generating: 'Generating...',
  review: 'In Review',
  complete: 'Complete',
}

interface StageHeaderProps {
  stage: Stage
}

export function StageHeader({ stage }: StageHeaderProps) {
  const config = getStageConfig(stage.stageNumber)

  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-100 text-primary-600 text-sm font-bold">
            {stage.stageNumber}
          </div>
          {config && <DynamicIcon name={config.icon} className="h-5 w-5 text-zinc-500" />}
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">{stage.stageLabel}</h2>
            {config && <p className="text-sm text-zinc-500">{config.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusVariant[stage.status]}>{statusLabel[stage.status]}</Badge>
          {stage.validatedAt && (
            <span className="text-xs text-zinc-400">
              Validated {new Date(stage.validatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </CardHeader>
  )
}
