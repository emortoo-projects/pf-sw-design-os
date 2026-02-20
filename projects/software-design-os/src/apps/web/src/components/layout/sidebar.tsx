import { useState } from 'react'
import { Home, FolderOpen, ListChecks, LayoutTemplate, BarChart3, Settings, PanelLeftClose, PanelLeft, LogOut } from 'lucide-react'
import { SidebarNavItem } from './sidebar-nav-item'
import { cn } from '@/lib/utils'
import { useAuth, useLogout } from '@/hooks/use-auth'

const navItems = [
  { label: 'Dashboard', icon: Home, to: '/' },
  { label: 'Projects', icon: FolderOpen, to: '/projects' },
  { label: 'Tasks', icon: ListChecks, to: '/tasks' },
  { label: 'Templates', icon: LayoutTemplate, to: '/templates' },
  { label: 'Usage', icon: BarChart3, to: '/usage' },
  { label: 'Settings', icon: Settings, to: '/settings' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuth()
  const logout = useLogout()

  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? '?'

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

      {/* User section */}
      <div className="border-t border-zinc-800 p-2">
        {user && (
          <div className={cn('flex items-center gap-2 rounded-md px-2 py-1.5', collapsed && 'justify-center')}>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="h-7 w-7 rounded-full" />
            ) : (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-medium text-white">
                {initials}
              </div>
            )}
            {!collapsed && (
              <div className="flex flex-1 items-center justify-between">
                <span className="truncate text-sm text-zinc-300">{user.name}</span>
                <button
                  onClick={logout}
                  className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
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
