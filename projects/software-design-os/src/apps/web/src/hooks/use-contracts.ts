import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { ContractStatus } from '@sdos/shared'

export function useContracts(projectId: string) {
  return useQuery({
    queryKey: ['contracts', projectId],
    queryFn: () => apiClient.listContracts(projectId),
    enabled: !!projectId,
  })
}

export function useContract(projectId: string, contractId: string) {
  return useQuery({
    queryKey: ['contracts', projectId, contractId],
    queryFn: () => apiClient.getContract(projectId, contractId),
    enabled: !!projectId && !!contractId,
  })
}

export function useContractEvents(projectId: string, contractId: string | null) {
  return useQuery({
    queryKey: ['contract-events', projectId, contractId],
    queryFn: () => apiClient.listContractEvents(projectId, contractId!),
    enabled: !!projectId && !!contractId,
  })
}

export function useContractMutations(projectId: string) {
  const queryClient = useQueryClient()

  const invalidateContracts = () => {
    queryClient.invalidateQueries({ queryKey: ['contracts', projectId] })
  }

  const invalidateAll = (contractId: string) => {
    invalidateContracts()
    queryClient.invalidateQueries({ queryKey: ['contract-events', projectId, contractId] })
  }

  const generate = useMutation({
    mutationFn: () => apiClient.generateContracts(projectId),
    onSuccess: () => invalidateContracts(),
  })

  const markDone = useMutation({
    mutationFn: (contractId: string) => apiClient.markContractDone(projectId, contractId),
    onSuccess: () => invalidateContracts(),
  })

  const updateStatus = useMutation({
    mutationFn: ({ contractId, status }: { contractId: string; status: ContractStatus }) =>
      apiClient.updateContract(projectId, contractId, { status }),
    onSuccess: () => invalidateContracts(),
  })

  const generateClaudeMd = useMutation({
    mutationFn: () => apiClient.generateClaudeMd(projectId),
  })

  const approve = useMutation({
    mutationFn: (contractId: string) => apiClient.approveContract(projectId, contractId),
    onSuccess: (_, contractId) => invalidateAll(contractId),
  })

  const requestChanges = useMutation({
    mutationFn: ({ contractId, feedback }: { contractId: string; feedback: string }) =>
      apiClient.requestChanges(projectId, contractId, feedback),
    onSuccess: (_, { contractId }) => invalidateAll(contractId),
  })

  return { generate, markDone, updateStatus, generateClaudeMd, approve, requestChanges }
}
