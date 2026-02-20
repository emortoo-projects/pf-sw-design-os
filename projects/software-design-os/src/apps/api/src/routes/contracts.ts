import { Hono } from 'hono'
import { z } from 'zod'
import { eq, and, ne } from 'drizzle-orm'
import { db } from '../db'
import {
  projects as projectsTable,
  stages as stagesTable,
  promptContracts as contractsTable,
  contractEvents as eventsTable,
} from '../db/schema'
import type { AppEnv } from '../types'
import { generateContracts, type StageData } from '../lib/contract-generator'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const REQUIRED_STAGE_NAMES = ['product', 'dataModel', 'database', 'api', 'stack', 'design', 'sections', 'infrastructure'] as const

const contractRoutes = new Hono<AppEnv>()

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

// POST /generate — generate contracts from completed stages
contractRoutes.post('/generate', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }

  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  // Fetch project name
  const [project] = await db
    .select({ name: projectsTable.name })
    .from(projectsTable)
    .where(eq(projectsTable.id, projectId))
    .limit(1)

  // Fetch all 8 required stages
  const allStages = await db
    .select()
    .from(stagesTable)
    .where(eq(stagesTable.projectId, projectId))
    .orderBy(stagesTable.stageNumber)

  // Verify all 8 stages are complete with data
  const stageDataMap: Partial<StageData> = {}
  for (const name of REQUIRED_STAGE_NAMES) {
    const stage = allStages.find((s) => s.stageName === name)
    if (!stage?.data || stage.status !== 'complete') {
      return c.json(
        { error: { code: 'BAD_REQUEST', message: `Stage '${name}' must be complete before generating contracts` } },
        400,
      )
    }
    stageDataMap[name] = stage.data as Record<string, unknown>
  }

  const stageData = stageDataMap as StageData
  const contracts = generateContracts(stageData, project?.name ?? 'Untitled')

  // Delete existing + insert new in a transaction
  const result = await db.transaction(async (tx) => {
    await tx
      .delete(contractsTable)
      .where(eq(contractsTable.projectId, projectId))

    const inserted = []
    for (const contract of contracts) {
      const [row] = await tx
        .insert(contractsTable)
        .values({
          id: contract.id,
          projectId,
          title: contract.title,
          type: contract.type,
          priority: contract.priority,
          status: contract.status,
          dependencies: contract.dependencies,
          description: contract.description,
          userStory: contract.userStory,
          stack: contract.stack,
          targetFiles: contract.targetFiles,
          referenceFiles: contract.referenceFiles,
          constraints: contract.constraints,
          doNotTouch: contract.doNotTouch,
          patterns: contract.patterns,
          dataModels: contract.dataModels,
          apiEndpoints: contract.apiEndpoints,
          designTokens: contract.designTokens,
          componentSpec: contract.componentSpec,
          acceptanceCriteria: contract.acceptanceCriteria,
          testCases: contract.testCases,
          generatedPrompt: contract.generatedPrompt,
        })
        .returning()
      inserted.push(row)
    }

    return inserted
  })

  return c.json({ contracts: result, count: result.length })
})

// GET /next — first 'ready' contract by priority
contractRoutes.get('/next', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }

  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  const [contract] = await db
    .select()
    .from(contractsTable)
    .where(
      and(
        eq(contractsTable.projectId, projectId),
        eq(contractsTable.status, 'ready'),
      ),
    )
    .orderBy(contractsTable.priority)
    .limit(1)

  return c.json(contract ?? null)
})

// POST /claude-md — generate CLAUDE.md content
contractRoutes.post('/claude-md', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }

  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  // Fetch project + stages
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, projectId))
    .limit(1)

  const allStages = await db
    .select()
    .from(stagesTable)
    .where(eq(stagesTable.projectId, projectId))
    .orderBy(stagesTable.stageNumber)

  const getStageData = (name: string) => {
    const stage = allStages.find((s) => s.stageName === name)
    return (stage?.data ?? {}) as Record<string, unknown>
  }

  const productData = getStageData('product') as { name?: string; description?: string; features?: Array<{ name: string; description: string }> }
  const stackData = getStageData('stack') as { selections?: Record<string, string> }
  const dataModelData = getStageData('dataModel') as { entities?: Array<{ name: string }> }
  const apiData = getStageData('api') as { endpoints?: Array<{ path: string; method: string }> }
  const designData = getStageData('design') as Record<string, unknown>
  const sectionsData = getStageData('sections') as { sections?: Array<{ name: string; route?: string }> }

  const lines: string[] = []
  lines.push(`# ${productData.name ?? project?.name ?? 'Project'}`)
  lines.push('')

  if (productData.description) {
    lines.push(productData.description)
    lines.push('')
  }

  if (productData.features && productData.features.length > 0) {
    lines.push('## Features')
    for (const f of productData.features) {
      lines.push(`- **${f.name}**: ${f.description}`)
    }
    lines.push('')
  }

  if (stackData.selections) {
    lines.push('## Tech Stack')
    for (const [key, value] of Object.entries(stackData.selections)) {
      lines.push(`- **${key}**: ${value}`)
    }
    lines.push('')
  }

  if (dataModelData.entities && dataModelData.entities.length > 0) {
    lines.push('## Data Models')
    lines.push(dataModelData.entities.map((e) => `- ${e.name}`).join('\n'))
    lines.push('')
  }

  if (apiData.endpoints && apiData.endpoints.length > 0) {
    lines.push('## API Endpoints')
    for (const ep of apiData.endpoints) {
      lines.push(`- \`${ep.method} ${ep.path}\``)
    }
    lines.push('')
  }

  const designKeys = Object.keys(designData).filter((k) => designData[k] != null)
  if (designKeys.length > 0) {
    lines.push('## Design Tokens')
    lines.push(`Defined: ${designKeys.join(', ')}`)
    lines.push('')
  }

  if (sectionsData.sections && sectionsData.sections.length > 0) {
    lines.push('## Pages / Sections')
    for (const s of sectionsData.sections) {
      lines.push(`- **${s.name}**${s.route ? ` — \`${s.route}\`` : ''}`)
    }
    lines.push('')
  }

  return c.json({ content: lines.join('\n') })
})

// POST /:contractId/start — set in_progress + log started event
contractRoutes.post('/:contractId/start', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')
  const contractId = c.req.param('contractId')

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }
  if (!contractId || !UUID_REGEX.test(contractId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid contract ID' } }, 400)
  }
  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  const [updated] = await db
    .update(contractsTable)
    .set({ status: 'in_progress', startedAt: new Date() })
    .where(
      and(
        eq(contractsTable.id, contractId),
        eq(contractsTable.projectId, projectId),
      ),
    )
    .returning()

  if (!updated) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Contract not found' } }, 404)
  }

  await db.insert(eventsTable).values({
    contractId,
    type: 'started',
    actor: 'user',
  })

  return c.json(updated)
})

// POST /:contractId/submit — set in_review + reviewSummary
contractRoutes.post('/:contractId/submit', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')
  const contractId = c.req.param('contractId')

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }
  if (!contractId || !UUID_REGEX.test(contractId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid contract ID' } }, 400)
  }
  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  const body = z.object({ summary: z.string() }).parse(await c.req.json())

  const [updated] = await db
    .update(contractsTable)
    .set({ status: 'in_review', reviewSummary: body.summary })
    .where(
      and(
        eq(contractsTable.id, contractId),
        eq(contractsTable.projectId, projectId),
      ),
    )
    .returning()

  if (!updated) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Contract not found' } }, 404)
  }

  await db.insert(eventsTable).values({
    contractId,
    type: 'submitted',
    actor: 'claude-code',
    message: body.summary,
  })

  return c.json(updated)
})

// POST /:contractId/approve — set done + cascade deps
contractRoutes.post('/:contractId/approve', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')
  const contractId = c.req.param('contractId')

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }
  if (!contractId || !UUID_REGEX.test(contractId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid contract ID' } }, 400)
  }
  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  const [updated] = await db
    .update(contractsTable)
    .set({ status: 'done', completedAt: new Date() })
    .where(
      and(
        eq(contractsTable.id, contractId),
        eq(contractsTable.projectId, projectId),
      ),
    )
    .returning()

  if (!updated) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Contract not found' } }, 404)
  }

  await db.insert(eventsTable).values({
    contractId,
    type: 'approved',
    actor: 'user',
  })

  await cascadeDependencies(projectId, contractId)

  return c.json(updated)
})

// POST /:contractId/request-changes — set in_progress + reviewFeedback
contractRoutes.post('/:contractId/request-changes', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')
  const contractId = c.req.param('contractId')

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }
  if (!contractId || !UUID_REGEX.test(contractId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid contract ID' } }, 400)
  }
  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  const body = z.object({ feedback: z.string() }).parse(await c.req.json())

  const [updated] = await db
    .update(contractsTable)
    .set({ status: 'in_progress', reviewFeedback: body.feedback })
    .where(
      and(
        eq(contractsTable.id, contractId),
        eq(contractsTable.projectId, projectId),
      ),
    )
    .returning()

  if (!updated) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Contract not found' } }, 404)
  }

  await db.insert(eventsTable).values({
    contractId,
    type: 'changes_requested',
    actor: 'user',
    message: body.feedback,
  })

  return c.json(updated)
})

// GET /:contractId/events — list events for a contract
contractRoutes.get('/:contractId/events', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')
  const contractId = c.req.param('contractId')

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }
  if (!contractId || !UUID_REGEX.test(contractId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid contract ID' } }, 400)
  }
  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  const events = await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.contractId, contractId))
    .orderBy(eventsTable.createdAt)

  return c.json(events)
})

// GET / — list all contracts, optional ?status= filter
contractRoutes.get('/', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')
  const statusFilter = c.req.query('status')

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }

  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  const conditions = [eq(contractsTable.projectId, projectId)]
  if (statusFilter) {
    const validStatuses = ['backlog', 'ready', 'in_progress', 'in_review', 'done'] as const
    if (!validStatuses.includes(statusFilter as any)) {
      return c.json({ error: { code: 'BAD_REQUEST', message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` } }, 400)
    }
    conditions.push(eq(contractsTable.status, statusFilter as typeof validStatuses[number]))
  }

  const contracts = await db
    .select()
    .from(contractsTable)
    .where(and(...conditions))
    .orderBy(contractsTable.priority)

  return c.json(contracts)
})

// GET /:contractId — single contract
contractRoutes.get('/:contractId', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')
  const contractId = c.req.param('contractId')

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }

  if (!contractId || !UUID_REGEX.test(contractId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid contract ID' } }, 400)
  }

  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  const [contract] = await db
    .select()
    .from(contractsTable)
    .where(
      and(
        eq(contractsTable.id, contractId),
        eq(contractsTable.projectId, projectId),
      ),
    )
    .limit(1)

  if (!contract) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Contract not found' } }, 404)
  }

  return c.json(contract)
})

// PATCH /:contractId — update status
const updateContractSchema = z.object({
  status: z.enum(['backlog', 'ready', 'in_progress', 'in_review', 'done']).optional(),
})

contractRoutes.patch('/:contractId', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')
  const contractId = c.req.param('contractId')

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }

  if (!contractId || !UUID_REGEX.test(contractId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid contract ID' } }, 400)
  }

  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  const body = updateContractSchema.parse(await c.req.json())

  const updateFields: Record<string, unknown> = {}
  if (body.status) updateFields.status = body.status
  if (body.status === 'done') updateFields.completedAt = new Date()

  const [updated] = await db
    .update(contractsTable)
    .set(updateFields)
    .where(
      and(
        eq(contractsTable.id, contractId),
        eq(contractsTable.projectId, projectId),
      ),
    )
    .returning()

  if (!updated) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Contract not found' } }, 404)
  }

  // If marked done, cascade dependents
  if (body.status === 'done') {
    await cascadeDependencies(projectId, contractId)
  }

  return c.json(updated)
})

// POST /:contractId/mark-done — set done + cascade
contractRoutes.post('/:contractId/mark-done', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')
  const contractId = c.req.param('contractId')

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }

  if (!contractId || !UUID_REGEX.test(contractId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid contract ID' } }, 400)
  }

  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  const [updated] = await db
    .update(contractsTable)
    .set({ status: 'done', completedAt: new Date() })
    .where(
      and(
        eq(contractsTable.id, contractId),
        eq(contractsTable.projectId, projectId),
      ),
    )
    .returning()

  if (!updated) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Contract not found' } }, 404)
  }

  await cascadeDependencies(projectId, contractId)

  return c.json(updated)
})

/**
 * When a contract is marked done, find dependents that reference it.
 * If all their deps are now done, flip them from backlog → ready.
 */
async function cascadeDependencies(projectId: string, completedContractId: string): Promise<void> {
  // Find all contracts in this project that have the completed ID in their dependencies
  const allContracts = await db
    .select()
    .from(contractsTable)
    .where(eq(contractsTable.projectId, projectId))

  const doneIds = new Set(
    allContracts.filter((c) => c.status === 'done').map((c) => c.id),
  )

  for (const contract of allContracts) {
    if (contract.status !== 'backlog') continue

    const deps = (contract.dependencies as string[]) ?? []
    if (!deps.includes(completedContractId)) continue

    // Check if ALL dependencies are done
    const allDepsDone = deps.every((depId) => doneIds.has(depId))
    if (allDepsDone) {
      await db
        .update(contractsTable)
        .set({ status: 'ready' })
        .where(eq(contractsTable.id, contract.id))
    }
  }
}

export { contractRoutes }
