import { useState } from 'react'
import { ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { StageInterviewConfig, InterviewAnswers, AnswerValue } from './types'
import { isStepComplete } from './types'
import { WizardProgressBar } from './wizard-progress-bar'
import { InterviewStep } from './interview-step'
import { InterviewSummary } from './interview-summary'

interface GuidedWizardProps {
  config: StageInterviewConfig
  answers: InterviewAnswers
  onAnswersChange: (answers: InterviewAnswers) => void
  onGenerate: () => void
  isGenerating: boolean
}

export function GuidedWizard({
  config,
  answers,
  onAnswersChange,
  onGenerate,
  isGenerating,
}: GuidedWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [showSummary, setShowSummary] = useState(false)

  const totalSteps = config.questions.length
  const currentQuestion = config.questions[currentStep - 1]
  const isFirst = currentStep === 1
  const isLast = currentStep === totalSteps

  function handleAnswerChange(value: AnswerValue) {
    onAnswersChange({ ...answers, [currentQuestion.id]: value })
  }

  function handleNext() {
    if (isLast) {
      setShowSummary(true)
    } else {
      setCurrentStep((s) => Math.min(s + 1, totalSteps))
    }
  }

  function handlePrevious() {
    if (showSummary) {
      setShowSummary(false)
    } else {
      setCurrentStep((s) => Math.max(s - 1, 1))
    }
  }

  function handleStepClick(step: number) {
    setShowSummary(false)
    setCurrentStep(step)
  }

  function handleEditFromSummary(stepNumber: number) {
    setShowSummary(false)
    setCurrentStep(stepNumber)
  }

  const canProceed = !currentQuestion?.required || isStepComplete(currentQuestion, answers[currentQuestion?.id])

  if (showSummary) {
    return (
      <div className="space-y-6">
        {/* Progress bar at top */}
        <div className="flex items-center justify-between">
          <WizardProgressBar
            questions={config.questions}
            currentStep={totalSteps + 1}
            answers={answers}
            onStepClick={handleStepClick}
          />
        </div>

        <InterviewSummary
          questions={config.questions}
          answers={answers}
          onEdit={handleEditFromSummary}
          onGenerate={onGenerate}
          isGenerating={isGenerating}
          stageLabel={config.label}
        />

        {/* Back button */}
        <div className="flex justify-start">
          <Button variant="ghost" size="sm" onClick={handlePrevious}>
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to questions
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Progress bar */}
      <div className="flex items-center justify-between">
        <WizardProgressBar
          questions={config.questions}
          currentStep={currentStep}
          answers={answers}
          onStepClick={handleStepClick}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSummary(true)}
          className="text-zinc-500"
        >
          <ClipboardList className="h-3.5 w-3.5" />
          Review
        </Button>
      </div>

      {/* Pre-context banner */}
      {config.preContext && currentStep === 1 && (
        <div className="rounded-lg border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-700">
          {config.preContext}
        </div>
      )}

      {/* Current step — key forces remount so stateful inputs reset */}
      <InterviewStep
        key={currentQuestion.id}
        question={currentQuestion}
        value={answers[currentQuestion.id]}
        onChange={handleAnswerChange}
        stepNumber={currentStep}
        totalSteps={totalSteps}
      />

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={isFirst}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Previous
        </Button>

        <Button
          variant={isLast ? 'default' : 'outline'}
          size="sm"
          onClick={handleNext}
          disabled={currentQuestion.required && !canProceed}
        >
          {isLast ? 'Review Answers' : 'Next'}
          {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  )
}
