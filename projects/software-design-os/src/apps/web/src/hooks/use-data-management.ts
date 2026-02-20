import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export function useExportData() {
  return useMutation({
    mutationFn: (format: 'json' | 'sql') => apiClient.exportData(format),
  })
}

export function useImportData() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => apiClient.importData(data),
    onSuccess: () => { queryClient.clear() },
  })
}

export function useImportSdp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => apiClient.importSdp(file),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }) },
  })
}

export function useDbStatus() {
  return useQuery({
    queryKey: ['db-status'],
    queryFn: () => apiClient.getDbStatus(),
    staleTime: 30_000,
  })
}

export function useResetDatabase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (confirm: string) => apiClient.resetDatabase(confirm),
    onSuccess: () => { queryClient.clear() },
  })
}
