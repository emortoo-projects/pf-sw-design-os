import { eq, and } from 'drizzle-orm'
import { db, schema } from '../db'
import type { AuthContext } from '../auth'

export interface StageOutput {
  data: Record<string, unknown>
  stageName: string
  stageLabel: string
  stageNumber: number
  stageStatus: string
  version: number | null
  format: string | null
}

export interface StageOutputResult {
  data: StageOutput | null
  error: string | null
}

/**
 * Fetch the active output for a given stage name within the authed project.
 */
export async function getActiveStageOutput(
  auth: AuthContext,
  stageName: string,
): Promise<StageOutputResult> {
  const [stage] = await db
    .select()
    .from(schema.stages)
    .where(
      and(
        eq(schema.stages.projectId, auth.projectId),
        eq(schema.stages.stageName, stageName),
      ),
    )
    .limit(1)

  if (!stage) {
    return { data: null, error: `Stage '${stageName}' not found for this project` }
  }

  // Look for the active output version
  const [output] = await db
    .select()
    .from(schema.stageOutputs)
    .where(
      and(
        eq(schema.stageOutputs.stageId, stage.id),
        eq(schema.stageOutputs.isActive, true),
      ),
    )
    .limit(1)

  let parsedContent: Record<string, unknown> = {}
  let version: number | null = null
  let format: string | null = null

  if (output) {
    version = output.version
    format = output.format
    try {
      parsedContent = JSON.parse(output.content)
    } catch {
      parsedContent = { raw: output.content }
    }
  } else if (stage.data) {
    // Fall back to stage.data if no output versions exist
    parsedContent = stage.data as Record<string, unknown>
  } else {
    return { data: null, error: `No data available for stage '${stageName}'. Stage status: ${stage.status}` }
  }

  return {
    data: {
      data: parsedContent,
      stageName: stage.stageName,
      stageLabel: stage.stageLabel,
      stageNumber: stage.stageNumber,
      stageStatus: stage.status,
      version,
      format,
    },
    error: null,
  }
}

/**
 * Fetch all stages for a project with their active outputs.
 */
export async function getAllStageOutputs(auth: AuthContext): Promise<StageOutputResult[]> {
  const stageNames = ['product', 'dataModel', 'database', 'api', 'stack', 'design', 'sections', 'infrastructure']
  const results = await Promise.all(
    stageNames.map((name) => getActiveStageOutput(auth, name)),
  )
  return results
}
