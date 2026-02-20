import { useState } from 'react'
import { OctagonX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAutomationMutations } from '@/hooks/use-automation'

interface EmergencyStopButtonProps {
  projectId: string
  batchId: string
}

export function EmergencyStopButton({ projectId, batchId }: EmergencyStopButtonProps) {
  const { stopBatch } = useAutomationMutations(projectId)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleStop = () => {
    stopBatch.mutate(batchId)
    setShowConfirm(false)
  }

  if (showConfirm) {
    return (
      <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
        <div className="mb-3 text-sm font-medium text-red-800">
          Are you sure you want to stop the batch run?
        </div>
        <div className="mb-3 text-xs text-red-600">
          This will immediately stop processing new tasks. Tasks already in progress will be left in their current state.
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirm(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleStop}
            disabled={stopBatch.isPending}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            <OctagonX className="mr-1 h-4 w-4" />
            {stopBatch.isPending ? 'Stopping...' : 'Stop Now'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button
      onClick={() => setShowConfirm(true)}
      className="w-full bg-red-600 text-white hover:bg-red-700"
    >
      <OctagonX className="mr-2 h-4 w-4" />
      Emergency Stop
    </Button>
  )
}
