import { Hono } from 'hono'
import { z } from 'zod'
import { eq, and, ne, desc } from 'drizzle-orm'
import { db } from '../db'
import {
  projects as projectsTable,
  promptContracts as contractsTable,
  contractEvents as eventsTable,
  batchRuns as batchRunsTable,
} from '../db/schema'
import type { AppEnv } from '../types'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const automationRoutes = new Hono<AppEnv>()

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

// ── Automation Config ────────────────────────────────────────────────────────

// GET / — get project automation config
automationRoutes.get('/', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }
  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  const [project] = await db
    .select({ automationConfig: projectsTable.automationConfig })
    .from(projectsTable)
    .where(eq(projectsTable.id, projectId))
    .limit(1)

  return c.json(project?.automationConfig ?? null)
})

// PATCH / — save automation config
const automationConfigSchema = z.object({
  trustLevel: z.enum(['manual', 'semi_auto', 'full_auto']),
  qualityGates: z.object({
    typescriptCompiles: z.boolean(),
    testsPass: z.boolean(),
    lintClean: z.boolean(),
    noNewWarnings: z.boolean(),
  }),
  boundaries: z.object({
    protectEnvFiles: z.boolean(),
    protectConfigFiles: z.boolean(),
    protectedPaths: z.array(z.string()),
  }),
  batchLimits: z.object({
    maxTasks: z.number().int().min(1).max(100),
    maxConsecutiveFailures: z.number().int().min(1).max(20),
  }),
})

automationRoutes.patch('/', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }
  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  const body = automationConfigSchema.parse(await c.req.json())

  const [updated] = await db
    .update(projectsTable)
    .set({ automationConfig: body })
    .where(eq(projectsTable.id, projectId))
    .returning({ automationConfig: projectsTable.automationConfig })

  return c.json(updated?.automationConfig ?? null)
})

// ── Batch Runs ───────────────────────────────────────────────────────────────

// POST /batch/start — create a new batch run
automationRoutes.post('/batch/start', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }
  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  // Get current automation config
  const [project] = await db
    .select({ automationConfig: projectsTable.automationConfig })
    .from(projectsTable)
    .where(eq(projectsTable.id, projectId))
    .limit(1)

  const [batchRun] = await db
    .insert(batchRunsTable)
    .values({
      projectId,
      status: 'running',
      config: project?.automationConfig ?? null,
      startedAt: new Date(),
    })
    .returning()

  return c.json(batchRun)
})

// GET /batch/latest — get latest batch run
automationRoutes.get('/batch/latest', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }
  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  const [batchRun] = await db
    .select()
    .from(batchRunsTable)
    .where(eq(batchRunsTable.projectId, projectId))
    .orderBy(desc(batchRunsTable.createdAt))
    .limit(1)

  return c.json(batchRun ?? null)
})

// GET /batch/:batchId — get specific batch run
automationRoutes.get('/batch/:batchId', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')
  const batchId = c.req.param('batchId')

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }
  if (!batchId || !UUID_REGEX.test(batchId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid batch ID' } }, 400)
  }
  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  const [batchRun] = await db
    .select()
    .from(batchRunsTable)
    .where(
      and(
        eq(batchRunsTable.id, batchId),
        eq(batchRunsTable.projectId, projectId),
      ),
    )
    .limit(1)

  if (!batchRun) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Batch run not found' } }, 404)
  }

  return c.json(batchRun)
})

// POST /batch/:batchId/stop — emergency stop
automationRoutes.post('/batch/:batchId/stop', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')
  const batchId = c.req.param('batchId')

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }
  if (!batchId || !UUID_REGEX.test(batchId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid batch ID' } }, 400)
  }
  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  const [updated] = await db
    .update(batchRunsTable)
    .set({ status: 'stopped', completedAt: new Date() })
    .where(
      and(
        eq(batchRunsTable.id, batchId),
        eq(batchRunsTable.projectId, projectId),
        eq(batchRunsTable.status, 'running'),
      ),
    )
    .returning()

  if (!updated) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Running batch not found' } }, 404)
  }

  return c.json(updated)
})

// ── Quality Gates ────────────────────────────────────────────────────────────

// POST /tasks/:taskId/quality-gates — store quality report on contract
const qualityReportSchema = z.object({
  typescriptCompiles: z.boolean().nullable(),
  testsPass: z.boolean().nullable(),
  lintClean: z.boolean().nullable(),
  noNewWarnings: z.boolean().nullable(),
  filesChanged: z.array(z.string()),
  checksOutput: z.string().nullable(),
  passed: z.boolean(),
})

automationRoutes.post('/tasks/:taskId/quality-gates', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')
  const taskId = c.req.param('taskId')

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }
  if (!taskId || !UUID_REGEX.test(taskId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid task ID' } }, 400)
  }
  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  const body = qualityReportSchema.parse(await c.req.json())

  const [updated] = await db
    .update(contractsTable)
    .set({ qualityReport: body })
    .where(
      and(
        eq(contractsTable.id, taskId),
        eq(contractsTable.projectId, projectId),
      ),
    )
    .returning()

  if (!updated) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Contract not found' } }, 404)
  }

  return c.json(updated)
})

// ── Bulk Approve ─────────────────────────────────────────────────────────────

// POST /batch-approve — approve all in_review contracts that passed quality gates
automationRoutes.post('/batch-approve', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }
  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  // Find all in_review contracts that have a quality report with passed=true
  const inReview = await db
    .select()
    .from(contractsTable)
    .where(
      and(
        eq(contractsTable.projectId, projectId),
        eq(contractsTable.status, 'in_review'),
      ),
    )

  const toApprove = inReview.filter((c) => {
    const report = c.qualityReport as Record<string, unknown> | null
    return report?.passed === true
  })

  let approved = 0
  for (const contract of toApprove) {
    await db
      .update(contractsTable)
      .set({ status: 'done', completedAt: new Date(), reviewedAt: new Date() })
      .where(eq(contractsTable.id, contract.id))

    await db.insert(eventsTable).values({
      contractId: contract.id,
      type: 'approved',
      actor: 'user',
      message: 'Bulk approved — quality gates passed',
    })

    // Cascade dependencies
    await cascadeDependencies(projectId, contract.id)
    approved++
  }

  return c.json({ approved, total: inReview.length })
})

// ── Workflow Prompt Generator ────────────────────────────────────────────────

// POST /generate-workflow-prompt — generate a ready-to-paste overnight prompt
automationRoutes.post('/generate-workflow-prompt', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }
  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  const [project] = await db
    .select({ name: projectsTable.name, automationConfig: projectsTable.automationConfig })
    .from(projectsTable)
    .where(eq(projectsTable.id, projectId))
    .limit(1)

  const config = project?.automationConfig as Record<string, unknown> | null
  const qualityGates = config?.qualityGates as Record<string, boolean> | undefined
  const boundaries = config?.boundaries as Record<string, unknown> | undefined
  const batchLimits = config?.batchLimits as Record<string, number> | undefined

  const maxTasks = batchLimits?.maxTasks ?? 10
  const maxFailures = batchLimits?.maxConsecutiveFailures ?? 3

  const gatesList: string[] = []
  if (qualityGates?.typescriptCompiles) gatesList.push('- TypeScript compiles (`npx tsc --noEmit`)')
  if (qualityGates?.testsPass) gatesList.push('- Tests pass (`npm test`)')
  if (qualityGates?.lintClean) gatesList.push('- Lint clean (`npm run lint`)')
  if (qualityGates?.noNewWarnings) gatesList.push('- No new warnings introduced')

  const boundaryRules: string[] = []
  if (boundaries?.protectEnvFiles) boundaryRules.push('- Do NOT modify .env files')
  if (boundaries?.protectConfigFiles) boundaryRules.push('- Do NOT modify root config files (tsconfig, eslint, etc.)')
  const protectedPaths = (boundaries?.protectedPaths as string[] | undefined) ?? []
  for (const p of protectedPaths) {
    boundaryRules.push(`- Do NOT modify files in: ${p}`)
  }

  const prompt = `# Autonomous Task Execution — ${project?.name ?? 'Project'}

You are executing prompt contracts for the "${project?.name ?? 'Project'}" project.
Use the SDOS MCP tools to work through contracts autonomously.

## Workflow Loop

Repeat until all ready contracts are done or limits are reached:

1. Call \`getNextContract\` to get the highest-priority ready contract
2. Call \`startContract(contractId)\` to claim it
3. Read the contract's \`generatedPrompt\` and implement it
4. Run quality gates before submitting
5. Call \`submitContract(contractId, summary)\` with a summary of changes
6. Move to the next contract (do NOT wait for review)

## Quality Gates

Before submitting each contract, verify:
${gatesList.length > 0 ? gatesList.join('\n') : '- (No quality gates configured)'}

## Boundary Rules

${boundaryRules.length > 0 ? boundaryRules.join('\n') : '- (No boundary rules configured)'}

## Batch Limits

- Maximum tasks per run: ${maxTasks}
- Stop after ${maxFailures} consecutive failures
- If a task fails, log the error in the summary and move on

## Important

- Work through contracts in priority order (getNextContract handles this)
- Do not skip contracts or reorder them
- If you encounter an error you cannot resolve, submit with a failure summary and continue
- Keep summaries concise but include key changes and files modified
`

  return c.json({ prompt })
})

// ── Helpers ──────────────────────────────────────────────────────────────────

async function cascadeDependencies(projectId: string, completedContractId: string): Promise<void> {
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

    const allDepsDone = deps.every((depId) => doneIds.has(depId))
    if (allDepsDone) {
      await db
        .update(contractsTable)
        .set({ status: 'ready' })
        .where(eq(contractsTable.id, contract.id))
    }
  }
}

export { automationRoutes }
