import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, type CreateMCPTokenInput } from '@/lib/api-client'

export function useMCPTokens() {
  return useQuery({
    queryKey: ['mcp-tokens'],
    queryFn: () => apiClient.listMCPTokens(),
  })
}

export function useCreateMCPToken() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, ...input }: CreateMCPTokenInput & { projectId: string }) =>
      apiClient.createMCPToken(projectId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-tokens'] })
    },
  })
}

export function useDeleteMCPToken() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, tokenId }: { projectId: string; tokenId: string }) =>
      apiClient.deleteMCPToken(projectId, tokenId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-tokens'] })
    },
  })
}
