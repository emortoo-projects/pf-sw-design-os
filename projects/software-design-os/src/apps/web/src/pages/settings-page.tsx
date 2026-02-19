import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import {
  SettingsTabs,
  ProfileSettings,
  AIProviderManager,
  MCPTokenManager,
  UsageStats,
  CostAlertConfig,
  createMockUserProfile,
  type SettingsTab,
  type UserProfile,
  type CostAlertConfigType,
  type UsagePeriod,
} from '@/features/settings'
import { useUsageSummary, useSaveCostAlerts } from '@/hooks/use-usage'

const DEFAULT_COST_ALERTS: CostAlertConfigType = {
  monthlyBudget: 25,
  warningThreshold: 80,
  emailNotifications: true,
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [profile, setProfile] = useState<UserProfile>(createMockUserProfile)
  const [period, setPeriod] = useState<UsagePeriod>('30d')

  const { data: usage, isLoading: usageLoading } = useUsageSummary(period)
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => apiClient.getMe() })
  const saveCostAlerts = useSaveCostAlerts()

  const costAlerts: CostAlertConfigType =
    (me?.preferences as Record<string, unknown>)?.costAlerts as CostAlertConfigType
    ?? DEFAULT_COST_ALERTS

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Settings</h1>
        <p className="text-sm text-zinc-500">Manage your account and preferences</p>
      </div>

      <SettingsTabs activeTab={activeTab} onSelect={setActiveTab} />

      <div className="pt-2">
        {activeTab === 'profile' && (
          <ProfileSettings profile={profile} onChange={setProfile} />
        )}

        {activeTab === 'providers' && (
          <AIProviderManager />
        )}

        {activeTab === 'mcp' && (
          <MCPTokenManager />
        )}

        {activeTab === 'usage' && (
          <div className="space-y-6">
            {usageLoading || !usage ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
              </div>
            ) : (
              <UsageStats usage={usage} onPeriodChange={setPeriod} />
            )}
            <CostAlertConfig config={costAlerts} onChange={(c) => saveCostAlerts.mutate(c)} />
          </div>
        )}
      </div>
    </div>
  )
}
