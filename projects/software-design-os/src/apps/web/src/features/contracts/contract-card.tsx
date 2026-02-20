import { cn } from '@/lib/utils'
import type { PromptContract } from './types'
import { TYPE_COLORS } from './types'
import { GitBranch } from 'lucide-react'

interface ContractCardProps {
  contract: PromptContract
  onClick: () => void
}

export function ContractCard({ contract, onClick }: ContractCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span
          className={cn(
            'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase',
            TYPE_COLORS[contract.type] ?? 'bg-zinc-100 text-zinc-600',
          )}
        >
          {contract.type}
        </span>
        <span className="text-xs text-zinc-400">#{contract.priority}</span>
      </div>

      <h4 className="mb-1 text-sm font-medium text-zinc-900 line-clamp-2">
        {contract.title}
      </h4>

      {contract.dependencies.length > 0 && (
        <div className="mt-2 flex items-center gap-1 text-xs text-zinc-400">
          <GitBranch className="h-3 w-3" />
          <span>{contract.dependencies.length} dep{contract.dependencies.length !== 1 ? 's' : ''}</span>
        </div>
      )}
    </button>
  )
}
