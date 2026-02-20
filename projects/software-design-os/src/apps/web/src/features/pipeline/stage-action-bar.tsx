import { useState, useEffect } from 'react'
import type { Stage } from '@sdos/shared'
import { Sparkles, Save, RotateCcw, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

/** Stages that involve large context and may take several minutes. */
const HEAVY_STAGES = new Set(['database', 'api', 'sections'])

function useElapsedSeconds(active: boolean): number {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!active) {
      setElapsed(0)
      return
    }
    const start = Date.now()
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(id)
  }, [active])
  return elapsed
}

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

interface StageActionBarProps {
  stage: Stage
  onGenerate: () => void
  onSave: () => void
  onComplete: () => void
  onRevert: () => void
  isGenerating: boolean
  isCompleting: boolean
  isSaving: boolean
}

export function StageActionBar({
  stage,
  onGenerate,
  onSave,
  onComplete,
  onRevert,
  isGenerating,
  isCompleting,
  isSaving,
}: StageActionBarProps) {
  const canGenerate = stage.status === 'active' || stage.status === 'review'
  const canSave = stage.status === 'review'
  const canComplete = stage.status === 'review'
  const canRevert = stage.status === 'review' || stage.status === 'complete'
  const elapsed = useElapsedSeconds(isGenerating)
  const isHeavy = HEAVY_STAGES.has(stage.stageName)

  return (
    <>
      <Separator />
      {isGenerating && (
        <div className="flex items-center gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-700">
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          <div className="flex-1">
            <p className="font-medium">
              Generating {stage.stageLabel}... {formatElapsed(elapsed)}
            </p>
            <p className="text-primary-600 text-xs">
              {isHeavy
                ? 'Complex stages may take 2\u20135 minutes. Do not close the tab.'
                : 'This usually takes 30\u201390 seconds.'}
            </p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={onGenerate}
            disabled={!canGenerate || isGenerating}
          >
            {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={!canSave || isSaving}
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
            Save
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRevert}
            disabled={!canRevert}
          >
            <RotateCcw />
            Revert
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onComplete}
            disabled={!canComplete || isCompleting}
          >
            {isCompleting ? <Loader2 className="animate-spin" /> : <CheckCircle />}
            {isCompleting ? 'Validating...' : 'Validate & Complete'}
          </Button>
        </div>
      </div>
    </>
  )
}
