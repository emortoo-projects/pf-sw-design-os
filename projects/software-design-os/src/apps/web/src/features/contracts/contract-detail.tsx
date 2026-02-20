import { useState } from 'react'
import { X, Copy, Check, Play, Send, RotateCcw, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useContractEvents } from '@/hooks/use-contracts'
import type { PromptContract, ContractStatus, ContractEvent } from './types'
import { TYPE_COLORS, STATUS_COLORS, STATUS_LABELS } from './types'

interface ContractDetailProps {
  contract: PromptContract
  projectId: string
  onClose: () => void
  onStatusChange: (status: ContractStatus) => void
  onApprove: () => void
  onRequestChanges: (feedback: string) => void
}

const EVENT_ICONS: Record<string, typeof Play> = {
  started: Play,
  submitted: Send,
  approved: Check,
  changes_requested: RotateCcw,
  rejected: X,
  comment: MessageSquare,
}

const EVENT_LABELS: Record<string, string> = {
  started: 'Started',
  submitted: 'Submitted for review',
  approved: 'Approved',
  changes_requested: 'Changes requested',
  rejected: 'Rejected',
  comment: 'Comment',
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return 'just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDays = Math.floor(diffHr / 24)
  return `${diffDays}d ago`
}

export function ContractDetail({ contract, projectId, onClose, onStatusChange, onApprove, onRequestChanges }: ContractDetailProps) {
  const [copied, setCopied] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [showFeedbackInput, setShowFeedbackInput] = useState(false)

  const { data: events = [] } = useContractEvents(projectId, contract.id)

  const handleCopyPrompt = async () => {
    if (!contract.generatedPrompt) return
    await navigator.clipboard.writeText(contract.generatedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) return
    onRequestChanges(feedbackText.trim())
    setFeedbackText('')
    setShowFeedbackInput(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-50 flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-zinc-200 bg-white p-4">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase',
                  TYPE_COLORS[contract.type] ?? 'bg-zinc-100 text-zinc-600',
                )}
              >
                {contract.type}
              </span>
              <span
                className={cn(
                  'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                  STATUS_COLORS[contract.status],
                )}
              >
                {STATUS_LABELS[contract.status]}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-zinc-900">{contract.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 p-4">
          {/* Review section — visible when in_review */}
          {contract.status === 'in_review' && (
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-purple-800">Review Summary</h3>
              {contract.reviewSummary && (
                <p className="mb-4 text-sm text-purple-700">{contract.reviewSummary}</p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={onApprove}
                  className="flex-1 bg-green-600 text-white hover:bg-green-700"
                >
                  <Check className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowFeedbackInput(!showFeedbackInput)}
                  className="flex-1 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Request Changes
                </Button>
              </div>
              {showFeedbackInput && (
                <div className="mt-3">
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Describe what needs to change..."
                    className="w-full rounded-md border border-purple-200 bg-white p-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                    rows={3}
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setShowFeedbackInput(false)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmitFeedback}
                      disabled={!feedbackText.trim()}
                      className="bg-yellow-500 text-white hover:bg-yellow-600"
                    >
                      Send Feedback
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Review feedback banner — visible when in_progress with feedback */}
          {contract.status === 'in_progress' && contract.reviewFeedback && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <h3 className="mb-1 text-sm font-semibold text-yellow-800">Changes Requested</h3>
              <p className="text-sm text-yellow-700">{contract.reviewFeedback}</p>
            </div>
          )}

          {contract.userStory && (
            <div>
              <h3 className="mb-1 text-xs font-semibold uppercase text-zinc-400">User Story</h3>
              <p className="text-sm text-zinc-700">{contract.userStory}</p>
            </div>
          )}

          {contract.description && (
            <div>
              <h3 className="mb-1 text-xs font-semibold uppercase text-zinc-400">Description</h3>
              <p className="text-sm text-zinc-700">{contract.description}</p>
            </div>
          )}

          <CollapsibleSection title="Stack" data={contract.stack} />
          <CollapsibleSection title="Target Files" data={contract.targetFiles} />
          <CollapsibleSection title="Data Models" data={contract.dataModels} />
          <CollapsibleSection title="API Endpoints" data={contract.apiEndpoints} />
          <CollapsibleSection title="Design Tokens" data={contract.designTokens} />
          <CollapsibleSection title="Component Spec" data={contract.componentSpec} />
          <CollapsibleSection title="Constraints" data={contract.constraints} />
          <CollapsibleSection title="Patterns" data={contract.patterns} />

          {contract.acceptanceCriteria && (contract.acceptanceCriteria as string[]).length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase text-zinc-400">Acceptance Criteria</h3>
              <ul className="space-y-1">
                {(contract.acceptanceCriteria as string[]).map((ac, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                    <input type="checkbox" className="mt-0.5 rounded border-zinc-300" />
                    <span>{ac}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {contract.testCases && (contract.testCases as string[]).length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase text-zinc-400">Test Cases</h3>
              <ul className="space-y-1">
                {(contract.testCases as string[]).map((tc, i) => (
                  <li key={i} className="text-sm text-zinc-700">
                    - {tc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Activity Timeline */}
          {events.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase text-zinc-400">Activity</h3>
              <div className="space-y-3">
                {events.map((event) => (
                  <EventItem key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-zinc-200 bg-white p-4">
          <div className="mb-3 flex gap-2">
            {contract.generatedPrompt && (
              <Button onClick={handleCopyPrompt} variant="outline" size="sm" className="flex-1">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Prompt'}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {(['ready', 'in_progress', 'in_review', 'done'] as ContractStatus[]).map((status) => (
              <Button
                key={status}
                variant={contract.status === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => onStatusChange(status)}
                disabled={contract.status === status}
                className="flex-1"
              >
                {STATUS_LABELS[status]}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function EventItem({ event }: { event: ContractEvent }) {
  const Icon = EVENT_ICONS[event.type] ?? MessageSquare

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100">
        <Icon className="h-3.5 w-3.5 text-zinc-500" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-700">
            {EVENT_LABELS[event.type] ?? event.type}
          </span>
          <span className="text-xs text-zinc-400">
            by {event.actor}
          </span>
          <span className="text-xs text-zinc-400">
            {formatRelativeTime(event.createdAt)}
          </span>
        </div>
        {event.message && (
          <p className="mt-0.5 text-sm text-zinc-500">{event.message}</p>
        )}
      </div>
    </div>
  )
}

function CollapsibleSection({ title, data }: { title: string; data: unknown }) {
  if (data == null) return null
  if (Array.isArray(data) && data.length === 0) return null
  if (typeof data === 'object' && !Array.isArray(data) && Object.keys(data as object).length === 0) return null

  return (
    <details className="group">
      <summary className="cursor-pointer text-xs font-semibold uppercase text-zinc-400 hover:text-zinc-600">
        {title}
      </summary>
      <pre className="mt-2 max-h-60 overflow-auto rounded-md bg-zinc-50 p-3 text-xs text-zinc-700">
        {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
      </pre>
    </details>
  )
}
