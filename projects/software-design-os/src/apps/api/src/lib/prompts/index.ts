import type { StageName } from '@sdos/shared'
import {
  buildProductPrompt,
  buildDataModelPrompt,
  buildDatabasePrompt,
  buildApiPrompt,
  buildStackPrompt,
  buildDesignPrompt,
  buildSectionsPrompt,
  buildInfrastructurePrompt,
} from './templates'

interface PromptPair {
  systemPrompt: string
  userPrompt: string
}

type StageContext = Record<string, Record<string, unknown> | undefined>

/** Map of stage name → prompt builder function. Stage 9 (export) has no AI prompt. */
const PROMPT_BUILDERS: Record<
  Exclude<StageName, 'export'>,
  (ctx: StageContext, userInput?: string) => PromptPair
> = {
  product: (_ctx, userInput) => buildProductPrompt(userInput),
  dataModel: (ctx) => buildDataModelPrompt(ctx),
  database: (ctx) => buildDatabasePrompt(ctx),
  api: (ctx) => buildApiPrompt(ctx),
  stack: (ctx) => buildStackPrompt(ctx),
  design: (ctx) => buildDesignPrompt(ctx),
  sections: (ctx) => buildSectionsPrompt(ctx),
  infrastructure: (ctx) => buildInfrastructurePrompt(ctx),
}

export function buildPrompt(
  stageName: StageName,
  stageContext: StageContext,
  userInput?: string,
): PromptPair {
  if (stageName === 'export') {
    throw new Error('Export stage does not use AI generation')
  }

  const builder = PROMPT_BUILDERS[stageName]
  return builder(stageContext, userInput)
}

export function getPromptTemplateName(stageName: StageName): string {
  return `stage-${stageName}-v1`
}
