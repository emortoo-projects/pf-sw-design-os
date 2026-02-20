import { Hono } from 'hono'
import { z } from 'zod'
import { eq, and, gt, ne, inArray } from 'drizzle-orm'
import { db } from '../db'
import {
  projects as projectsTable,
  stages as stagesTable,
  stageOutputs as stageOutputsTable,
} from '../db/schema'
import type { AppEnv } from '../types'
import { generateStage, GenerationError } from '../lib/generation-service'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const EDITABLE_STATUSES = new Set(['active', 'review'])

const updateStageSchema = z.object({
  data: z.record(z.unknown()),
  userInput: z.string().max(10_000).optional(),
})

const stageRoutes = new Hono<AppEnv>()

/** Verify the project belongs to the authenticated user. */
async function verifyProjectOwnership(projectId: string, userId: string): Promise<boolean> {
  const [project] = await db
    .select({ id: projectsTable.id })
    .from(projectsTable)
    .where(
      and(
        eq(projectsTable.id, projectId),
        eq(projectsTable.userId, userId),
        ne(projectsTable.status, 'deleted'),
      ),
    )
    .limit(1)

  return !!project
}

function validateProjectId(projectId: string | undefined): projectId is string {
  return !!projectId && UUID_REGEX.test(projectId)
}

function parseStageNumber(num: string): number | null {
  const n = parseInt(num, 10)
  if (isNaN(n) || n < 1 || n > 9) return null
  return n
}

// GET /api/projects/:projectId/stages — all 9 stages with status
stageRoutes.get('/', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }

  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  const allStages = await db
    .select()
    .from(stagesTable)
    .where(eq(stagesTable.projectId, projectId))
    .orderBy(stagesTable.stageNumber)

  return c.json(allStages)
})

// GET /api/projects/:projectId/stages/:num — stage with outputs
stageRoutes.get('/:num', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')
  const stageNumber = parseStageNumber(c.req.param('num'))

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }

  if (!stageNumber) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid stage number' } }, 400)
  }

  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  const [stage] = await db
    .select()
    .from(stagesTable)
    .where(
      and(
        eq(stagesTable.projectId, projectId),
        eq(stagesTable.stageNumber, stageNumber),
      ),
    )
    .limit(1)

  if (!stage) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Stage not found' } }, 404)
  }

  const outputs = await db
    .select()
    .from(stageOutputsTable)
    .where(eq(stageOutputsTable.stageId, stage.id))
    .orderBy(stageOutputsTable.version)

  return c.json({ ...stage, outputs })
})

// PUT /api/projects/:projectId/stages/:num — save stage data (human edits)
stageRoutes.put('/:num', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')
  const stageNumber = parseStageNumber(c.req.param('num'))

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }

  if (!stageNumber) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid stage number' } }, 400)
  }

  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  const body = updateStageSchema.parse(await c.req.json())

  // Atomic update with status guard in WHERE to prevent TOCTOU race
  const [updated] = await db
    .update(stagesTable)
    .set({
      data: body.data,
      userInput: body.userInput,
      status: 'review',
    })
    .where(
      and(
        eq(stagesTable.projectId, projectId),
        eq(stagesTable.stageNumber, stageNumber),
        inArray(stagesTable.status, ['active', 'review']),
      ),
    )
    .returning()

  if (!updated) {
    // Check if stage exists to distinguish 404 from status conflict
    const [stage] = await db
      .select({ id: stagesTable.id, status: stagesTable.status })
      .from(stagesTable)
      .where(
        and(
          eq(stagesTable.projectId, projectId),
          eq(stagesTable.stageNumber, stageNumber),
        ),
      )
      .limit(1)

    if (!stage) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Stage not found' } }, 404)
    }

    return c.json(
      { error: { code: 'BAD_REQUEST', message: `Cannot edit stage in '${stage.status}' status` } },
      400,
    )
  }

  return c.json(updated)
})

// POST /api/projects/:projectId/stages/:num/generate — trigger AI generation
const generateInputSchema = z.object({
  userInput: z.string().max(10_000).optional(),
})

stageRoutes.post('/:num/generate', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')
  const stageNumber = parseStageNumber(c.req.param('num'))

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }

  if (!stageNumber) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid stage number' } }, 400)
  }

  if (stageNumber === 9) {
    return c.json(
      { error: { code: 'BAD_REQUEST', message: 'Export stage does not use AI generation' } },
      400,
    )
  }

  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  const body = generateInputSchema.parse(await c.req.json().catch(() => ({})))

  try {
    const result = await generateStage({
      projectId,
      stageNumber,
      userId,
      userInput: body.userInput,
    })

    return c.json(result)
  } catch (err) {
    if (err instanceof GenerationError) {
      console.error(`[generate] Error (${err.code}): ${err.message}`)
      const statusMap: Record<string, number> = {
        NOT_FOUND: 404,
        BAD_STATUS: 400,
        INVALID_STAGE: 400,
        NO_PROVIDER: 400,
        GENERATION_FAILED: 422,
        PARSE_ERROR: 422,
        TRUNCATED: 422,
      }
      const status = statusMap[err.code] ?? 500
      return c.json(
        { error: { code: err.code, message: err.message } },
        status as 400 | 404 | 422 | 500,
      )
    }
    throw err
  }
})

// POST /api/projects/:projectId/stages/:num/outputs/:version/activate — restore a previous output version
stageRoutes.post('/:num/outputs/:version/activate', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')
  const stageNumber = parseStageNumber(c.req.param('num'))
  const version = parseInt(c.req.param('version'), 10)

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }

  if (!stageNumber) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid stage number' } }, 400)
  }

  if (isNaN(version) || version < 1 || String(version) !== c.req.param('version')) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid version number' } }, 400)
  }

  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  const result = await db.transaction(async (tx) => {
    const [stage] = await tx
      .select()
      .from(stagesTable)
      .where(
        and(
          eq(stagesTable.projectId, projectId),
          eq(stagesTable.stageNumber, stageNumber),
        ),
      )
      .limit(1)

    if (!stage) {
      return { error: 'NOT_FOUND' as const }
    }

    if (!EDITABLE_STATUSES.has(stage.status) && stage.status !== 'complete') {
      return { error: 'BAD_STATUS' as const, status: stage.status }
    }

    // Find the target output
    const [targetOutput] = await tx
      .select()
      .from(stageOutputsTable)
      .where(
        and(
          eq(stageOutputsTable.stageId, stage.id),
          eq(stageOutputsTable.version, version),
        ),
      )
      .limit(1)

    if (!targetOutput) {
      return { error: 'OUTPUT_NOT_FOUND' as const }
    }

    // Deactivate all outputs for this stage
    await tx
      .update(stageOutputsTable)
      .set({ isActive: false })
      .where(eq(stageOutputsTable.stageId, stage.id))

    // Activate the target output
    const [activatedOutput] = await tx
      .update(stageOutputsTable)
      .set({ isActive: true })
      .where(eq(stageOutputsTable.id, targetOutput.id))
      .returning()

    // Parse output content and write to stage.data
    let parsedData: Record<string, unknown> = {}
    try {
      parsedData = JSON.parse(targetOutput.content)
    } catch {
      parsedData = { raw: targetOutput.content }
    }

    // If stage is complete, revert to review (data changed, downstream stale)
    const newStatus = stage.status === 'complete' ? 'review' : stage.status

    const [updatedStage] = await tx
      .update(stagesTable)
      .set({
        data: parsedData,
        status: newStatus,
        ...(newStatus === 'review' ? { completedAt: null, validatedAt: null } : {}),
      })
      .where(eq(stagesTable.id, stage.id))
      .returning()

    return { error: null, stage: updatedStage, output: activatedOutput }
  })

  if (result.error === 'NOT_FOUND') {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Stage not found' } }, 404)
  }

  if (result.error === 'BAD_STATUS') {
    return c.json(
      { error: { code: 'BAD_REQUEST', message: `Cannot activate version in '${result.status}' status` } },
      400,
    )
  }

  if (result.error === 'OUTPUT_NOT_FOUND') {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Output version not found' } }, 404)
  }

  return c.json({ stage: result.stage, output: result.output })
})

// POST /api/projects/:projectId/stages/:num/complete — validate + mark complete + unlock next
stageRoutes.post('/:num/complete', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')
  const stageNumber = parseStageNumber(c.req.param('num'))

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }

  if (!stageNumber) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid stage number' } }, 400)
  }

  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  // Wrap in transaction for atomicity
  const result = await db.transaction(async (tx) => {
    const [stage] = await tx
      .select()
      .from(stagesTable)
      .where(
        and(
          eq(stagesTable.projectId, projectId),
          eq(stagesTable.stageNumber, stageNumber),
        ),
      )
      .limit(1)

    if (!stage) {
      return { error: 'NOT_FOUND' as const }
    }

    if (stage.status !== 'active' && stage.status !== 'review') {
      return { error: 'BAD_STATUS' as const, status: stage.status }
    }

    // Mark current stage as complete
    const [completedStage] = await tx
      .update(stagesTable)
      .set({
        status: 'complete',
        completedAt: new Date(),
        validatedAt: new Date(),
      })
      .where(eq(stagesTable.id, stage.id))
      .returning()

    // Unlock the next stage (only if currently locked)
    let nextStage = null
    if (stageNumber < 9) {
      const [next] = await tx
        .update(stagesTable)
        .set({ status: 'active' })
        .where(
          and(
            eq(stagesTable.projectId, projectId),
            eq(stagesTable.stageNumber, stageNumber + 1),
            eq(stagesTable.status, 'locked'),
          ),
        )
        .returning()

      nextStage = next ?? null

      // Update project's currentStage
      await tx
        .update(projectsTable)
        .set({ currentStage: stageNumber + 1 })
        .where(eq(projectsTable.id, projectId))
    }

    return { error: null, stage: completedStage, nextStage }
  })

  if (result.error === 'NOT_FOUND') {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Stage not found' } }, 404)
  }

  if (result.error === 'BAD_STATUS') {
    return c.json(
      { error: { code: 'BAD_REQUEST', message: `Cannot complete stage in '${result.status}' status` } },
      400,
    )
  }

  return c.json({ stage: result.stage, nextStage: result.nextStage })
})

// POST /api/projects/:projectId/stages/:num/revert — revert to review + lock all subsequent
stageRoutes.post('/:num/revert', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')
  const stageNumber = parseStageNumber(c.req.param('num'))

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }

  if (!stageNumber) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid stage number' } }, 400)
  }

  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  // Wrap in transaction for atomicity
  const result = await db.transaction(async (tx) => {
    const [stage] = await tx
      .select()
      .from(stagesTable)
      .where(
        and(
          eq(stagesTable.projectId, projectId),
          eq(stagesTable.stageNumber, stageNumber),
        ),
      )
      .limit(1)

    if (!stage) {
      return { error: 'NOT_FOUND' as const }
    }

    if (stage.status !== 'complete') {
      return { error: 'BAD_STATUS' as const, status: stage.status }
    }

    // Revert this stage to review
    const [revertedStage] = await tx
      .update(stagesTable)
      .set({
        status: 'review',
        completedAt: null,
        validatedAt: null,
      })
      .where(eq(stagesTable.id, stage.id))
      .returning()

    // Lock all subsequent stages
    const lockedStages = await tx
      .update(stagesTable)
      .set({
        status: 'locked',
        completedAt: null,
        validatedAt: null,
      })
      .where(
        and(
          eq(stagesTable.projectId, projectId),
          gt(stagesTable.stageNumber, stageNumber),
        ),
      )
      .returning()

    // Update project's currentStage back to this stage
    await tx
      .update(projectsTable)
      .set({ currentStage: stageNumber })
      .where(eq(projectsTable.id, projectId))

    return {
      error: null,
      stage: revertedStage,
      lockedStages: lockedStages.sort((a, b) => a.stageNumber - b.stageNumber),
    }
  })

  if (result.error === 'NOT_FOUND') {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Stage not found' } }, 404)
  }

  if (result.error === 'BAD_STATUS') {
    return c.json(
      { error: { code: 'BAD_REQUEST', message: `Cannot revert stage in '${result.status}' status` } },
      400,
    )
  }

  return c.json({ stage: result.stage, lockedStages: result.lockedStages })
})

export { stageRoutes }
