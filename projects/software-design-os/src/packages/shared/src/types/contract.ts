export type ContractType = 'setup' | 'model' | 'api' | 'component' | 'page' | 'integration' | 'config'
export type ContractStatus = 'backlog' | 'ready' | 'in_progress' | 'in_review' | 'done'

export type ContractEventType = 'started' | 'submitted' | 'approved' | 'changes_requested' | 'rejected' | 'comment'

export interface ContractEvent {
  id: string
  contractId: string
  type: ContractEventType
  actor: string
  message: string | null
  createdAt: string
}

export interface PromptContract {
  id: string
  projectId: string
  title: string
  type: ContractType
  priority: number
  status: ContractStatus
  dependencies: string[]
  description: string | null
  userStory: string | null
  stack: Record<string, unknown> | null
  targetFiles: string[] | null
  referenceFiles: string[] | null
  constraints: string[] | null
  doNotTouch: string[] | null
  patterns: string[] | null
  dataModels: Record<string, unknown>[] | null
  apiEndpoints: Record<string, unknown>[] | null
  designTokens: Record<string, unknown> | null
  componentSpec: Record<string, unknown> | null
  acceptanceCriteria: string[] | null
  testCases: string[] | null
  generatedPrompt: string | null
  reviewSummary: string | null
  reviewFeedback: string | null
  startedAt: string | null
  completedAt: string | null
  batchRunId: string | null
  qualityReport: Record<string, unknown> | null
  submittedAt: string | null
  reviewedAt: string | null
  reviewNotes: string | null
  createdAt: string
  updatedAt: string
}
