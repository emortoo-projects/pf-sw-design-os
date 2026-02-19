import { Link } from 'react-router'
import { FolderOpen, Plus } from 'lucide-react'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500">Welcome to Software Design OS</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/projects/mock-project-1"
          className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:border-primary-300 hover:bg-primary-50/50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-100 text-primary-600">
            <FolderOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-zinc-900">My Software Project</p>
            <p className="text-xs text-zinc-500">Stage 2 of 9 — Data Model</p>
          </div>
        </Link>

        <button className="flex items-center gap-4 rounded-lg border-2 border-dashed border-zinc-300 p-4 text-zinc-400 transition-colors hover:border-primary-300 hover:text-primary-500">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-100">
            <Plus className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium">New Project</span>
        </button>
      </div>
    </div>
  )
}
