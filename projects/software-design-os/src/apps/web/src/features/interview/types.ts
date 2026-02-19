export type InputType =
  | 'textarea'
  | 'multi-input'
  | 'checkbox'
  | 'checkbox-and-textarea'
  | 'single-select'
  | 'multi-select'
  | 'color-picker-optional'

export interface SelectOption {
  label: string
  description?: string
  value?: string
}

export interface InterviewQuestion {
  id: string
  question: string
  subtext?: string
  inputType: InputType
  placeholder?: string
  required: boolean
  minLength?: number
  minItems?: number
  maxItems?: number
  addButtonLabel?: string
  options?: SelectOption[] | string[]
  textareaLabel?: string
}

export interface StageInterviewConfig {
  stageNumber: number
  label: string
  interviewTitle: string
  preContext?: string
  questions: InterviewQuestion[]
}

export type InterviewMode = 'guided' | 'quick' | 'conversational'

export type AnswerValue = string | string[] | { selected: string[]; text: string }

export type InterviewAnswers = Record<string, AnswerValue>

export function isAnswerEmpty(value: AnswerValue | undefined): boolean {
  if (value === undefined || value === null) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0 || value.every((v) => v.trim().length === 0)
  // checkbox-and-textarea
  return value.selected.length === 0 && value.text.trim().length === 0
}

export function isStepComplete(question: InterviewQuestion, answer: AnswerValue | undefined): boolean {
  if (!question.required) return true
  return !isAnswerEmpty(answer)
}

export function getCompletedStepCount(
  questions: InterviewQuestion[],
  answers: InterviewAnswers,
): number {
  return questions.filter((q) => !isAnswerEmpty(answers[q.id])).length
}
