import { eq, and, inArray, desc } from 'drizzle-orm'
import { db } from '../db'
import {
  stages as stagesTable,
  stageOutputs as stageOutputsTable,
  aiGenerations as aiGenerationsTable,
  aiProviderConfigs as aiProviderConfigsTable,
  projects as projectsTable,
} from '../db/schema'
import { createAIProviderClient, type AIGenerateResult } from './ai-provider'
import { estimateCost } from './cost-calculator'
import { buildPrompt, getPromptTemplateName } from './prompts'
import type { StageName } from '@sdos/shared'
import { STAGE_CONFIGS } from '@sdos/shared'

interface GenerateStageParams {
  projectId: string
  stageNumber: number
  userId: string
  userInput?: string
}

/** Stage dependency map: which previous stages each stage needs for context (by name). */
const STAGE_CONTEXT_DEPS: Record<Exclude<StageName, 'export'>, StageName[]> = {
  product: [],
  dataModel: ['product'],
  database: ['dataModel'],
  api: ['product', 'dataModel'],
  stack: ['product', 'database'],
  design: ['product'],
  sections: ['product', 'dataModel', 'database', 'api', 'stack', 'design'],
  infrastructure: ['database', 'stack'],
}

/**
 * Max output tokens per stage. Set to model max (64k for Claude Sonnet)
 * to avoid truncation. The model will stop naturally when done — the limit
 * is a safety cap, not a target.
 */
const MAX_OUTPUT_TOKENS = 64000

function stageNameToNumber(name: StageName): number {
  const config = STAGE_CONFIGS.find((c) => c.name === name)
  if (!config) throw new Error(`Unknown stage name: ${name}`)
  return config.number
}

/**
 * Extract a JSON object from an AI response that may contain markdown fences,
 * preamble text, or trailing commentary.
 */
function extractJSON(content: string): Record<string, unknown> {
  const cleaned = content.trim()
  console.log(`[extractJSON] Input length: ${cleaned.length}, starts with: ${JSON.stringify(cleaned.substring(0, 80))}`)

  // 1. Strip markdown code fences (most common AI wrapping)
  //    Greedy [\s\S]* to capture everything between fences (handles truncated-then-closed fences)
  const fenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*)\n?\s*```\s*$/)
  if (fenceMatch) {
    console.log(`[extractJSON] Strategy 1 (fence strip): matched, inner length=${fenceMatch[1].length}`)
    try {
      return JSON.parse(fenceMatch[1].trim())
    } catch (e) {
      console.log(`[extractJSON] Strategy 1 (fence strip): parse failed — ${(e as Error).message}`)
    }
  } else {
    // Try a looser fence strip: just remove opening ``` at the start
    const looseMatch = cleaned.match(/^```(?:json)?\s*\n?([\s\S]*)/)
    if (looseMatch) {
      const inner = looseMatch[1].replace(/\n?\s*```\s*$/, '').trim()
      console.log(`[extractJSON] Strategy 1b (loose fence strip): inner length=${inner.length}`)
      try {
        return JSON.parse(inner)
      } catch (e) {
        console.log(`[extractJSON] Strategy 1b (loose fence strip): parse failed — ${(e as Error).message}`)
      }
    } else {
      console.log(`[extractJSON] Strategy 1 (fence strip): no fence markers found`)
    }
  }

  // 2. Try direct parse (already clean JSON)
  console.log(`[extractJSON] Strategy 2 (direct parse): attempting`)
  try {
    return JSON.parse(cleaned)
  } catch (e) {
    console.log(`[extractJSON] Strategy 2 (direct parse): failed — ${(e as Error).message}`)
  }

  // 3. Extract the outermost JSON object: first { to last }
  const braceMatch = cleaned.match(/\{[\s\S]*\}/)
  if (braceMatch) {
    console.log(`[extractJSON] Strategy 3 (brace extract): matched, length=${braceMatch[0].length}`)
    try {
      return JSON.parse(braceMatch[0])
    } catch (e) {
      console.log(`[extractJSON] Strategy 3 (brace extract): parse failed — ${(e as Error).message}`)
    }
  } else {
    console.log(`[extractJSON] Strategy 3 (brace extract): no braces found`)
  }

  // Nothing worked — throw so the caller records the parse error
  throw new Error('No valid JSON object found in AI response')
}

export async function generateStage({ projectId, stageNumber, userId, userInput }: GenerateStageParams) {
  const stageName = STAGE_CONFIGS[stageNumber - 1]?.name
  if (!stageName || stageName === 'export') {
    throw new GenerationError('Stage 9 (export) does not use AI generation', 'INVALID_STAGE')
  }

  console.log(`[generate] Starting: stage=${stageName} (#${stageNumber}), project=${projectId}`)

  // 1. Atomically claim the stage by transitioning active/review → generating
  const [stage] = await db
    .update(stagesTable)
    .set({ status: 'generating' })
    .where(
      and(
        eq(stagesTable.projectId, projectId),
        eq(stagesTable.stageNumber, stageNumber),
        inArray(stagesTable.status, ['active', 'review']),
      ),
    )
    .returning()

  if (!stage) {
    // Distinguish "not found" from "bad status"
    const [existing] = await db
      .select({ id: stagesTable.id, status: stagesTable.status })
      .from(stagesTable)
      .where(
        and(
          eq(stagesTable.projectId, projectId),
          eq(stagesTable.stageNumber, stageNumber),
        ),
      )
      .limit(1)

    if (!existing) {
      console.error(`[generate] Stage not found: stage=#${stageNumber}, project=${projectId}`)
      throw new GenerationError('Stage not found', 'NOT_FOUND')
    }
    console.error(`[generate] Bad status: stage=#${stageNumber} is '${existing.status}', need active/review`)
    throw new GenerationError(
      `Cannot generate for stage in '${existing.status}' status`,
      'BAD_STATUS',
    )
  }

  // Track the original status so we can revert on failure
  // (we just set it to 'generating', but if it was 'review' we revert to 'review', etc.)
  // Since we only accept active/review above, determine what to revert to:
  // The stage was 'active' or 'review' before we claimed it. We can't know which from the
  // returned row (it's now 'generating'). Default to 'active' as the safe revert.
  // Actually, we can use stage.userInput / stage.data to infer: if data is present, it was 'review'.
  const revertStatus = stage.data ? 'review' : 'active'

  // 2. Find AI provider: project-level → user's default
  const [project] = await db
    .select({ aiProviderId: projectsTable.aiProviderId })
    .from(projectsTable)
    .where(eq(projectsTable.id, projectId))
    .limit(1)

  let providerConfig = null

  if (project?.aiProviderId) {
    const [config] = await db
      .select()
      .from(aiProviderConfigsTable)
      .where(
        and(
          eq(aiProviderConfigsTable.id, project.aiProviderId),
          eq(aiProviderConfigsTable.userId, userId),
        ),
      )
      .limit(1)
    providerConfig = config ?? null
  }

  if (!providerConfig) {
    const [defaultConfig] = await db
      .select()
      .from(aiProviderConfigsTable)
      .where(
        and(
          eq(aiProviderConfigsTable.userId, userId),
          eq(aiProviderConfigsTable.isDefault, true),
        ),
      )
      .limit(1)
    providerConfig = defaultConfig ?? null
  }

  if (!providerConfig) {
    console.error(`[generate] No AI provider found for user=${userId}, project=${projectId} (no project provider, no default)`)
    // Revert status before throwing
    await db
      .update(stagesTable)
      .set({ status: revertStatus })
      .where(eq(stagesTable.id, stage.id))
    throw new GenerationError(
      'No AI provider configured. Add one in Settings → AI Providers and mark it as Default.',
      'NO_PROVIDER',
    )
  }

  console.log(`[generate] Using provider: ${providerConfig.label} (${providerConfig.provider}/${providerConfig.defaultModel})`)

  // 3. Gather context from dependency stages
  const depNames = STAGE_CONTEXT_DEPS[stageName]
  const stageContext: Record<string, Record<string, unknown> | undefined> = {}

  if (depNames.length > 0) {
    const depNumbers = depNames.map(stageNameToNumber)
    const depStages = await db
      .select({ stageName: stagesTable.stageName, data: stagesTable.data })
      .from(stagesTable)
      .where(
        and(
          eq(stagesTable.projectId, projectId),
          inArray(stagesTable.stageNumber, depNumbers),
        ),
      )

    for (const dep of depStages) {
      if (dep.data) {
        stageContext[dep.stageName] = dep.data as Record<string, unknown>
      }
    }
  }

  // Include userInput from the stage itself if not provided in the request
  const effectiveUserInput = userInput ?? stage.userInput ?? undefined

  // 4. Build the prompt
  const { systemPrompt, userPrompt } = buildPrompt(stageName, stageContext, effectiveUserInput)
  const promptTemplate = getPromptTemplateName(stageName)

  // 5. Call the AI provider
  console.log(`[generate] Calling AI provider (${providerConfig.provider}/${providerConfig.defaultModel})...`)
  const startTime = Date.now()
  let aiResult: AIGenerateResult
  try {
    const client = createAIProviderClient(providerConfig)
    aiResult = await client.generate({
      model: providerConfig.defaultModel,
      systemPrompt,
      userPrompt,
      maxTokens: MAX_OUTPUT_TOKENS,
    })
  } catch (err) {
    const durationMs = Date.now() - startTime
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[generate] AI call failed after ${durationMs}ms: ${errorMessage}`)

    // Record error and revert status atomically
    await db.transaction(async (tx) => {
      await tx.insert(aiGenerationsTable).values({
        stageId: stage.id,
        providerId: providerConfig.id,
        model: providerConfig.defaultModel,
        promptTemplate,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        estimatedCost: '0',
        durationMs,
        status: 'error',
        errorMessage,
      })
      await tx
        .update(stagesTable)
        .set({ status: revertStatus })
        .where(eq(stagesTable.id, stage.id))
    })

    throw new GenerationError(`AI generation failed: ${errorMessage}`, 'GENERATION_FAILED')
  }

  const durationMs = Date.now() - startTime
  console.log(`[generate] AI response received in ${durationMs}ms (${aiResult.inputTokens}+${aiResult.outputTokens} tokens, stopReason=${aiResult.stopReason})`)

  // 6. Detect truncation — if the model hit max_tokens, the JSON is likely incomplete
  if (aiResult.stopReason === 'max_tokens') {
    console.error(`[generate] Response truncated (stopReason=max_tokens, outputTokens=${aiResult.outputTokens}, limit=${MAX_OUTPUT_TOKENS})`)
    console.error(`[generate] Last 200 chars: ${aiResult.content.substring(aiResult.content.length - 200)}`)

    // Record truncation error and revert status
    await db.transaction(async (tx) => {
      await tx.insert(aiGenerationsTable).values({
        stageId: stage.id,
        providerId: providerConfig.id,
        model: aiResult.model,
        promptTemplate,
        inputTokens: aiResult.inputTokens,
        outputTokens: aiResult.outputTokens,
        totalTokens: aiResult.inputTokens + aiResult.outputTokens,
        estimatedCost: String(estimateCost(aiResult.model, aiResult.inputTokens, aiResult.outputTokens)),
        durationMs,
        status: 'error',
        errorMessage: `Response truncated at ${aiResult.outputTokens} tokens (max_tokens limit)`,
      })
      await tx
        .update(stagesTable)
        .set({ status: revertStatus })
        .where(eq(stagesTable.id, stage.id))
    })

    throw new GenerationError(
      `AI response was truncated at ${aiResult.outputTokens} tokens. The output was too large for the token limit. Try simplifying the data model or using a model with higher output capacity.`,
      'TRUNCATED',
    )
  }

  // 7. Parse the generated content as JSON
  let parsedData: Record<string, unknown>
  try {
    parsedData = extractJSON(aiResult.content)
  } catch {
    console.error(`[generate] Failed to parse AI response as JSON. First 500 chars: ${aiResult.content.substring(0, 500)}`)
    // Record parse error and revert status atomically
    await db.transaction(async (tx) => {
      await tx.insert(aiGenerationsTable).values({
        stageId: stage.id,
        providerId: providerConfig.id,
        model: aiResult.model,
        promptTemplate,
        inputTokens: aiResult.inputTokens,
        outputTokens: aiResult.outputTokens,
        totalTokens: aiResult.inputTokens + aiResult.outputTokens,
        estimatedCost: String(estimateCost(aiResult.model, aiResult.inputTokens, aiResult.outputTokens)),
        durationMs,
        status: 'error',
        errorMessage: 'Failed to parse AI response as JSON',
      })
      await tx
        .update(stagesTable)
        .set({ status: revertStatus })
        .where(eq(stagesTable.id, stage.id))
    })

    throw new GenerationError('AI response was not valid JSON', 'PARSE_ERROR')
  }

  // 7. Save everything in a transaction
  const cost = estimateCost(aiResult.model, aiResult.inputTokens, aiResult.outputTokens)

  const result = await db.transaction(async (tx) => {
    const [generation] = await tx
      .insert(aiGenerationsTable)
      .values({
        stageId: stage.id,
        providerId: providerConfig.id,
        model: aiResult.model,
        promptTemplate,
        inputTokens: aiResult.inputTokens,
        outputTokens: aiResult.outputTokens,
        totalTokens: aiResult.inputTokens + aiResult.outputTokens,
        estimatedCost: String(cost),
        durationMs,
        status: 'success',
      })
      .returning()

    const [latestOutput] = await tx
      .select({ version: stageOutputsTable.version })
      .from(stageOutputsTable)
      .where(eq(stageOutputsTable.stageId, stage.id))
      .orderBy(desc(stageOutputsTable.version))
      .limit(1)

    const nextVersion = (latestOutput?.version ?? 0) + 1

    await tx
      .update(stageOutputsTable)
      .set({ isActive: false })
      .where(
        and(
          eq(stageOutputsTable.stageId, stage.id),
          eq(stageOutputsTable.isActive, true),
        ),
      )

    const [output] = await tx
      .insert(stageOutputsTable)
      .values({
        stageId: stage.id,
        version: nextVersion,
        format: 'json',
        content: JSON.stringify(parsedData),
        generatedBy: 'ai',
        aiGenerationId: generation.id,
        isActive: true,
      })
      .returning()

    const [updatedStage] = await tx
      .update(stagesTable)
      .set({
        data: parsedData,
        status: 'review',
      })
      .where(eq(stagesTable.id, stage.id))
      .returning()

    return { stage: updatedStage, output, generation }
  })

  console.log(`[generate] Success: stage=${stageName}, version=${result.output.version}, keys=${Object.keys(parsedData).join(',')}`)

  return result
}

export class GenerationError extends Error {
  code: string
  constructor(message: string, code: string) {
    super(message)
    this.name = 'GenerationError'
    this.code = code
  }
}
