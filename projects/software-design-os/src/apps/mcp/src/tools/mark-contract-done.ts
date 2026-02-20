import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db, schema } from '../db'
import type { AuthContext } from '../auth'

export const markContractDoneTool = {
  name: 'markContractDone',
  description: 'Mark a prompt contract as done. This sets completedAt and cascades to unblock dependent contracts (backlog → ready when all deps are done).',
  schema: z.object({
    contractId: z.string().describe('The UUID of the contract to mark as done'),
  }),
  handler: async (auth: AuthContext, args: { contractId: string }) => {
    // Update the contract
    const [updated] = await db
      .update(schema.promptContracts)
      .set({ status: 'done', completedAt: new Date() })
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

    // Cascade dependencies
    const allContracts = await db
      .select()
      .from(schema.promptContracts)
      .where(eq(schema.promptContracts.projectId, auth.projectId))

    const doneIds = new Set(
      allContracts.filter((c) => c.status === 'done').map((c) => c.id),
    )

    const cascaded: string[] = []
    for (const contract of allContracts) {
      if (contract.status !== 'backlog') continue
      const deps = (contract.dependencies as string[]) ?? []
      if (!deps.includes(args.contractId)) continue
      if (deps.every((depId) => doneIds.has(depId))) {
        await db
          .update(schema.promptContracts)
          .set({ status: 'ready' })
          .where(eq(schema.promptContracts.id, contract.id))
        cascaded.push(contract.title)
      }
    }

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          done: updated.title,
          cascaded: cascaded.length > 0 ? cascaded : undefined,
          message: cascaded.length > 0
            ? `Marked done. ${cascaded.length} contract(s) are now ready: ${cascaded.join(', ')}`
            : 'Marked done. No new contracts unlocked.',
        }, null, 2),
      }],
    }
  },
}
