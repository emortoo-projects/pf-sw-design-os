import { z } from 'zod'
import type { AuthContext } from '../auth'
import { getActiveStageOutput } from './helpers'

export const getDataModelTool = {
  name: 'getDataModel',
  description: 'Get the Data Model (Stage 2) — entities, attributes, relationships, and constraints.',
  schema: z.object({}),
  handler: async (auth: AuthContext) => {
    const result = await getActiveStageOutput(auth, 'dataModel')
    if (result.error) {
      return { content: [{ type: 'text' as const, text: JSON.stringify({ error: result.error }) }] }
    }
    return { content: [{ type: 'text' as const, text: JSON.stringify(result.data, null, 2) }] }
  },
}
