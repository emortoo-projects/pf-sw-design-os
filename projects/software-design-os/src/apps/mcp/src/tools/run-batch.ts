import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db, schema } from '../db'
import type { AuthContext } from '../auth'

export const runBatchTool = {
  name: 'runBatch',
  description: 'Create a new batch run for the project. Returns the batchId to track progress.',
  schema: z.object({}),
  handler: async (auth: AuthContext) => {
    // Get current automation config
    const [project] = await db
      .select({ automationConfig: schema.projects.automationConfig })
      .from(schema.projects)
      .where(eq(schema.projects.id, auth.projectId))
      .limit(1)

    const [batchRun] = await db
      .insert(schema.batchRuns)
      .values({
        projectId: auth.projectId,
        status: 'running',
        config: project?.automationConfig ?? null,
        startedAt: new Date(),
      })
      .returning()

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          batchId: batchRun.id,
          status: batchRun.status,
          message: 'Batch run created. Use getBatchStatus to track progress.',
        }, null, 2),
      }],
    }
  },
}
