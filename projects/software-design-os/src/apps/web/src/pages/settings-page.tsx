import { useState } from 'react'
import {
  SettingsTabs,
  ProfileSettings,
  AIProviderManager,
  MCPTokenManager,
  UsageStats,
  CostAlertConfig,
  createMockUserProfile,
  createMockProviders,
  createMockTokens,
  createMockUsageSummary,
  createMockCostAlertConfig,
  type SettingsTab,
  type UserProfile,
  type AIProviderConfig,
  type MCPToken,
  type CostAlertConfigType,
} from '@/features/settings'

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [profile, setProfile] = useState<UserProfile>(createMockUserProfile)
  const [providers, setProviders] = useState<AIProviderConfig[]>(createMockProviders)
  const [tokens, setTokens] = useState<MCPToken[]>(createMockTokens)
  const [usage] = useState(createMockUsageSummary)
  const [costAlerts, setCostAlerts] = useState<CostAlertConfigType>(createMockCostAlertConfig)

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
          <AIProviderManager providers={providers} onChange={setProviders} />
        )}

        {activeTab === 'mcp' && (
          <MCPTokenManager tokens={tokens} onChange={setTokens} />
        )}

        {activeTab === 'usage' && (
          <div className="space-y-6">
            <UsageStats usage={usage} onPeriodChange={() => { /* Mock — would re-fetch data */ }} />
            <CostAlertConfig config={costAlerts} onChange={setCostAlerts} />
          </div>
        )}
      </div>
    </div>
  )
}
