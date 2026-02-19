import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { InterviewQuestion, InterviewAnswers } from './types'
import { isAnswerEmpty } from './types'

interface WizardProgressBarProps {
  questions: InterviewQuestion[]
  currentStep: number
  answers: InterviewAnswers
  onStepClick: (step: number) => void
}

export function WizardProgressBar({
  questions,
  currentStep,
  answers,
  onStepClick,
}: WizardProgressBarProps) {
  return (
    <div className="flex items-center gap-1">
      {questions.map((q, index) => {
        const stepNum = index + 1
        const isCurrent = stepNum === currentStep
        const isAnswered = !isAnswerEmpty(answers[q.id])

        return (
          <div key={q.id} className="flex items-center">
            <button
              type="button"
              onClick={() => onStepClick(stepNum)}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-all',
                isCurrent && 'bg-primary-600 text-white ring-2 ring-primary-200',
                !isCurrent && isAnswered && 'bg-success-500 text-white',
                !isCurrent && !isAnswered && 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200',
              )}
              title={q.question}
            >
              {!isCurrent && isAnswered ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                stepNum
              )}
            </button>
            {index < questions.length - 1 && (
              <div
                className={cn(
                  'mx-1 h-0.5 w-4',
                  isAnswered ? 'bg-success-300' : 'bg-zinc-200',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
