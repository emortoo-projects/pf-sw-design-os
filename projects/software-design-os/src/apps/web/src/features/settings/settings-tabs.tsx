import { User, Bot, Key, Zap, Database } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SettingsTab = 'profile' | 'providers' | 'mcp' | 'automation' | 'data'

interface SettingsTabsProps {
  activeTab: SettingsTab
  onSelect: (tab: SettingsTab) => void
}

const TABS: Array<{ id: SettingsTab; label: string; icon: typeof User }> = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'providers', label: 'AI Providers', icon: Bot },
  { id: 'mcp', label: 'MCP Access', icon: Key },
  { id: 'automation', label: 'Automation', icon: Zap },
  { id: 'data', label: 'Data', icon: Database },
]

export function SettingsTabs({ activeTab, onSelect }: SettingsTabsProps) {
  return (
    <div className="flex gap-1 border-b border-zinc-200">
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={cn(
              'flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700',
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
