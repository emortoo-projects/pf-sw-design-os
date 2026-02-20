import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db, schema } from '../db'
import type { AuthContext } from '../auth'

export const submitTaskTool = {
  name: 'submitTask',
  description: 'Submit a task after implementation with summary and optional quality report details. Sets status to in_review.',
  schema: z.object({
    contractId: z.string().describe('The UUID of the contract/task to submit'),
    summary: z.string().describe('A summary of what was implemented'),
    filesChanged: z.array(z.string()).optional().describe('List of files that were changed'),
    checksOutput: z.string().optional().describe('Output from quality gate checks'),
    failed: z.boolean().optional().describe('Whether the task failed'),
    error: z.string().optional().describe('Error message if the task failed'),
  }),
  handler: async (auth: AuthContext, args: {
    contractId: string
    summary: string
    filesChanged?: string[]
    checksOutput?: string
    failed?: boolean
    error?: string
  }) => {
    const qualityReport = {
      filesChanged: args.filesChanged ?? [],
      checksOutput: args.checksOutput ?? null,
      passed: !args.failed,
    }

    const status = args.failed ? 'in_progress' : 'in_review'

    const [updated] = await db
      .update(schema.promptContracts)
      .set({
        status: status as 'in_progress' | 'in_review',
        reviewSummary: args.summary,
        qualityReport,
        submittedAt: new Date(),
      })
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
      type: 'submitted',
      actor: 'claude-code',
      message: args.failed
        ? `Failed: ${args.error ?? args.summary}`
        : args.summary,
    })

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          submitted: updated.title,
          status,
          message: args.failed
            ? `Task "${updated.title}" failed. Error recorded.`
            : `Task "${updated.title}" submitted for review.`,
        }, null, 2),
      }],
    }
  },
}
