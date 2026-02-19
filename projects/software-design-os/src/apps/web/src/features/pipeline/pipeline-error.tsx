import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PipelineErrorProps {
  error: Error | null
}

export function PipelineError({ error }: PipelineErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error-50">
        <AlertTriangle className="h-6 w-6 text-error-500" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-zinc-900">Failed to load project</h2>
        <p className="mt-1 text-sm text-zinc-500">
          {error?.message ?? 'An unexpected error occurred.'}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
        Retry
      </Button>
    </div>
  )
}
