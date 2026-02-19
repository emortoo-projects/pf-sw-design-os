import { Outlet } from 'react-router'
import { Sidebar } from './sidebar'

export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-zinc-50 p-6">
        <Outlet />
      </main>
    </div>
  )
}
