import type { ProjectWithStages, Stage, StageOutput, AIGeneration } from '@sdos/shared'
import { STAGE_CONFIGS } from '@sdos/shared'

const PROJECT_ID = 'mock-project-1'
const now = new Date().toISOString()
const yesterday = new Date(Date.now() - 86400000).toISOString()

function createStage(config: (typeof STAGE_CONFIGS)[number], status: Stage['status']): Stage {
  return {
    id: `stage-${config.number}`,
    projectId: PROJECT_ID,
    stageNumber: config.number,
    stageName: config.name,
    stageLabel: config.label,
    status,
    data: status === 'complete' || status === 'review' ? { placeholder: true } : undefined,
    validatedAt: status === 'complete' ? yesterday : undefined,
    completedAt: status === 'complete' ? yesterday : undefined,
    createdAt: yesterday,
    updatedAt: now,
  }
}

const stages: Stage[] = STAGE_CONFIGS.map((config) => {
  if (config.number === 1) return createStage(config, 'complete')
  if (config.number === 2) return createStage(config, 'active')
  return createStage(config, 'locked')
})

export const mockProject: ProjectWithStages = {
  id: PROJECT_ID,
  userId: 'mock-user-1',
  name: 'My Software Project',
  slug: 'my-software-project',
  description: 'A sample project to demonstrate the pipeline view',
  currentStage: 2,
  status: 'active',
  createdAt: yesterday,
  updatedAt: now,
  stages,
}

export const mockOutputs: Record<string, StageOutput[]> = {
  'stage-1': [
    {
      id: 'output-1-1',
      stageId: 'stage-1',
      version: 1,
      format: 'json',
      content: JSON.stringify({ name: 'My Software Project', features: ['Feature A', 'Feature B'] }),
      generatedBy: 'ai',
      aiGenerationId: 'gen-1',
      isActive: true,
      createdAt: yesterday,
    },
  ],
}

export function getProjectData(): ProjectWithStages {
  return { ...mockProject, stages: [...stages] }
}

export function getStage(stageNumber: number): Stage | undefined {
  return stages.find((s) => s.stageNumber === stageNumber)
}

export function updateStage(stageNumber: number, updates: Partial<Stage>): Stage | undefined {
  const index = stages.findIndex((s) => s.stageNumber === stageNumber)
  if (index === -1) return undefined
  stages[index] = { ...stages[index], ...updates, updatedAt: new Date().toISOString() }
  return stages[index]
}

export function generateForStage(stageNumber: number): {
  stage: Stage
  output: StageOutput
  generation: AIGeneration
} | undefined {
  const stage = getStage(stageNumber)
  if (!stage || stage.status === 'locked' || stage.status === 'complete') return undefined

  const updatedStage = updateStage(stageNumber, { status: 'review', data: { generated: true } })!

  const output: StageOutput = {
    id: `output-${stageNumber}-${Date.now()}`,
    stageId: stage.id,
    version: 1,
    format: 'json',
    content: JSON.stringify({ generated: true, stageNumber }),
    generatedBy: 'ai',
    aiGenerationId: `gen-${Date.now()}`,
    isActive: true,
    createdAt: new Date().toISOString(),
  }

  const generation: AIGeneration = {
    id: output.aiGenerationId!,
    stageId: stage.id,
    providerId: 'mock-provider',
    model: 'claude-sonnet-4-5-20250929',
    promptTemplate: `stage-${stage.stageName}-v1`,
    inputTokens: 1200,
    outputTokens: 800,
    totalTokens: 2000,
    estimatedCost: 0.012,
    durationMs: 1500,
    status: 'success',
    createdAt: new Date().toISOString(),
  }

  return { stage: updatedStage, output, generation }
}

export function completeStage(stageNumber: number): { stage: Stage; nextStage: Stage | null } | undefined {
  const stage = getStage(stageNumber)
  if (!stage || stage.status !== 'review') return undefined

  const completedStage = updateStage(stageNumber, {
    status: 'complete',
    completedAt: new Date().toISOString(),
    validatedAt: new Date().toISOString(),
  })!

  let nextStage: Stage | null = null
  if (stageNumber < 9) {
    const next = getStage(stageNumber + 1)
    if (next && next.status === 'locked') {
      nextStage = updateStage(stageNumber + 1, { status: 'active' })!
    }
  }

  return { stage: completedStage, nextStage }
}

export function revertStage(stageNumber: number): { stage: Stage; lockedStages: Stage[] } | undefined {
  const stage = getStage(stageNumber)
  if (!stage || stage.status === 'locked') return undefined

  const revertedStage = updateStage(stageNumber, {
    status: 'active',
    data: undefined,
    completedAt: undefined,
    validatedAt: undefined,
  })!

  const lockedStages: Stage[] = []
  for (let i = stageNumber + 1; i <= 9; i++) {
    const subsequent = getStage(i)
    if (subsequent && subsequent.status !== 'locked') {
      const locked = updateStage(i, {
        status: 'locked',
        data: undefined,
        completedAt: undefined,
        validatedAt: undefined,
      })!
      lockedStages.push(locked)
    }
  }

  return { stage: revertedStage, lockedStages }
}
