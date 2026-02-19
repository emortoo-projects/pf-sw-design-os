import { z } from 'zod'
import type { AuthContext } from '../auth'
import { getActiveStageOutput } from './helpers'

export const getDesignTokensTool = {
  name: 'getDesignTokens',
  description: 'Get the Design System (Stage 6) — design tokens, colors, typography, spacing, and component styles.',
  schema: z.object({}),
  handler: async (auth: AuthContext) => {
    const result = await getActiveStageOutput(auth, 'design')
    if (result.error) {
      return { content: [{ type: 'text' as const, text: JSON.stringify({ error: result.error }) }] }
    }
    return { content: [{ type: 'text' as const, text: JSON.stringify(result.data, null, 2) }] }
  },
}
