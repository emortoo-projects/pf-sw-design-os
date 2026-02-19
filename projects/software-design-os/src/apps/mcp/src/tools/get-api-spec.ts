import { z } from 'zod'
import type { AuthContext } from '../auth'
import { getActiveStageOutput } from './helpers'

export const getApiSpecTool = {
  name: 'getApiSpec',
  description: 'Get the API Specification (Stage 4) — endpoints, request/response schemas, authentication, and error codes.',
  schema: z.object({}),
  handler: async (auth: AuthContext) => {
    const result = await getActiveStageOutput(auth, 'api')
    if (result.error) {
      return { content: [{ type: 'text' as const, text: JSON.stringify({ error: result.error }) }] }
    }
    return { content: [{ type: 'text' as const, text: JSON.stringify(result.data, null, 2) }] }
  },
}
