import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { UsagePeriod, CostAlertConfig } from '@/features/settings/types'

export function useUsageSummary(period: UsagePeriod) {
  return useQuery({
    queryKey: ['usage', period],
    queryFn: () => apiClient.getUsageSummary(period),
  })
}

export function useSaveCostAlerts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (config: CostAlertConfig) => {
      const me = await apiClient.getMe()
      return apiClient.updateMe({
        preferences: {
          ...(me.preferences as Record<string, unknown>),
          costAlerts: config,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}
