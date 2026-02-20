import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db, schema } from '../db'
import type { AuthContext } from '../auth'

export const getTaskStatusTool = {
  name: 'getTaskStatus',
  description: 'Check the current status of a task. Use this to poll for review results after submitting. Returns status, reviewFeedback, and qualityReport.',
  schema: z.object({
    contractId: z.string().describe('The UUID of the contract/task to check'),
  }),
  handler: async (auth: AuthContext, args: { contractId: string }) => {
    const [contract] = await db
      .select({
        id: schema.promptContracts.id,
        title: schema.promptContracts.title,
        status: schema.promptContracts.status,
        reviewFeedback: schema.promptContracts.reviewFeedback,
        qualityReport: schema.promptContracts.qualityReport,
      })
      .from(schema.promptContracts)
      .where(
        and(
          eq(schema.promptContracts.id, args.contractId),
          eq(schema.promptContracts.projectId, auth.projectId),
        ),
      )
      .limit(1)

    if (!contract) {
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ error: `Task '${args.contractId}' not found in this project` }),
        }],
      }
    }

    const result: Record<string, unknown> = {
      id: contract.id,
      title: contract.title,
      status: contract.status,
    }

    if (contract.status === 'in_progress' && contract.reviewFeedback) {
      result.reviewFeedback = contract.reviewFeedback
    }

    if (contract.qualityReport) {
      result.qualityReport = contract.qualityReport
    }

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2),
      }],
    }
  },
}
