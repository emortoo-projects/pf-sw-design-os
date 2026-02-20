import { Navigate } from 'react-router'
import { Loader2 } from 'lucide-react'
import { useSetupStatus } from '@/hooks/use-setup'
import { SetupWizard } from '@/features/setup'

export function SetupPage() {
  const { data, isLoading } = useSetupStatus()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (data && !data.needsSetup) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-lg">
        <SetupWizard />
      </div>
    </div>
  )
}
