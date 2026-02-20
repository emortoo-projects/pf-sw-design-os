import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { db, schema } from '../db'
import type { AuthContext } from '../auth'

export const getBatchStatusTool = {
  name: 'getBatchStatus',
  description: 'Get the status of a batch run. If no batchId is provided, returns the latest batch run.',
  schema: z.object({
    batchId: z.string().optional().describe('The UUID of the batch run (optional — defaults to latest)'),
  }),
  handler: async (auth: AuthContext, args: { batchId?: string }) => {
    let batchRun

    if (args.batchId) {
      const [row] = await db
        .select()
        .from(schema.batchRuns)
        .where(
          and(
            eq(schema.batchRuns.id, args.batchId),
            eq(schema.batchRuns.projectId, auth.projectId),
          ),
        )
        .limit(1)
      batchRun = row
    } else {
      const [row] = await db
        .select()
        .from(schema.batchRuns)
        .where(eq(schema.batchRuns.projectId, auth.projectId))
        .orderBy(desc(schema.batchRuns.createdAt))
        .limit(1)
      batchRun = row
    }

    if (!batchRun) {
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ error: 'No batch run found' }),
        }],
      }
    }

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(batchRun, null, 2),
      }],
    }
  },
}
