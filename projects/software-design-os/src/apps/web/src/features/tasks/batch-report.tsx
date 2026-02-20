import { Clock, CheckCircle, XCircle, AlertTriangle, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useLatestBatchRun, useAutomationMutations } from '@/hooks/use-automation'
import { useContracts, useContractMutations } from '@/hooks/use-contracts'
import type { PromptContract } from '@sdos/shared'

interface BatchReportProps {
  projectId: string
}

export function BatchReport({ projectId }: BatchReportProps) {
  const { data: latestBatch } = useLatestBatchRun(projectId)
  const { data: contracts = [] } = useContracts(projectId)
  const { batchApprove } = useAutomationMutations(projectId)
  const { approve, requestChanges } = useContractMutations(projectId)

  if (!latestBatch || latestBatch.status === 'running') {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-zinc-400">
        No completed batch runs yet
      </div>
    )
  }

  const duration = latestBatch.startedAt && latestBatch.completedAt
    ? Math.round((new Date(latestBatch.completedAt).getTime() - new Date(latestBatch.startedAt).getTime()) / 60000)
    : 0

  const inReviewContracts = contracts.filter((c) => c.status === 'in_review')
  const passedContracts = inReviewContracts.filter((c) => {
    const report = c.qualityReport as Record<string, unknown> | null
    return report?.passed === true
  })
  const failedContracts = inReviewContracts.filter((c) => {
    const report = c.qualityReport as Record<string, unknown> | null
    return report && report.passed !== true
  })

  const handleApprove = (contractId: string) => {
    approve.mutate(contractId)
  }

  const handleRequestChanges = (contractId: string) => {
    requestChanges.mutate({ contractId, feedback: 'Needs revision after batch review' })
  }

  const handleBulkApprove = () => {
    batchApprove.mutate()
  }

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">
              Batch Run — {latestBatch.status === 'completed' ? 'Completed' : latestBatch.status === 'stopped' ? 'Stopped' : 'Failed'}
            </CardTitle>
            <span className={`rounded-full px-2 py-0.5 text-xs ${
              latestBatch.status === 'completed' ? 'bg-green-100 text-green-700'
                : latestBatch.status === 'stopped' ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
            }`}>
              {latestBatch.status}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3 text-center">
            <div className="rounded-md bg-zinc-50 p-2">
              <div className="text-lg font-semibold">{latestBatch.tasksAttempted}</div>
              <div className="text-xs text-zinc-500">Attempted</div>
            </div>
            <div className="rounded-md bg-green-50 p-2">
              <div className="text-lg font-semibold text-green-700">{latestBatch.tasksCompleted}</div>
              <div className="text-xs text-zinc-500">Completed</div>
            </div>
            <div className="rounded-md bg-red-50 p-2">
              <div className="text-lg font-semibold text-red-700">{latestBatch.tasksFailed}</div>
              <div className="text-xs text-zinc-500">Failed</div>
            </div>
            <div className="rounded-md bg-purple-50 p-2">
              <div className="text-lg font-semibold text-purple-700">{latestBatch.tasksParkedForReview}</div>
              <div className="text-xs text-zinc-500">Review</div>
            </div>
            <div className="rounded-md bg-zinc-50 p-2">
              <div className="flex items-center justify-center gap-1 text-lg font-semibold">
                <Clock className="h-4 w-4 text-zinc-400" />
                {duration}m
              </div>
              <div className="text-xs text-zinc-500">Duration</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk approve */}
      {passedContracts.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCheck className="h-4 w-4" />
            {passedContracts.length} contract{passedContracts.length !== 1 ? 's' : ''} passed quality gates
          </div>
          <Button size="sm" onClick={handleBulkApprove} disabled={batchApprove.isPending}>
            Approve All Passed
          </Button>
        </div>
      )}

      {/* Tasks needing review */}
      {inReviewContracts.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-zinc-700">Tasks Needing Review</h4>
          <div className="space-y-2">
            {inReviewContracts.map((contract) => (
              <ReviewCard
                key={contract.id}
                contract={contract}
                onApprove={handleApprove}
                onRequestChanges={handleRequestChanges}
              />
            ))}
          </div>
        </div>
      )}

      {/* Failed tasks */}
      {failedContracts.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-zinc-700">Failed Tasks</h4>
          <div className="space-y-2">
            {failedContracts.map((contract) => (
              <Card key={contract.id} className="border-red-200">
                <CardContent className="flex items-center justify-between p-3">
                  <div>
                    <div className="text-sm font-medium text-zinc-900">{contract.title}</div>
                    {contract.reviewSummary && (
                      <div className="mt-1 text-xs text-red-600">{contract.reviewSummary}</div>
                    )}
                  </div>
                  <XCircle className="h-4 w-4 text-red-400" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ReviewCard({
  contract,
  onApprove,
  onRequestChanges,
}: {
  contract: PromptContract
  onApprove: (id: string) => void
  onRequestChanges: (id: string) => void
}) {
  const report = contract.qualityReport as Record<string, unknown> | null
  const passed = report?.passed === true

  return (
    <Card className={passed ? 'border-green-200' : 'border-yellow-200'}>
      <CardContent className="flex items-center justify-between p-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-900">{contract.title}</span>
            {passed ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-1.5 py-0.5 text-xs text-green-700">
                <CheckCircle className="h-3 w-3" /> Passed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-700">
                <AlertTriangle className="h-3 w-3" /> Review
              </span>
            )}
          </div>
          {contract.reviewSummary && (
            <div className="mt-1 text-xs text-zinc-500">{contract.reviewSummary}</div>
          )}
        </div>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={() => onApprove(contract.id)}>Approve</Button>
          <Button variant="outline" size="sm" onClick={() => onRequestChanges(contract.id)}>Reject</Button>
        </div>
      </CardContent>
    </Card>
  )
}
