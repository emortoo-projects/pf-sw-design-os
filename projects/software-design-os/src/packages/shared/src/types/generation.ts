export interface AIGeneration {
  id: string
  stageId: string
  providerId: string
  model: string
  promptTemplate: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  estimatedCost: number
  durationMs: number
  status: 'success' | 'error' | 'timeout'
  errorMessage?: string
  createdAt: string
}
