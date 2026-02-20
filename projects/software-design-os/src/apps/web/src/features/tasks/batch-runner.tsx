import { useState } from 'react'
import { Play, Copy, Check, Clock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAutomationConfig, useLatestBatchRun, useAutomationMutations, useBatchRun } from '@/hooks/use-automation'
import { EmergencyStopButton } from './emergency-stop-button'

interface BatchRunnerProps {
  projectId: string
}

export function BatchRunner({ projectId }: BatchRunnerProps) {
  const { data: config } = useAutomationConfig(projectId)
  const { data: latestBatch } = useLatestBatchRun(projectId)
  const { startBatch, generatePrompt } = useAutomationMutations(projectId)
  const [promptCopied, setPromptCopied] = useState(false)
  const [showDialog, setShowDialog] = useState(false)

  const activeBatchId = latestBatch?.status === 'running' ? latestBatch.id : null
  const { data: activeBatch } = useBatchRun(projectId, activeBatchId)

  const handleCopyPrompt = async () => {
    const result = await generatePrompt.mutateAsync()
    await navigator.clipboard.writeText(result.prompt)
    setPromptCopied(true)
    setTimeout(() => setPromptCopied(false), 2000)
  }

  const handleStart = () => {
    startBatch.mutate()
    setShowDialog(false)
  }

  const formatElapsed = (startedAt: string | null) => {
    if (!startedAt) return '0s'
    const elapsed = Date.now() - new Date(startedAt).getTime()
    const mins = Math.floor(elapsed / 60000)
    const secs = Math.floor((elapsed % 60000) / 1000)
    if (mins > 0) return `${mins}m ${secs}s`
    return `${secs}s`
  }

  // Active batch display
  if (activeBatch) {
    const total = activeBatch.tasksAttempted || 1
    const completed = activeBatch.tasksCompleted
    const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Batch Run Active</CardTitle>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Clock className="h-3 w-3" />
                {formatElapsed(activeBatch.startedAt)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Progress bar */}
            <div>
              <div className="mb-1 flex justify-between text-xs text-zinc-500">
                <span>{completed} / {activeBatch.tasksAttempted} tasks</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="rounded-md bg-zinc-50 p-2">
                <div className="text-lg font-semibold text-zinc-900">{activeBatch.tasksAttempted}</div>
                <div className="text-xs text-zinc-500">Attempted</div>
              </div>
              <div className="rounded-md bg-green-50 p-2">
                <div className="text-lg font-semibold text-green-700">{activeBatch.tasksCompleted}</div>
                <div className="text-xs text-zinc-500">Completed</div>
              </div>
              <div className="rounded-md bg-red-50 p-2">
                <div className="text-lg font-semibold text-red-700">{activeBatch.tasksFailed}</div>
                <div className="text-xs text-zinc-500">Failed</div>
              </div>
              <div className="rounded-md bg-purple-50 p-2">
                <div className="text-lg font-semibold text-purple-700">{activeBatch.tasksParkedForReview}</div>
                <div className="text-xs text-zinc-500">Review</div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              Running...
            </div>
          </CardContent>
        </Card>

        <EmergencyStopButton projectId={projectId} batchId={activeBatch.id} />
      </div>
    )
  }

  // Start dialog
  if (showDialog) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Start Overnight Run</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-zinc-600">
            <p>This will create a batch run with your current settings:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Trust level: <strong>{config?.trustLevel ?? 'manual'}</strong></li>
              <li>Max tasks: <strong>{config?.batchLimits?.maxTasks ?? 10}</strong></li>
              <li>Max failures: <strong>{config?.batchLimits?.maxConsecutiveFailures ?? 3}</strong></li>
            </ul>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyPrompt} disabled={generatePrompt.isPending}>
              {promptCopied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
              {promptCopied ? 'Copied!' : 'Copy Workflow Prompt'}
            </Button>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={handleStart} disabled={startBatch.isPending}>
              <Play className="mr-1 h-4 w-4" />
              Start
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default: show start button
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="mb-4 rounded-full bg-zinc-100 p-4">
        <Play className="h-8 w-8 text-zinc-400" />
      </div>
      <h3 className="mb-2 text-sm font-medium text-zinc-900">No Active Batch Run</h3>
      <p className="mb-4 max-w-sm text-xs text-zinc-500">
        Start an overnight run to let Claude Code execute contracts autonomously with your configured guardrails.
      </p>
      <Button onClick={() => setShowDialog(true)}>
        <Play className="mr-2 h-4 w-4" />
        Start Overnight Run
      </Button>
    </div>
  )
}
