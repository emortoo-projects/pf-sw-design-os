import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db, schema } from '../db'
import type { AuthContext } from '../auth'

export const startTaskTool = {
  name: 'startTask',
  description: 'Start working on a task (alias for startContract). Claims the task, sets status to in_progress, records startedAt, and logs a started event.',
  schema: z.object({
    contractId: z.string().describe('The UUID of the contract/task to start'),
  }),
  handler: async (auth: AuthContext, args: { contractId: string }) => {
    const [updated] = await db
      .update(schema.promptContracts)
      .set({ status: 'in_progress', startedAt: new Date() })
      .where(
        and(
          eq(schema.promptContracts.id, args.contractId),
          eq(schema.promptContracts.projectId, auth.projectId),
        ),
      )
      .returning()

    if (!updated) {
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ error: `Task '${args.contractId}' not found in this project` }),
        }],
      }
    }

    await db.insert(schema.contractEvents).values({
      contractId: args.contractId,
      type: 'started',
      actor: 'claude-code',
    })

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(updated, null, 2),
      }],
    }
  },
}
