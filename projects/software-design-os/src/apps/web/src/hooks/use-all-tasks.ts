import { useQueries } from '@tanstack/react-query'
import { useProjects } from '@/hooks/use-projects'
import { apiClient } from '@/lib/api-client'
import type { PromptContract } from '@sdos/shared'

export interface TaskWithProject extends PromptContract {
  projectName: string
}

export function useAllTasks() {
  const { data: projects = [], isLoading: projectsLoading } = useProjects()

  const contractQueries = useQueries({
    queries: projects.map((project) => ({
      queryKey: ['contracts', project.id],
      queryFn: () => apiClient.listContracts(project.id),
      enabled: !!project.id,
    })),
  })

  const isLoading = projectsLoading || contractQueries.some((q) => q.isLoading)

  const tasks: TaskWithProject[] = projects.flatMap((project, i) => {
    const contracts = contractQueries[i]?.data ?? []
    return contracts.map((c) => ({ ...c, projectName: project.name }))
  })

  return { tasks, isLoading, projects }
}
