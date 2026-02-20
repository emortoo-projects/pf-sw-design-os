import type { Project } from './project'
import type { Stage } from './stage'
import type { StageOutput } from './output'
import type { AIGeneration } from './generation'

export interface ProjectWithStages extends Project {
  stages: Stage[]
}

export interface StageWithOutputs extends Stage {
  outputs: StageOutput[]
}

export interface GenerateResponse {
  stage: Stage
  output: StageOutput
  generation: AIGeneration
}

export interface CompleteResponse {
  stage: Stage
  nextStage: Stage | null
}

export interface RevertResponse {
  stage: Stage
  lockedStages: Stage[]
}

export interface ActivateOutputResponse {
  stage: Stage
  output: StageOutput
}
