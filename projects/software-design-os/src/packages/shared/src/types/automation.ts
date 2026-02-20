export type BatchRunStatus = 'running' | 'completed' | 'stopped' | 'failed'

export type TrustLevel = 'manual' | 'semi_auto' | 'full_auto'

export interface QualityGates {
  typescriptCompiles: boolean
  testsPass: boolean
  lintClean: boolean
  noNewWarnings: boolean
}

export interface Boundaries {
  protectEnvFiles: boolean
  protectConfigFiles: boolean
  protectedPaths: string[]
}

export interface BatchLimits {
  maxTasks: number
  maxConsecutiveFailures: number
}

export interface AutomationConfig {
  trustLevel: TrustLevel
  qualityGates: QualityGates
  boundaries: Boundaries
  batchLimits: BatchLimits
}

export interface QualityReport {
  typescriptCompiles: boolean | null
  testsPass: boolean | null
  lintClean: boolean | null
  noNewWarnings: boolean | null
  filesChanged: string[]
  checksOutput: string | null
  passed: boolean
}

export interface BatchRun {
  id: string
  projectId: string
  status: BatchRunStatus
  config: AutomationConfig | null
  startedAt: string | null
  completedAt: string | null
  tasksAttempted: number
  tasksCompleted: number
  tasksFailed: number
  tasksParkedForReview: number
  report: Record<string, unknown> | null
  createdAt: string
}
