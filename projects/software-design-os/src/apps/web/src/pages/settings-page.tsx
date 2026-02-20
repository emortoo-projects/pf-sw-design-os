import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useProjects } from '@/hooks/use-projects'
import { AutomationSettings } from '@/features/tasks/automation-settings'
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
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')

  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => apiClient.getMe() })
  void me // consumed by profile tab indirectly

  const { data: projects = [] } = useProjects()

  // Auto-select first project if none selected
  const effectiveProjectId = selectedProjectId || projects[0]?.id || ''

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

        {activeTab === 'automation' && (
          <div className="mx-auto max-w-2xl space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Project</label>
              <select
                value={effectiveProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {projects.length === 0 && <option value="">No projects</option>}
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            {effectiveProjectId && <AutomationSettings projectId={effectiveProjectId} />}
          </div>
        )}

        {activeTab === 'data' && <DataManagement />}
      </div>
    </div>
  )
}
