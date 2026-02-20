import { FolderOpen, Loader2, CheckCircle2, DollarSign, Zap, Hash, Calculator, Bot } from 'lucide-react'
import type { ProjectWithStages } from '@sdos/shared'
import type { DashboardSummary } from '@/lib/api-client'

interface DashboardStatsProps {
  projects: ProjectWithStages[]
  summary: DashboardSummary | undefined
  summaryLoading: boolean
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-md ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-lg font-semibold text-zinc-900">{value}</p>
      </div>
    </div>
  )
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

export function DashboardStats({ projects, summary, summaryLoading }: DashboardStatsProps) {
  const total = projects.length
  const inProgress = projects.filter((p) => {
    const completedStages = p.stages.filter((s) => s.status === 'complete').length
    return completedStages > 0 && completedStages < 9
  }).length
  const completed = projects.filter((p) =>
    p.stages.every((s) => s.status === 'complete'),
  ).length

  const totalCost = summary?.totalCost ?? 0
  const totalTokens = summary?.totalTokens ?? 0
  const generationCount = summary?.generationCount ?? 0
  const avgCost = summary?.avgCostPerGeneration ?? 0
  const topModel = summary?.topModel

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<FolderOpen className="h-4 w-4 text-primary-600" />}
        label="Total Projects"
        value={total}
        color="bg-primary-50"
      />
      <StatCard
        icon={<Loader2 className="h-4 w-4 text-amber-600" />}
        label="In Progress"
        value={inProgress}
        color="bg-amber-50"
      />
      <StatCard
        icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
        label="Completed"
        value={completed}
        color="bg-emerald-50"
      />
      <StatCard
        icon={<DollarSign className="h-4 w-4 text-violet-600" />}
        label="AI Spend (month)"
        value={summaryLoading ? '...' : `$${totalCost.toFixed(2)}`}
        color="bg-violet-50"
      />
      <StatCard
        icon={<Zap className="h-4 w-4 text-blue-600" />}
        label="Total Tokens"
        value={summaryLoading ? '...' : formatTokens(totalTokens)}
        color="bg-blue-50"
      />
      <StatCard
        icon={<Hash className="h-4 w-4 text-rose-600" />}
        label="Generations"
        value={summaryLoading ? '...' : generationCount}
        color="bg-rose-50"
      />
      <StatCard
        icon={<Calculator className="h-4 w-4 text-teal-600" />}
        label="Avg Cost/Gen"
        value={summaryLoading ? '...' : `$${avgCost.toFixed(3)}`}
        color="bg-teal-50"
      />
      <StatCard
        icon={<Bot className="h-4 w-4 text-indigo-600" />}
        label="Active Model"
        value={summaryLoading ? '...' : (topModel ? `${topModel.model} (${topModel.percentage}%)` : 'None')}
        color="bg-indigo-50"
      />
    </div>
  )
}
