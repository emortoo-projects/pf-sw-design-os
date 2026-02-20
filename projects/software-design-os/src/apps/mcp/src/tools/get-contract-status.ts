import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db, schema } from '../db'
import type { AuthContext } from '../auth'

export const getContractStatusTool = {
  name: 'getContractStatus',
  description: 'Check the current status of a contract. Use this to poll for review results after submitting. Returns status and reviewFeedback if changes were requested.',
  schema: z.object({
    contractId: z.string().describe('The UUID of the contract to check'),
  }),
  handler: async (auth: AuthContext, args: { contractId: string }) => {
    const [contract] = await db
      .select({
        id: schema.promptContracts.id,
        title: schema.promptContracts.title,
        status: schema.promptContracts.status,
        reviewFeedback: schema.promptContracts.reviewFeedback,
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
          text: JSON.stringify({ error: `Contract '${args.contractId}' not found in this project` }),
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

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2),
      }],
    }
  },
}
