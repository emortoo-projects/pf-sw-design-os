import { Plus, Search, FolderOpen } from 'lucide-react'
import type { ProjectWithStages } from '@sdos/shared'
import { ProjectCard } from './project-card'

interface ProjectGridProps {
  projects: ProjectWithStages[]
  searchQuery: string
  onCreateClick: () => void
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 bg-white py-16">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100">
        <FolderOpen className="h-7 w-7 text-zinc-400" />
      </div>
      <h3 className="mt-4 text-sm font-medium text-zinc-900">No projects yet</h3>
      <p className="mt-1 text-xs text-zinc-500">Create your first project to get started</p>
      <button
        onClick={onCreateClick}
        className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
      >
        <Plus className="h-4 w-4" />
        New Project
      </button>
    </div>
  )
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-zinc-200 bg-white py-12">
      <Search className="h-8 w-8 text-zinc-300" />
      <p className="mt-2 text-sm text-zinc-500">
        No projects matching "<span className="font-medium text-zinc-700">{query}</span>"
      </p>
    </div>
  )
}

export function ProjectGrid({ projects, searchQuery, onCreateClick }: ProjectGridProps) {
  if (projects.length === 0 && !searchQuery) {
    return <EmptyState onCreateClick={onCreateClick} />
  }

  const filtered = searchQuery
    ? projects.filter((p) => {
        const q = searchQuery.toLowerCase()
        return (
          p.name.toLowerCase().includes(q) ||
          (p.description?.toLowerCase().includes(q) ?? false)
        )
      })
    : projects

  if (filtered.length === 0) {
    return <NoResults query={searchQuery} />
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
      <button
        onClick={onCreateClick}
        className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 bg-white p-6 text-zinc-400 transition-colors hover:border-primary-300 hover:text-primary-500"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-100">
          <Plus className="h-5 w-5" />
        </div>
        <span className="text-sm font-medium">New Project</span>
      </button>
    </div>
  )
}
