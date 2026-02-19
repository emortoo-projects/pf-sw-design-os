import { ListChecks, AlignLeft, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { InterviewMode } from './types'

interface InterviewModeSelectorProps {
  selected: InterviewMode | null
  onSelect: (mode: InterviewMode) => void
}

const modes: Array<{
  mode: InterviewMode
  label: string
  description: string
  icon: typeof ListChecks
  available: boolean
}> = [
  {
    mode: 'guided',
    label: 'Guided',
    description: 'Step-by-step wizard with one question per screen. Best for first-time users.',
    icon: ListChecks,
    available: true,
  },
  {
    mode: 'quick',
    label: 'Quick',
    description: 'All questions on one page. Best if you know what you want.',
    icon: AlignLeft,
    available: false,
  },
  {
    mode: 'conversational',
    label: 'Conversational',
    description: 'Chat with AI — it asks questions and extracts structured data from your answers.',
    icon: MessageSquare,
    available: false,
  },
]

export function InterviewModeSelector({ selected, onSelect }: InterviewModeSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {modes.map(({ mode, label, description, icon: Icon, available }) => {
        const isSelected = selected === mode
        return (
          <button
            key={mode}
            type="button"
            onClick={() => available && onSelect(mode)}
            disabled={!available}
            className={cn(
              'relative flex flex-col items-start gap-3 rounded-xl border p-5 text-left transition-all',
              isSelected && 'border-primary-400 bg-primary-50 ring-1 ring-primary-200',
              !isSelected && available && 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50',
              !available && 'cursor-not-allowed border-zinc-100 bg-zinc-50 opacity-60',
            )}
          >
            {!available && (
              <span className="absolute right-3 top-3 rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                Coming soon
              </span>
            )}
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                isSelected ? 'bg-primary-100 text-primary-600' : 'bg-zinc-100 text-zinc-500',
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className={cn('text-sm font-semibold', isSelected ? 'text-primary-900' : 'text-zinc-900')}>
                {label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">{description}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
