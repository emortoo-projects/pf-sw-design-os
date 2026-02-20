export type { ContractType, ContractStatus, ContractEventType, ContractEvent, PromptContract } from '@sdos/shared'

export const TYPE_COLORS: Record<string, string> = {
  setup: 'bg-purple-100 text-purple-700 border-purple-200',
  model: 'bg-blue-100 text-blue-700 border-blue-200',
  api: 'bg-green-100 text-green-700 border-green-200',
  component: 'bg-orange-100 text-orange-700 border-orange-200',
  page: 'bg-pink-100 text-pink-700 border-pink-200',
  integration: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  config: 'bg-yellow-100 text-yellow-700 border-yellow-200',
}

export const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  ready: 'Ready',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
}

export const STATUS_COLORS: Record<string, string> = {
  backlog: 'bg-zinc-100 text-zinc-600',
  ready: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  in_review: 'bg-purple-100 text-purple-700',
  done: 'bg-green-100 text-green-700',
}
