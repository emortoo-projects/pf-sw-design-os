import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { AutomationConfig } from '@sdos/shared'

export function useAutomationConfig(projectId: string) {
  return useQuery({
    queryKey: ['automation-config', projectId],
    queryFn: () => apiClient.getAutomationConfig(projectId),
    enabled: !!projectId,
  })
}

export function useLatestBatchRun(projectId: string) {
  return useQuery({
    queryKey: ['batch-run-latest', projectId],
    queryFn: () => apiClient.getLatestBatchRun(projectId),
    enabled: !!projectId,
  })
}

export function useBatchRun(projectId: string, batchId: string | null) {
  return useQuery({
    queryKey: ['batch-run', projectId, batchId],
    queryFn: () => apiClient.getBatchRun(projectId, batchId!),
    enabled: !!projectId && !!batchId,
    refetchInterval: (query) => {
      const data = query.state.data
      return data?.status === 'running' ? 3000 : false
    },
  })
}

export function useAutomationMutations(projectId: string) {
  const queryClient = useQueryClient()

  const invalidateConfig = () => {
    queryClient.invalidateQueries({ queryKey: ['automation-config', projectId] })
  }

  const invalidateBatch = () => {
    queryClient.invalidateQueries({ queryKey: ['batch-run-latest', projectId] })
    queryClient.invalidateQueries({ queryKey: ['batch-run', projectId] })
  }

  const saveConfig = useMutation({
    mutationFn: (config: AutomationConfig) => apiClient.saveAutomationConfig(projectId, config),
    onSuccess: () => invalidateConfig(),
  })

  const startBatch = useMutation({
    mutationFn: () => apiClient.startBatchRun(projectId),
    onSuccess: () => invalidateBatch(),
  })

  const stopBatch = useMutation({
    mutationFn: (batchId: string) => apiClient.stopBatchRun(projectId, batchId),
    onSuccess: () => invalidateBatch(),
  })

  const batchApprove = useMutation({
    mutationFn: () => apiClient.batchApprove(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts', projectId] })
      invalidateBatch()
    },
  })

  const generatePrompt = useMutation({
    mutationFn: () => apiClient.generateWorkflowPrompt(projectId),
  })

  return { saveConfig, startBatch, stopBatch, batchApprove, generatePrompt }
}
