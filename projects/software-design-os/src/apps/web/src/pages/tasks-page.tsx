import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ListChecks, CheckCircle, Clock, Activity, Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAllTasks, type TaskWithProject } from '@/hooks/use-all-tasks'
import { apiClient } from '@/lib/api-client'
import { STATUS_LABELS, STATUS_COLORS, TYPE_COLORS } from '@/features/contracts/types'
import type { ContractStatus } from '@sdos/shared'

type SortField = 'project' | 'title' | 'type' | 'status' | 'priority' | 'updatedAt'
type SortDir = 'asc' | 'desc'

const ALL_STATUSES: ContractStatus[] = ['backlog', 'ready', 'in_progress', 'in_review', 'done']

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function TasksPage() {
  const { tasks, isLoading, projects } = useAllTasks()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<Set<ContractStatus>>(new Set())
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('priority')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [approvingId, setApprovingId] = useState<string | null>(null)

  const allTypes = useMemo(() => [...new Set(tasks.map((t) => t.type))].sort(), [tasks])

  const filtered = useMemo(() => {
    let result = tasks

    if (projectFilter !== 'all') {
      result = result.filter((t) => t.projectId === projectFilter)
    }
    if (statusFilter.size > 0) {
      result = result.filter((t) => statusFilter.has(t.status))
    }
    if (typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((t) => t.title.toLowerCase().includes(q) || t.projectName.toLowerCase().includes(q))
    }

    result.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'project': cmp = a.projectName.localeCompare(b.projectName); break
        case 'title': cmp = a.title.localeCompare(b.title); break
        case 'type': cmp = a.type.localeCompare(b.type); break
        case 'status': cmp = ALL_STATUSES.indexOf(a.status) - ALL_STATUSES.indexOf(b.status); break
        case 'priority': cmp = a.priority - b.priority; break
        case 'updatedAt': cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(); break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [tasks, projectFilter, statusFilter, typeFilter, search, sortField, sortDir])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const toggleStatus = (status: ContractStatus) => {
    setStatusFilter((prev) => {
      const next = new Set(prev)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      return next
    })
  }

  const handleApprove = useCallback(async (task: TaskWithProject) => {
    setApprovingId(task.id)
    try {
      await apiClient.approveContract(task.projectId, task.id)
      queryClient.invalidateQueries({ queryKey: ['contracts', task.projectId] })
    } finally {
      setApprovingId(null)
    }
  }, [queryClient])

  // Summary stats
  const totalTasks = tasks.length
  const inReviewCount = tasks.filter((t) => t.status === 'in_review').length
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length
  const today = new Date().toISOString().split('T')[0]
  const doneToday = tasks.filter((t) => t.status === 'done' && t.completedAt?.startsWith(today)).length

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-zinc-400">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading tasks...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Tasks</h1>
        <p className="text-sm text-zinc-500">Cross-project task management</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard label="Total Tasks" value={totalTasks} icon={ListChecks} color="bg-zinc-50" />
        <SummaryCard label="Awaiting Review" value={inReviewCount} icon={Clock} color="bg-purple-50" />
        <SummaryCard label="In Progress" value={inProgressCount} icon={Activity} color="bg-yellow-50" />
        <SummaryCard label="Done Today" value={doneToday} icon={CheckCircle} color="bg-green-50" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="rounded-md border border-zinc-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="all">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <div className="flex gap-1">
          {ALL_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => toggleStatus(status)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                statusFilter.has(status)
                  ? STATUS_COLORS[status]
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
              }`}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="all">All Types</option>
          {allTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-full bg-zinc-100 p-4">
            <ListChecks className="h-8 w-8 text-zinc-400" />
          </div>
          <h2 className="mb-2 text-lg font-medium text-zinc-900">No Tasks Found</h2>
          <p className="max-w-md text-sm text-zinc-500">
            {tasks.length === 0
              ? 'Generate tasks from your completed project design stages.'
              : 'No tasks match the current filters.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                {([
                  ['project', 'Project'],
                  ['title', 'Task'],
                  ['type', 'Type'],
                  ['status', 'Status'],
                  ['priority', 'Priority'],
                  ['updatedAt', 'Updated'],
                ] as [SortField, string][]).map(([field, label]) => (
                  <th
                    key={field}
                    onClick={() => toggleSort(field)}
                    className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 hover:text-zinc-700"
                  >
                    {label}
                    {sortField === field && (
                      <span className="ml-1">{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>
                    )}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filtered.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onNavigate={navigate}
                  onApprove={handleApprove}
                  isApproving={approvingId === task.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: typeof ListChecks; color: string }) {
  return (
    <div className={`rounded-lg border border-zinc-200 p-4 ${color}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-600">{label}</span>
        <Icon className="h-4 w-4 text-zinc-400" />
      </div>
      <div className="mt-2 text-2xl font-bold text-zinc-900">{value}</div>
    </div>
  )
}

function TaskRow({
  task,
  onNavigate,
  onApprove,
  isApproving,
}: {
  task: TaskWithProject
  onNavigate: (path: string) => void
  onApprove: (task: TaskWithProject) => void
  isApproving: boolean
}) {
  const typeClass = TYPE_COLORS[task.type] ?? 'bg-zinc-100 text-zinc-700 border-zinc-200'
  const statusClass = STATUS_COLORS[task.status] ?? 'bg-zinc-100 text-zinc-600'

  return (
    <tr
      className="cursor-pointer hover:bg-zinc-50"
      onClick={() => onNavigate(`/projects/${task.projectId}/contracts`)}
    >
      <td className="px-4 py-3 text-zinc-600">{task.projectName}</td>
      <td className="px-4 py-3 font-medium text-zinc-900">{task.title}</td>
      <td className="px-4 py-3">
        <span className={`inline-block rounded-full border px-2 py-0.5 text-xs ${typeClass}`}>{task.type}</span>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${statusClass}`}>{STATUS_LABELS[task.status]}</span>
      </td>
      <td className="px-4 py-3 text-zinc-500">{task.priority}</td>
      <td className="px-4 py-3 text-zinc-500">{relativeTime(task.updatedAt)}</td>
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        {task.status === 'in_review' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onApprove(task)}
            disabled={isApproving}
          >
            Approve
          </Button>
        )}
      </td>
    </tr>
  )
}
