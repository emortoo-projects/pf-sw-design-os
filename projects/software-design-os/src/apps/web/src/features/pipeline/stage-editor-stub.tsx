import { getStageConfig } from '@sdos/shared'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import type { StageEditorProps } from './stage-editor-map'

export function StageEditorStub({ stage }: StageEditorProps) {
  const config = getStageConfig(stage.stageNumber)

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50/50 py-16">
      {config && <DynamicIcon name={config.icon} className="h-10 w-10 text-zinc-300" />}
      <p className="text-sm font-medium text-zinc-400">
        Stage {stage.stageNumber}: {stage.stageLabel}
      </p>
      <p className="text-xs text-zinc-300">Editor coming soon</p>
    </div>
  )
}
