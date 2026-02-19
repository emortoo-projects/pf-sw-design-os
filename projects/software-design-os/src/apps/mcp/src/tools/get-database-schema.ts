import { z } from 'zod'
import type { AuthContext } from '../auth'
import { getActiveStageOutput } from './helpers'

export const getDatabaseSchemaTool = {
  name: 'getDatabaseSchema',
  description: 'Get the Database Schema (Stage 3) — SQL tables, columns, indexes, and migration scripts.',
  schema: z.object({}),
  handler: async (auth: AuthContext) => {
    const result = await getActiveStageOutput(auth, 'database')
    if (result.error) {
      return { content: [{ type: 'text' as const, text: JSON.stringify({ error: result.error }) }] }
    }
    return { content: [{ type: 'text' as const, text: JSON.stringify(result.data, null, 2) }] }
  },
}
