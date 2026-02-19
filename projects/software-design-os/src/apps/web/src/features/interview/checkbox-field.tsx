import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckboxFieldProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  multi?: boolean
}

export function CheckboxField({ options, selected, onChange, multi = true }: CheckboxFieldProps) {
  function handleToggle(option: string) {
    if (multi) {
      if (selected.includes(option)) {
        onChange(selected.filter((s) => s !== option))
      } else {
        onChange([...selected, option])
      }
    } else {
      onChange([option])
    }
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2" role="group">
      {options.map((option) => {
        const isSelected = selected.includes(option)
        return (
          <button
            key={option}
            type="button"
            role="checkbox"
            aria-checked={isSelected}
            onClick={() => handleToggle(option)}
            className={cn(
              'flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors',
              isSelected
                ? 'border-primary-400 bg-primary-50 text-primary-900'
                : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50',
            )}
          >
            <div
              className={cn(
                'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                isSelected
                  ? 'border-primary-600 bg-primary-600'
                  : 'border-zinc-300',
              )}
            >
              {isSelected && <Check className="h-3 w-3 text-white" />}
            </div>
            {option}
          </button>
        )
      })}
    </div>
  )
}
