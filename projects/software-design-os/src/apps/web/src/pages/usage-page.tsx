import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { UsageStats, CostAlertConfig } from '@/features/settings'
import type { UsagePeriod, CostAlertConfig as CostAlertConfigType } from '@/features/settings/types'
import { useSaveCostAlerts } from '@/hooks/use-usage'

const DEFAULT_COST_ALERTS: CostAlertConfigType = {
  monthlyBudget: 25,
  warningThreshold: 80,
  emailNotifications: true,
}

export function UsagePage() {
  const [period, setPeriod] = useState<UsagePeriod>('30d')
  const { data: usage, isLoading } = useQuery({
    queryKey: ['usage', period],
    queryFn: () => apiClient.getUsageSummary(period),
    staleTime: 60_000,
  })

  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => apiClient.getMe() })
  const saveCostAlerts = useSaveCostAlerts()

  const costAlerts: CostAlertConfigType =
    (me?.preferences as Record<string, unknown>)?.costAlerts as CostAlertConfigType
    ?? DEFAULT_COST_ALERTS

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Usage & Costs</h1>
        <p className="text-sm text-zinc-500">AI generation usage, spending, and budget alerts</p>
      </div>

      {isLoading || !usage ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      ) : (
        <UsageStats usage={usage} onPeriodChange={setPeriod} />
      )}

      <CostAlertConfig config={costAlerts} onChange={(c) => saveCostAlerts.mutate(c)} />
    </div>
  )
}
