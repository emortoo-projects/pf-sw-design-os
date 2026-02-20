import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db, schema } from '../db'
import type { AuthContext } from '../auth'

export const stopBatchTool = {
  name: 'stopBatch',
  description: 'Stop a running batch run. Sets status to stopped and records completedAt.',
  schema: z.object({
    batchId: z.string().describe('The UUID of the batch run to stop'),
  }),
  handler: async (auth: AuthContext, args: { batchId: string }) => {
    const [updated] = await db
      .update(schema.batchRuns)
      .set({ status: 'stopped', completedAt: new Date() })
      .where(
        and(
          eq(schema.batchRuns.id, args.batchId),
          eq(schema.batchRuns.projectId, auth.projectId),
          eq(schema.batchRuns.status, 'running'),
        ),
      )
      .returning()

    if (!updated) {
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ error: `Running batch '${args.batchId}' not found in this project` }),
        }],
      }
    }

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          batchId: updated.id,
          status: 'stopped',
          message: 'Batch run stopped.',
        }, null, 2),
      }],
    }
  },
}
