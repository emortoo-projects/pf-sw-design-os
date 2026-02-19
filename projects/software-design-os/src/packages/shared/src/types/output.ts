export interface StageOutput {
  id: string
  stageId: string
  version: number
  format: 'json' | 'md' | 'sql' | 'yaml'
  content: string
  generatedBy: 'ai' | 'human'
  aiGenerationId?: string
  isActive: boolean
  createdAt: string
}
