import type { InterviewQuestion, AnswerValue, SelectOption } from './types'
import { MultiInputField } from './multi-input-field'
import { CheckboxField } from './checkbox-field'
import { SingleSelectField } from './single-select-field'
import { CheckboxTextareaField } from './checkbox-textarea-field'
import { Badge } from '@/components/ui/badge'

interface InterviewStepProps {
  question: InterviewQuestion
  value: AnswerValue | undefined
  onChange: (value: AnswerValue) => void
  stepNumber: number
  totalSteps: number
}

function normalizeOptions(options: InterviewQuestion['options']): string[] {
  if (!options) return []
  return options.map((o) => (typeof o === 'string' ? o : o.label))
}

function normalizeSelectOptions(options: InterviewQuestion['options']): SelectOption[] {
  if (!options) return []
  return options.map((o) => (typeof o === 'string' ? { label: o } : o))
}

export function InterviewStep({
  question,
  value,
  onChange,
  stepNumber,
  totalSteps,
}: InterviewStepProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary">
          {stepNumber} of {totalSteps}
        </Badge>
        {!question.required && (
          <span className="text-xs text-zinc-400">Optional</span>
        )}
      </div>

      {/* Question */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-zinc-900">{question.question}</h2>
        {question.subtext && (
          <p className="text-sm text-zinc-500 leading-relaxed">{question.subtext}</p>
        )}
      </div>

      {/* Input field based on type */}
      <div>
        {question.inputType === 'textarea' && (
          <textarea
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            rows={5}
            className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
          />
        )}

        {question.inputType === 'multi-input' && (
          <MultiInputField
            values={Array.isArray(value) ? value : []}
            onChange={onChange}
            placeholder={question.placeholder}
            addButtonLabel={question.addButtonLabel}
            maxItems={question.maxItems}
          />
        )}

        {question.inputType === 'checkbox' && (
          <CheckboxField
            options={normalizeOptions(question.options)}
            selected={Array.isArray(value) ? value : []}
            onChange={onChange}
          />
        )}

        {question.inputType === 'multi-select' && (
          <CheckboxField
            options={normalizeOptions(question.options)}
            selected={Array.isArray(value) ? value : []}
            onChange={onChange}
          />
        )}

        {question.inputType === 'single-select' && (
          <SingleSelectField
            options={normalizeSelectOptions(question.options)}
            selected={typeof value === 'string' ? value : null}
            onChange={onChange}
          />
        )}

        {question.inputType === 'checkbox-and-textarea' && (() => {
          const composite = (value && typeof value === 'object' && !Array.isArray(value))
            ? value as { selected: string[]; text: string }
            : { selected: [] as string[], text: '' }
          return (
            <CheckboxTextareaField
              options={normalizeOptions(question.options)}
              selected={composite.selected}
              text={composite.text}
              onSelectedChange={(selected) => onChange({ ...composite, selected })}
              onTextChange={(text) => onChange({ ...composite, text })}
              textareaLabel={question.textareaLabel}
              placeholder={question.placeholder}
            />
          )
        })()}
      </div>
    </div>
  )
}
