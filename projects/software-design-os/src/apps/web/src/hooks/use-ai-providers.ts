import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, type CreateAIProviderInput, type UpdateAIProviderInput } from '@/lib/api-client'

export function useAIProviders() {
  return useQuery({
    queryKey: ['ai-providers'],
    queryFn: () => apiClient.listAIProviders(),
  })
}

export function useCreateAIProvider() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateAIProviderInput) => apiClient.createAIProvider(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-providers'] })
    },
  })
}

export function useUpdateAIProvider() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...input }: UpdateAIProviderInput & { id: string }) =>
      apiClient.updateAIProvider(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-providers'] })
    },
  })
}

export function useDeleteAIProvider() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteAIProvider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-providers'] })
    },
  })
}

export function useTestAIProvider() {
  return useMutation({
    mutationFn: (id: string) => apiClient.testAIProvider(id),
  })
}
