import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db, schema } from '../db'
import type { AuthContext } from '../auth'

export const getNextContractTool = {
  name: 'getNextContract',
  description: 'Get the next ready prompt contract (highest priority). Returns the full contract with generated prompt for immediate use.',
  schema: z.object({}),
  handler: async (auth: AuthContext) => {
    const [contract] = await db
      .select()
      .from(schema.promptContracts)
      .where(
        and(
          eq(schema.promptContracts.projectId, auth.projectId),
          eq(schema.promptContracts.status, 'ready'),
        ),
      )
      .orderBy(schema.promptContracts.priority)
      .limit(1)

    if (!contract) {
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ message: 'No ready contracts available. All contracts may be done or still blocked by dependencies.' }),
        }],
      }
    }

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(contract, null, 2),
      }],
    }
  },
}
