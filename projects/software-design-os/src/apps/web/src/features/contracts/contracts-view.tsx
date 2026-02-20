import { useState } from 'react'
import { GitBranch, FileText, Check, AlertCircle, X, LayoutGrid, BarChart3, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useContracts, useContractMutations } from '@/hooks/use-contracts'
import { useAutomationMutations } from '@/hooks/use-automation'
import type { PromptContract, ContractStatus } from './types'
import { STATUS_LABELS } from './types'
import { ContractCard } from './contract-card'
import { ContractDetail } from './contract-detail'
import { ContractDependencyGraph } from './contract-dependency-graph'
import { ContractGenerateButton } from './contract-generate-button'
import { BatchRunner } from '@/features/tasks/batch-runner'
import { BatchReport } from '@/features/tasks/batch-report'

interface ContractsViewProps {
  projectId: string
}

type Tab = 'board' | 'batch'

const COLUMNS: ContractStatus[] = ['backlog', 'ready', 'in_progress', 'in_review', 'done']

export function ContractsView({ projectId }: ContractsViewProps) {
  const { data: contracts = [], isLoading } = useContracts(projectId)
  const { generate, markDone, updateStatus, generateClaudeMd, approve, requestChanges } = useContractMutations(projectId)
  const { batchApprove } = useAutomationMutations(projectId)
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null)
  const [showGraph, setShowGraph] = useState(false)
  const [claudeMdCopied, setClaudeMdCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('board')

  const selectedContract = contracts.find((c) => c.id === selectedContractId) ?? null

  const doneCount = contracts.filter((c) => c.status === 'done').length
  const totalCount = contracts.length
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  const inReviewCount = contracts.filter((c) => c.status === 'in_review').length
  const passedGatesCount = contracts.filter((c) => {
    if (c.status !== 'in_review') return false
    const report = c.qualityReport as Record<string, unknown> | null
    return report?.passed === true
  }).length

  const byStatus = (status: ContractStatus): PromptContract[] =>
    contracts.filter((c) => c.status === status).sort((a, b) => a.priority - b.priority)

  const handleStatusChange = (contractId: string, status: ContractStatus) => {
    if (status === 'done') {
      markDone.mutate(contractId)
    } else {
      updateStatus.mutate({ contractId, status })
    }
    setSelectedContractId(null)
  }

  const handleApprove = (contractId: string) => {
    approve.mutate(contractId)
    setSelectedContractId(null)
  }

  const handleRequestChanges = (contractId: string, feedback: string) => {
    requestChanges.mutate({ contractId, feedback })
    setSelectedContractId(null)
  }

  const handleCopyClaudeMd = async () => {
    const result = await generateClaudeMd.mutateAsync()
    await navigator.clipboard.writeText(result.content)
    setClaudeMdCopied(true)
    setTimeout(() => setClaudeMdCopied(false), 2000)
  }

  const handleBulkApprove = () => {
    batchApprove.mutate()
  }

  const generateError = generate.error instanceof Error
    ? generate.error.message
    : generate.isError
      ? 'An unexpected error occurred'
      : null

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-zinc-400">
        Loading tasks...
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Tasks</h1>
          {totalCount > 0 && activeTab === 'board' && (
            <p className="mt-1 text-sm text-zinc-500">
              {doneCount} of {totalCount} tasks complete ({progressPct}%)
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'board' && totalCount > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyClaudeMd}
                disabled={generateClaudeMd.isPending}
              >
                {claudeMdCopied ? <Check className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                {claudeMdCopied ? 'Copied!' : 'CLAUDE.md'}
              </Button>
              <Button
                variant={showGraph ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowGraph(!showGraph)}
              >
                <GitBranch className="h-4 w-4" />
                Graph
              </Button>
            </>
          )}
          {activeTab === 'board' && (
            <ContractGenerateButton
              hasContracts={totalCount > 0}
              isGenerating={generate.isPending}
              onGenerate={() => generate.mutate()}
            />
          )}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-zinc-200 px-6">
        {([
          { key: 'board' as Tab, label: 'Board', icon: LayoutGrid },
          { key: 'batch' as Tab, label: 'Batch History', icon: BarChart3 },
        ]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Error banner */}
      {activeTab === 'board' && generateError && (
        <div className="border-b border-red-200 bg-red-50 px-6 py-3">
          <div className="flex items-start gap-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Failed to generate tasks</p>
              <p className="text-red-600">{generateError}</p>
            </div>
            <button
              onClick={() => generate.reset()}
              className="shrink-0 text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {activeTab === 'board' && totalCount > 0 && (
        <div className="border-b border-zinc-200 px-6 py-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'batch' && (
          <div className="mx-auto max-w-2xl space-y-6">
            <BatchRunner projectId={projectId} />
            <BatchReport projectId={projectId} />
          </div>
        )}

        {activeTab === 'board' && (
          <>
            {/* Bulk approve banner */}
            {passedGatesCount > 0 && (
              <div className="mb-4 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  {passedGatesCount} of {inReviewCount} in-review task{inReviewCount !== 1 ? 's' : ''} passed quality gates
                </div>
                <Button size="sm" onClick={handleBulkApprove} disabled={batchApprove.isPending}>
                  Approve All Passed
                </Button>
              </div>
            )}

            {totalCount === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-full bg-zinc-100 p-4">
                  <FileText className="h-8 w-8 text-zinc-400" />
                </div>
                <h2 className="mb-2 text-lg font-medium text-zinc-900">No Tasks Yet</h2>
                <p className="mb-6 max-w-md text-sm text-zinc-500">
                  Generate tasks from your completed design stages. All 8 design stages must be complete before generating.
                </p>
                <ContractGenerateButton
                  hasContracts={false}
                  isGenerating={generate.isPending}
                  onGenerate={() => generate.mutate()}
                />
              </div>
            ) : showGraph ? (
              <ContractDependencyGraph
                contracts={contracts}
                onSelectContract={setSelectedContractId}
              />
            ) : (
              <div className="grid grid-cols-5 gap-4">
                {COLUMNS.map((status) => (
                  <div key={status} className="flex flex-col">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-zinc-600">{STATUS_LABELS[status]}</h3>
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
                        {byStatus(status).length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {byStatus(status).map((contract) => (
                        <ContractCard
                          key={contract.id}
                          contract={contract}
                          onClick={() => setSelectedContractId(contract.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail slide-over */}
      {selectedContract && (
        <ContractDetail
          contract={selectedContract}
          projectId={projectId}
          onClose={() => setSelectedContractId(null)}
          onStatusChange={(status) => handleStatusChange(selectedContract.id, status)}
          onApprove={() => handleApprove(selectedContract.id)}
          onRequestChanges={(feedback) => handleRequestChanges(selectedContract.id, feedback)}
        />
      )}
    </div>
  )
}
