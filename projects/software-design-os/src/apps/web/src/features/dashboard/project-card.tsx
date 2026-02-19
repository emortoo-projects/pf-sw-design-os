import { Link } from 'react-router'
import { FolderOpen, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STAGE_CONFIGS } from '@sdos/shared'
import type { ProjectWithStages, StageStatus } from '@sdos/shared'

interface ProjectCardProps {
  project: ProjectWithStages
}

const STATUS_COLORS: Record<StageStatus, string> = {
  complete: 'bg-emerald-500',
  review: 'bg-blue-500',
  generating: 'bg-amber-400',
  active: 'bg-primary-400',
  locked: 'bg-zinc-200',
}

function MiniProgressBar({ stages }: { stages: ProjectWithStages['stages'] }) {
  const completed = stages.filter((s) => s.status === 'complete').length
  const pct = Math.round((completed / 9) * 100)

  return (
    <div className="space-y-1">
      <div className="flex gap-0.5">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className={cn('h-1.5 flex-1 rounded-full', STATUS_COLORS[stage.status])}
            title={`${stage.stageLabel}: ${stage.status}`}
          />
        ))}
      </div>
      <p className="text-[10px] text-zinc-400">{pct}% complete</p>
    </div>
  )
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ProjectCard({ project }: ProjectCardProps) {
  const clampedStage = Math.max(1, Math.min(9, project.currentStage))
  const currentConfig = STAGE_CONFIGS[clampedStage - 1]

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group flex flex-col rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:border-primary-300 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
          <FolderOpen className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-zinc-900 truncate">{project.name}</h3>
          {project.description && (
            <p className="mt-0.5 text-xs text-zinc-500 line-clamp-2">{project.description}</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500">
        <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-medium">
          Stage {project.currentStage}
        </span>
        <span className="text-zinc-400">{currentConfig?.label}</span>
      </div>

      <div className="mt-3">
        <MiniProgressBar stages={project.stages} />
      </div>

      <div className="mt-3 flex items-center gap-1 text-[10px] text-zinc-400">
        <Calendar className="h-3 w-3" />
        <span>Updated {formatRelativeDate(project.updatedAt)}</span>
      </div>
    </Link>
  )
}
