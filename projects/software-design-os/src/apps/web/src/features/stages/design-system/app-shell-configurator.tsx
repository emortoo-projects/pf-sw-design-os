import { PanelLeft, PanelTop, Columns3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AppShellConfig } from './types'

interface AppShellConfiguratorProps {
  shell: AppShellConfig
  onChange: (shell: AppShellConfig) => void
}

const LAYOUT_OPTIONS = [
  { id: 'sidebar', label: 'Sidebar', description: 'Fixed sidebar with scrollable main content', icon: PanelLeft },
  { id: 'topbar', label: 'Top Bar', description: 'Horizontal navigation bar on top', icon: PanelTop },
  { id: 'hybrid', label: 'Hybrid', description: 'Top bar + collapsible sidebar', icon: Columns3 },
] as const

export function AppShellConfigurator({ shell, onChange }: AppShellConfiguratorProps) {
  function update(partial: Partial<AppShellConfig>) {
    onChange({ ...shell, ...partial })
  }

  function updateSidebar(partial: Partial<AppShellConfig['sidebar']>) {
    onChange({ ...shell, sidebar: { ...shell.sidebar, ...partial } })
  }

  function updateMainContent(partial: Partial<AppShellConfig['mainContent']>) {
    onChange({ ...shell, mainContent: { ...shell.mainContent, ...partial } })
  }

  return (
    <div className="space-y-4">
      <label className="text-sm font-semibold text-zinc-900">Application Shell</label>

      {/* Layout selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-600">Layout</label>
        <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Shell layout">
          {LAYOUT_OPTIONS.map(({ id, label, description, icon: Icon }) => {
            const isSelected = shell.layout === id
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => update({ layout: id })}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-3 text-left transition-all',
                  isSelected
                    ? 'border-primary-400 bg-primary-50 ring-1 ring-primary-200'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50',
                )}
              >
                <div className={cn(
                  'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                  isSelected ? 'bg-primary-100 text-primary-600' : 'bg-zinc-100 text-zinc-500',
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className={cn('text-sm font-semibold', isSelected ? 'text-primary-900' : 'text-zinc-900')}>{label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Sidebar config */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs text-zinc-600">Sidebar Width</label>
          <input
            type="text"
            value={shell.sidebar.width}
            onChange={(e) => updateSidebar({ width: e.target.value })}
            className="w-full rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-700"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-600">Collapsed Width</label>
          <input
            type="text"
            value={shell.sidebar.collapsedWidth}
            onChange={(e) => updateSidebar({ collapsedWidth: e.target.value })}
            className="w-full rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-700"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-600">Position</label>
          <select
            value={shell.sidebar.position}
            onChange={(e) => updateSidebar({ position: e.target.value as 'left' | 'right' })}
            className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700"
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-xs text-zinc-600">
            <input
              type="checkbox"
              checked={shell.sidebar.collapsible}
              onChange={(e) => updateSidebar({ collapsible: e.target.checked })}
              className="rounded border-zinc-300"
            />
            Collapsible
          </label>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-600">Background</label>
          <input
            type="text"
            value={shell.sidebar.background}
            onChange={(e) => updateSidebar({ background: e.target.value })}
            className="w-full rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-700"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-600">Text Color</label>
          <input
            type="text"
            value={shell.sidebar.textColor}
            onChange={(e) => updateSidebar({ textColor: e.target.value })}
            className="w-full rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-700"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-600">Main Content Padding</label>
          <input
            type="text"
            value={shell.mainContent.padding}
            onChange={(e) => updateMainContent({ padding: e.target.value })}
            className="w-full rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-700"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-600">Max Width</label>
          <input
            type="text"
            value={shell.mainContent.maxWidth}
            onChange={(e) => updateMainContent({ maxWidth: e.target.value })}
            className="w-full rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-700"
          />
        </div>
      </div>

      {/* Shell preview */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-600">Preview</label>
        <div className="flex h-32 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
          {(shell.layout === 'sidebar' || shell.layout === 'hybrid') && (
            <div
              className={cn(
                'flex flex-col gap-1.5 p-2',
                shell.sidebar.position === 'right' ? 'order-2' : 'order-1',
              )}
              style={{
                width: '60px',
                backgroundColor: '#18181b',
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-2 rounded-sm bg-zinc-700" />
              ))}
            </div>
          )}
          <div className={cn(
            'flex flex-1 flex-col',
            shell.sidebar.position === 'right' ? 'order-1' : 'order-2',
          )}>
            {(shell.layout === 'topbar' || shell.layout === 'hybrid') && (
              <div className="flex h-6 items-center gap-2 border-b border-zinc-200 bg-white px-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-1.5 w-6 rounded-sm bg-zinc-300" />
                ))}
              </div>
            )}
            <div className="flex-1 p-2" style={{ backgroundColor: '#fafafa' }}>
              <div className="h-3 w-3/4 rounded-sm bg-zinc-200" />
              <div className="mt-1.5 h-2 w-1/2 rounded-sm bg-zinc-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
