import { cn } from '@/lib/utils'
import type { CategoryConfig, StackCategory } from './types'

interface CategoryPickerProps {
  categories: CategoryConfig[]
  selections: Record<StackCategory, string>
  onChange: (category: StackCategory, optionId: string) => void
}

export function CategoryPicker({ categories, selections, onChange }: CategoryPickerProps) {
  return (
    <div className="space-y-5">
      {categories.map((category) => (
        <div key={category.id} className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">{category.label}</label>
          <div
            className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
            role="radiogroup"
            aria-label={category.label}
          >
            {category.options.map((option) => {
              const isSelected = selections[category.id] === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onChange(category.id, option.id)}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border p-3 text-left transition-all',
                    isSelected
                      ? 'border-primary-400 bg-primary-50 ring-1 ring-primary-200'
                      : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50',
                  )}
                >
                  <div className="min-w-0">
                    <p className={cn('text-sm font-semibold', isSelected ? 'text-primary-900' : 'text-zinc-900')}>
                      {option.name}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{option.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
