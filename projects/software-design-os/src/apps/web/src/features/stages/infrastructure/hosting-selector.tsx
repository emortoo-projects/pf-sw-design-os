import { Container, Train, Globe, Cpu, Triangle, Settings, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HostingProvider, HostingOption } from './types'
import { HOSTING_OPTIONS } from './types'

interface HostingSelectorProps {
  selected: HostingProvider
  onChange: (hosting: HostingProvider) => void
}

const iconMap: Record<string, typeof Container> = {
  Container,
  Train,
  Globe,
  Cpu,
  Triangle,
  Settings,
}

function HostingCard({ option, isSelected, onClick }: { option: HostingOption; isSelected: boolean; onClick: () => void }) {
  const Icon = iconMap[option.icon] ?? Settings

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex flex-col gap-2 rounded-lg border p-4 text-left transition-all',
        isSelected
          ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500'
          : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50',
      )}
    >
      {isSelected && (
        <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}
      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4', isSelected ? 'text-blue-600' : 'text-zinc-500')} />
        <span className="text-sm font-medium text-zinc-900">{option.name}</span>
      </div>
      <p className="text-xs text-zinc-500 leading-relaxed">{option.description}</p>
      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
          {option.bestFor}
        </span>
        <span className="text-[10px] text-zinc-400">{option.pricingHint}</span>
      </div>
    </button>
  )
}

export function HostingSelector({ selected, onChange }: HostingSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-zinc-700">Hosting Provider</label>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {HOSTING_OPTIONS.map((option) => (
          <HostingCard
            key={option.id}
            option={option}
            isSelected={selected === option.id}
            onClick={() => onChange(option.id)}
          />
        ))}
      </div>
    </div>
  )
}
