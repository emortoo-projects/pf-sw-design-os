export type StageName =
  | 'product'
  | 'dataModel'
  | 'database'
  | 'api'
  | 'stack'
  | 'design'
  | 'sections'
  | 'infrastructure'
  | 'export'

export type StageStatus = 'locked' | 'active' | 'generating' | 'review' | 'complete'

export interface Stage {
  id: string
  projectId: string
  stageNumber: number
  stageName: StageName
  stageLabel: string
  status: StageStatus
  data?: Record<string, unknown>
  userInput?: string
  validatedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}
