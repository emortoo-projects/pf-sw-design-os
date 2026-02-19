import { z } from 'zod'
import type { AuthContext } from '../auth'
import { getActiveStageOutput } from './helpers'

export const getInfrastructureTool = {
  name: 'getInfrastructure',
  description: 'Get the Infrastructure (Stage 8) — hosting, CI/CD, monitoring, and deployment configuration.',
  schema: z.object({}),
  handler: async (auth: AuthContext) => {
    const result = await getActiveStageOutput(auth, 'infrastructure')
    if (result.error) {
      return { content: [{ type: 'text' as const, text: JSON.stringify({ error: result.error }) }] }
    }
    return { content: [{ type: 'text' as const, text: JSON.stringify(result.data, null, 2) }] }
  },
}
