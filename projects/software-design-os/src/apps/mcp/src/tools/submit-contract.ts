import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db, schema } from '../db'
import type { AuthContext } from '../auth'

export const submitContractTool = {
  name: 'submitContract',
  description: 'Submit a contract for review after implementation. Sets status to in_review, stores a summary of what was implemented, and logs a submitted event. The user will review and approve or request changes in the UI.',
  schema: z.object({
    contractId: z.string().describe('The UUID of the contract to submit'),
    summary: z.string().describe('A summary of what was implemented'),
  }),
  handler: async (auth: AuthContext, args: { contractId: string; summary: string }) => {
    const [updated] = await db
      .update(schema.promptContracts)
      .set({ status: 'in_review', reviewSummary: args.summary })
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
          text: JSON.stringify({ error: `Contract '${args.contractId}' not found in this project` }),
        }],
      }
    }

    await db.insert(schema.contractEvents).values({
      contractId: args.contractId,
      type: 'submitted',
      actor: 'claude-code',
      message: args.summary,
    })

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          submitted: updated.title,
          message: `Contract "${updated.title}" submitted for review. Waiting for user approval in the UI.`,
        }, null, 2),
      }],
    }
  },
}
