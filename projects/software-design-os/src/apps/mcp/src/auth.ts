import { createHash } from 'node:crypto'
import { eq, and, ne, or, gt, isNull } from 'drizzle-orm'
import { db, schema } from './db'

export interface AuthContext {
  userId: string
  projectId: string
  tokenId: string
}

/**
 * Validate a plaintext MCP token and return the auth context.
 * Returns null if the token is invalid, expired, or the project is deleted.
 */
export async function validateToken(plaintext: string): Promise<AuthContext | null> {
  if (!plaintext || !plaintext.startsWith('sdp_live_')) {
    return null
  }

  const tokenHash = createHash('sha256').update(plaintext).digest('hex')

  const [row] = await db
    .select({
      id: schema.mcpTokens.id,
      userId: schema.mcpTokens.userId,
      projectId: schema.mcpTokens.projectId,
      expiresAt: schema.mcpTokens.expiresAt,
    })
    .from(schema.mcpTokens)
    .where(
      and(
        eq(schema.mcpTokens.tokenHash, tokenHash),
        or(
          isNull(schema.mcpTokens.expiresAt),
          gt(schema.mcpTokens.expiresAt, new Date()),
        ),
      ),
    )
    .limit(1)

  if (!row) return null

  // Verify project exists and is active
  const [project] = await db
    .select({ id: schema.projects.id })
    .from(schema.projects)
    .where(
      and(
        eq(schema.projects.id, row.projectId),
        ne(schema.projects.status, 'deleted'),
      ),
    )
    .limit(1)

  if (!project) return null

  // Fire-and-forget: update lastUsedAt
  db.update(schema.mcpTokens)
    .set({ lastUsedAt: new Date() })
    .where(eq(schema.mcpTokens.id, row.id))
    .catch((err) => {
      console.error('Failed to update lastUsedAt for token:', row.id, err.message)
    })

  return {
    userId: row.userId,
    projectId: row.projectId,
    tokenId: row.id,
  }
}
