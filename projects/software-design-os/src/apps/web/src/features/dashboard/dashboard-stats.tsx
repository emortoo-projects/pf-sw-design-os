import { FolderOpen, Loader2, CheckCircle2, DollarSign } from 'lucide-react'
import type { ProjectWithStages } from '@sdos/shared'

interface DashboardStatsProps {
  projects: ProjectWithStages[]
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

export function DashboardStats({ projects }: DashboardStatsProps) {
  const total = projects.length
  const inProgress = projects.filter((p) => {
    const completedStages = p.stages.filter((s) => s.status === 'complete').length
    return completedStages > 0 && completedStages < 9
  }).length
  const completed = projects.filter((p) =>
    p.stages.every((s) => s.status === 'complete'),
  ).length

  // Mock AI spend — sum estimated costs across all "completed" stages
  const aiSpend = projects.reduce((sum, p) => {
    const completedCount = p.stages.filter((s) => s.status === 'complete').length
    return sum + completedCount * 0.012
  }, 0)

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
        value={`$${aiSpend.toFixed(2)}`}
        color="bg-violet-50"
      />
    </div>
  )
}
