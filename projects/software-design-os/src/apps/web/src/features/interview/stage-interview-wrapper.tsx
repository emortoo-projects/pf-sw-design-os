import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import { ClipboardList, RotateCcw } from 'lucide-react'
import type { Stage } from '@sdos/shared'
import { usePipelineStore } from '@/stores/pipeline-store'
import { Button } from '@/components/ui/button'
import type { InterviewMode, InterviewAnswers } from './types'
import { getStageInterview, hasInterview } from './interview-config'
import { InterviewModeSelector } from './interview-mode-selector'
import { GuidedWizard } from './guided-wizard'

function interviewStorageKey(stageId: string) {
  return `sdos-interview-${stageId}`
}

interface StageInterviewWrapperProps {
  stage: Stage
  onGenerate: () => void
  isGenerating: boolean
  children: ReactNode
}

export function StageInterviewWrapper({
  stage,
  onGenerate,
  isGenerating,
  children,
}: StageInterviewWrapperProps) {
  const { setUserInput, setIsInterviewing } = usePipelineStore()
  const [mode, setMode] = useState<InterviewMode | null>(null)
  const [answers, setAnswers] = useState<InterviewAnswers>({})
  const [showInterview, setShowInterview] = useState(false)
  const restoredStageRef = useRef<string | null>(null)

  // All hooks must be declared before any conditional return
  const handleGenerate = useCallback(() => {
    setUserInput(JSON.stringify(answers, null, 2))
    onGenerate()
  }, [answers, setUserInput, onGenerate])

  // Auto-save interview answers to localStorage with debounce (not the API,
  // to avoid overwriting stage.data or prematurely changing stage status)
  useEffect(() => {
    const hasAnswers = Object.keys(answers).length > 0
    if (!hasAnswers) return
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          interviewStorageKey(stage.id),
          JSON.stringify({ answers, mode }),
        )
      } catch {
        // Storage full or unavailable — safe to ignore
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [answers, mode, stage.id])

  // Restore answers from localStorage on mount / stage change
  useEffect(() => {
    if (restoredStageRef.current === stage.id) return
    restoredStageRef.current = stage.id
    try {
      const raw = localStorage.getItem(interviewStorageKey(stage.id))
      if (!raw) return
      const saved = JSON.parse(raw) as { answers?: InterviewAnswers; mode?: InterviewMode }
      if (saved.answers) setAnswers(saved.answers)
      if (saved.mode) setMode(saved.mode)
    } catch {
      // Corrupt data — ignore
    }
  }, [stage.id])

  // Clean up localStorage once stage is in a post-generation state
  useEffect(() => {
    if (stage.status === 'review' || stage.status === 'complete') {
      localStorage.removeItem(interviewStorageKey(stage.id))
    }
  }, [stage.status, stage.id])

  const config = getStageInterview(stage.stageNumber)
  // Ignore interview-only data ({ _interviewAnswers, _interviewMode }) that may
  // still be in the DB from previous auto-saves — only real generated/edited data counts.
  const stageHasData =
    !!stage.data &&
    Object.keys(stage.data).length > 0 &&
    !('_interviewAnswers' in stage.data)
  const stageIsActive = stage.status === 'active'

  const isInterviewing = !!config && hasInterview(stage.stageNumber) && (!stageHasData || showInterview)

  // Sync interviewing state to store so parent components (e.g. StageActionBar) can react
  useEffect(() => {
    if (isInterviewing) {
      setIsInterviewing(true)
      return () => setIsInterviewing(false)
    }
  }, [isInterviewing, setIsInterviewing])

  // No interview for this stage — pass through to editor
  if (!config || !hasInterview(stage.stageNumber)) {
    return <>{children}</>
  }

  // Stage has data and user isn't re-interviewing — show editor
  if (stageHasData && !showInterview) {
    const canReInterview = stage.status === 'active' || stage.status === 'review'
    return (
      <div className="space-y-4">
        {canReInterview && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInterview(true)}
              className="text-zinc-500"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Re-interview
            </Button>
          </div>
        )}
        {children}
      </div>
    )
  }

  function handleBackToEditor() {
    setShowInterview(false)
    setMode(null)
  }

  // Stage is active with no data OR user chose to re-interview — show interview flow
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100">
            <ClipboardList className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">{config.interviewTitle}</h2>
            <p className="text-xs text-zinc-500">
              {config.questions.length} questions to help the AI understand your needs
            </p>
          </div>
        </div>
        {showInterview && stageHasData && (
          <Button variant="ghost" size="sm" onClick={handleBackToEditor}>
            Back to editor
          </Button>
        )}
      </div>

      {/* Mode selection (if not yet chosen) */}
      {!mode && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-600">How would you like to answer?</p>
          <InterviewModeSelector selected={mode} onSelect={setMode} />
        </div>
      )}

      {/* Guided wizard */}
      {mode === 'guided' && (
        <GuidedWizard
          config={config}
          answers={answers}
          onAnswersChange={setAnswers}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
      )}
    </div>
  )
}
