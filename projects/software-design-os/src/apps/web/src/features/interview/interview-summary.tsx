import { Pencil, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { InterviewQuestion, InterviewAnswers, AnswerValue } from './types'
import { isAnswerEmpty } from './types'

interface InterviewSummaryProps {
  questions: InterviewQuestion[]
  answers: InterviewAnswers
  onEdit: (stepNumber: number) => void
  onGenerate: () => void
  isGenerating: boolean
  stageLabel: string
}

function formatAnswer(value: AnswerValue | undefined): string {
  if (value === undefined || value === null) return '—'
  if (typeof value === 'string') return value || '—'
  if (Array.isArray(value)) {
    const filled = value.filter((v) => v.trim().length > 0)
    return filled.length > 0 ? filled.join(', ') : '—'
  }
  // checkbox-and-textarea
  const parts: string[] = []
  if (value.selected.length > 0) parts.push(value.selected.join(', '))
  if (value.text.trim()) parts.push(value.text.trim())
  return parts.length > 0 ? parts.join(' | ') : '—'
}

export function InterviewSummary({
  questions,
  answers,
  onEdit,
  onGenerate,
  isGenerating,
  stageLabel,
}: InterviewSummaryProps) {
  const answeredCount = questions.filter((q) => !isAnswerEmpty(answers[q.id])).length
  const requiredUnanswered = questions.filter(
    (q) => q.required && isAnswerEmpty(answers[q.id]),
  )
  const canGenerate = requiredUnanswered.length === 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Review Your Answers</h2>
          <p className="text-sm text-zinc-500">
            {answeredCount} of {questions.length} questions answered
          </p>
        </div>
        <Badge variant={canGenerate ? 'success' : 'warning'}>
          {canGenerate ? 'Ready to generate' : `${requiredUnanswered.length} required left`}
        </Badge>
      </div>

      {/* Answer cards */}
      <div className="space-y-3">
        {questions.map((q, index) => {
          const answer = answers[q.id]
          const empty = isAnswerEmpty(answer)
          return (
            <div
              key={q.id}
              className="flex items-start gap-4 rounded-lg border border-zinc-100 bg-white px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-zinc-900">{q.question}</p>
                  {q.required && empty && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                      Required
                    </Badge>
                  )}
                </div>
                <p className={`mt-1 text-sm ${empty ? 'text-zinc-400 italic' : 'text-zinc-600'}`}>
                  {empty ? 'Not answered' : formatAnswer(answer)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(index + 1)}
                aria-label={`Edit answer for: ${q.question}`}
                className="shrink-0"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
          )
        })}
      </div>

      {/* Generate button */}
      <div className="flex justify-center pt-2">
        <Button
          size="lg"
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className="px-8"
        >
          {isGenerating ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Sparkles />
          )}
          {isGenerating ? 'Generating...' : `Generate ${stageLabel}`}
        </Button>
      </div>

      {!canGenerate && (
        <p className="text-center text-xs text-zinc-400">
          Please answer all required questions before generating.
        </p>
      )}
    </div>
  )
}
