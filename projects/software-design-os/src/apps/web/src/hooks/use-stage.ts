import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export function useStage(projectId: string, stageNumber: number) {
  return useQuery({
    queryKey: ['stage', projectId, stageNumber],
    queryFn: () => apiClient.getStage(projectId, stageNumber),
    enabled: !!projectId && stageNumber > 0,
  })
}
