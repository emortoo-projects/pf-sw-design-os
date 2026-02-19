import { Hono } from 'hono'
import { z } from 'zod'
import { eq, and, ne, sql } from 'drizzle-orm'
import { createHash, randomBytes } from 'node:crypto'
import { db } from '../db'
import {
  mcpTokens as tokensTable,
  projects as projectsTable,
} from '../db/schema'
import type { AppEnv } from '../types'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const TOKEN_PREFIX = 'sdp_live_'
const MAX_TOKENS_PER_PROJECT = 10

const createTokenSchema = z.object({
  label: z.string().min(1).max(255),
  expiresInDays: z.number().int().min(1).max(365).default(365),
})

/** Verify the project belongs to the authenticated user and is not deleted. */
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

/** Generate a plaintext token and its SHA-256 hash. */
function generateToken(): { plaintext: string; hash: string; prefix: string } {
  const random = randomBytes(24).toString('hex') // 48 hex chars
  const plaintext = `${TOKEN_PREFIX}${random}`
  const hash = createHash('sha256').update(plaintext).digest('hex')
  const prefix = plaintext.slice(0, 13)
  return { plaintext, hash, prefix }
}

const mcpTokenRoutes = new Hono<AppEnv>()

// GET / — list tokens for the project (project-scoped)
mcpTokenRoutes.get('/', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }

  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  const tokens = await db
    .select({
      id: tokensTable.id,
      label: tokensTable.label,
      projectId: tokensTable.projectId,
      tokenPrefix: tokensTable.tokenPrefix,
      lastUsedAt: tokensTable.lastUsedAt,
      expiresAt: tokensTable.expiresAt,
      createdAt: tokensTable.createdAt,
    })
    .from(tokensTable)
    .where(
      and(
        eq(tokensTable.projectId, projectId),
        eq(tokensTable.userId, userId),
      ),
    )
    .orderBy(tokensTable.createdAt)

  return c.json(tokens)
})

// POST / — create a new token (project-scoped)
mcpTokenRoutes.post('/', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }

  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  // Enforce per-project token limit
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tokensTable)
    .where(
      and(
        eq(tokensTable.projectId, projectId),
        eq(tokensTable.userId, userId),
      ),
    )

  if (count >= MAX_TOKENS_PER_PROJECT) {
    return c.json(
      { error: { code: 'LIMIT_EXCEEDED', message: `Maximum of ${MAX_TOKENS_PER_PROJECT} tokens per project` } },
      400,
    )
  }

  const body = createTokenSchema.parse(await c.req.json())
  const { plaintext, hash, prefix } = generateToken()
  const expiresAt = new Date(Date.now() + body.expiresInDays * 86_400_000)

  const [created] = await db
    .insert(tokensTable)
    .values({
      userId,
      projectId,
      tokenHash: hash,
      tokenPrefix: prefix,
      label: body.label,
      expiresAt,
    })
    .returning()

  // Fetch project name for the response
  const [project] = await db
    .select({ name: projectsTable.name })
    .from(projectsTable)
    .where(eq(projectsTable.id, projectId))
    .limit(1)

  return c.json(
    {
      id: created.id,
      label: created.label,
      projectId: created.projectId,
      projectName: project?.name ?? '',
      tokenPrefix: created.tokenPrefix,
      lastUsedAt: created.lastUsedAt,
      expiresAt: created.expiresAt,
      createdAt: created.createdAt,
      plaintext,
    },
    201,
  )
})

// DELETE /:tokenId — hard-delete a token (project-scoped)
mcpTokenRoutes.delete('/:tokenId', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('projectId')
  const tokenId = c.req.param('tokenId')

  if (!validateProjectId(projectId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid project ID' } }, 400)
  }

  if (!tokenId || !UUID_REGEX.test(tokenId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid token ID' } }, 400)
  }

  if (!(await verifyProjectOwnership(projectId, userId))) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  const [deleted] = await db
    .delete(tokensTable)
    .where(
      and(
        eq(tokensTable.id, tokenId),
        eq(tokensTable.projectId, projectId),
        eq(tokensTable.userId, userId),
      ),
    )
    .returning({ id: tokensTable.id })

  if (!deleted) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Token not found' } }, 404)
  }

  return c.json({ success: true })
})

// --- User-scoped route (not project-scoped) ---
// Mounted separately at /api/mcp-tokens

const mcpTokenUserRoutes = new Hono<AppEnv>()

// GET /api/mcp-tokens — list all user's tokens with project names
mcpTokenUserRoutes.get('/', async (c) => {
  const userId = c.get('userId')

  const tokens = await db
    .select({
      id: tokensTable.id,
      label: tokensTable.label,
      projectId: tokensTable.projectId,
      projectName: projectsTable.name,
      tokenPrefix: tokensTable.tokenPrefix,
      lastUsedAt: tokensTable.lastUsedAt,
      expiresAt: tokensTable.expiresAt,
      createdAt: tokensTable.createdAt,
    })
    .from(tokensTable)
    .innerJoin(projectsTable, eq(tokensTable.projectId, projectsTable.id))
    .where(eq(tokensTable.userId, userId))
    .orderBy(tokensTable.createdAt)

  return c.json(tokens)
})

export { mcpTokenRoutes, mcpTokenUserRoutes }
