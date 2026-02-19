import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export function useStageMutations(projectId: string) {
  const queryClient = useQueryClient()

  const invalidateProject = () => {
    queryClient.invalidateQueries({ queryKey: ['project', projectId] })
  }

  const invalidateStage = (stageNumber: number) => {
    queryClient.invalidateQueries({ queryKey: ['stage', projectId, stageNumber] })
  }

  const generate = useMutation({
    mutationFn: ({ stageNumber, userInput }: { stageNumber: number; userInput?: string }) =>
      apiClient.generateStage(projectId, stageNumber, userInput),
    onSuccess: (_data, variables) => {
      invalidateProject()
      invalidateStage(variables.stageNumber)
    },
  })

  const save = useMutation({
    mutationFn: ({ stageNumber, data }: { stageNumber: number; data: Record<string, unknown> }) =>
      apiClient.updateStage(projectId, stageNumber, data),
    onSuccess: (_data, variables) => {
      invalidateStage(variables.stageNumber)
    },
  })

  const complete = useMutation({
    mutationFn: ({ stageNumber }: { stageNumber: number }) =>
      apiClient.completeStage(projectId, stageNumber),
    onSuccess: () => {
      invalidateProject()
    },
  })

  const revert = useMutation({
    mutationFn: ({ stageNumber }: { stageNumber: number }) =>
      apiClient.revertStage(projectId, stageNumber),
    onSuccess: () => {
      invalidateProject()
    },
  })

  return { generate, save, complete, revert }
}
