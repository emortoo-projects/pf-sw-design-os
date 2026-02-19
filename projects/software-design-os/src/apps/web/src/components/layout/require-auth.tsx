import { Navigate, Outlet } from 'react-router'
import { useAuth, useMe } from '@/hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()
  useMe()

  if (isLoading && isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
