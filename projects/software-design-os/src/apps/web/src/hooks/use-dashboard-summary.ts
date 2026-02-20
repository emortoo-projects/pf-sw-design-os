import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => apiClient.getDashboardSummary(),
    staleTime: 60_000,
  })
}
