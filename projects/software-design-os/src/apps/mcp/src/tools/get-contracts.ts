import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db, schema } from '../db'
import type { AuthContext } from '../auth'

export const getContractsTool = {
  name: 'getContracts',
  description: 'List prompt contracts for the project. Optionally filter by status (backlog, ready, in_progress, done).',
  schema: z.object({
    status: z.string().optional().describe('Optional status filter: backlog, ready, in_progress, in_review, done'),
  }),
  handler: async (auth: AuthContext, args: { status?: string }) => {
    const conditions = [eq(schema.promptContracts.projectId, auth.projectId)]

    if (args.status) {
      const validStatuses = ['backlog', 'ready', 'in_progress', 'in_review', 'done'] as const
      if (!validStatuses.includes(args.status as any)) {
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({ error: `Invalid status '${args.status}'. Must be one of: ${validStatuses.join(', ')}` }),
          }],
        }
      }
      conditions.push(eq(schema.promptContracts.status, args.status as typeof validStatuses[number]))
    }

    const contracts = await db
      .select()
      .from(schema.promptContracts)
      .where(and(...conditions))
      .orderBy(schema.promptContracts.priority)

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ contracts, count: contracts.length }, null, 2),
      }],
    }
  },
}
