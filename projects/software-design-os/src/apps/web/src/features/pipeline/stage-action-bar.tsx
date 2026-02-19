import type { Stage } from '@sdos/shared'
import { Sparkles, Save, RotateCcw, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

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

  return (
    <>
      <Separator />
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
