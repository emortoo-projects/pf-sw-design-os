import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import {
  SettingsTabs,
  ProfileSettings,
  AIProviderManager,
  MCPTokenManager,
  DataManagement,
  createMockUserProfile,
  type SettingsTab,
  type UserProfile,
} from '@/features/settings'

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [profile, setProfile] = useState<UserProfile>(createMockUserProfile)

  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => apiClient.getMe() })
  void me // consumed by profile tab indirectly

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

        {activeTab === 'data' && <DataManagement />}
      </div>
    </div>
  )
}
