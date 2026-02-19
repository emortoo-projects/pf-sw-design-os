import { cn } from '@/lib/utils'
import type { SelectOption } from './types'

interface SingleSelectFieldProps {
  options: SelectOption[]
  selected: string | null
  onChange: (value: string) => void
}

export function SingleSelectField({ options, selected, onChange }: SingleSelectFieldProps) {
  return (
    <div className="grid gap-2" role="radiogroup">
      {options.map((option) => {
        const value = option.value ?? option.label
        const isSelected = selected === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(value)}
            className={cn(
              'flex flex-col gap-0.5 rounded-lg border px-4 py-3 text-left transition-colors',
              isSelected
                ? 'border-primary-400 bg-primary-50'
                : 'border-zinc-200 bg-white hover:bg-zinc-50',
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  isSelected ? 'border-primary-600' : 'border-zinc-300',
                )}
              >
                {isSelected && <div className="h-2 w-2 rounded-full bg-primary-600" />}
              </div>
              <span
                className={cn(
                  'text-sm font-medium',
                  isSelected ? 'text-primary-900' : 'text-zinc-900',
                )}
              >
                {option.label}
              </span>
            </div>
            {option.description && (
              <p className="ml-7 text-xs text-zinc-500">{option.description}</p>
            )}
          </button>
        )
      })}
    </div>
  )
}
