import { useState } from 'react'
import { Home, FolderOpen, LayoutTemplate, BarChart3, Settings, PanelLeftClose, PanelLeft } from 'lucide-react'
import { SidebarNavItem } from './sidebar-nav-item'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', icon: Home, to: '/' },
  { label: 'Projects', icon: FolderOpen, to: '/projects' },
  { label: 'Templates', icon: LayoutTemplate, to: '/templates' },
  { label: 'Usage', icon: BarChart3, to: '/usage' },
  { label: 'Settings', icon: Settings, to: '/settings' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'flex flex-col bg-zinc-900 text-zinc-200 transition-all duration-200',
        collapsed ? 'w-16' : 'w-[260px]',
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-zinc-800 px-4">
        {!collapsed && <span className="text-sm font-semibold text-white">Software Design OS</span>}
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <div className="border-t border-zinc-800 p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-md p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  )
}
