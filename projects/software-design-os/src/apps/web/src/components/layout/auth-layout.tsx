import { Outlet } from 'react-router'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <Outlet />
    </div>
  )
}
