import { z } from 'zod'
import type { AuthContext } from '../auth'
import { getActiveStageOutput } from './helpers'

export const getSectionTool = {
  name: 'getSection',
  description: 'Get the Sections/Pages (Stage 7) — page layouts, component hierarchy, and navigation structure. Optionally filter by section name.',
  schema: z.object({
    sectionName: z.string().optional().describe('Optional section name to filter results (e.g., "dashboard", "settings")'),
  }),
  handler: async (auth: AuthContext, args: { sectionName?: string }) => {
    const result = await getActiveStageOutput(auth, 'sections')
    if (result.error) {
      return { content: [{ type: 'text' as const, text: JSON.stringify({ error: result.error }) }] }
    }

    if (args.sectionName && result.data) {
      const sections = result.data.data as Record<string, unknown>
      // Try to find a matching section by key (case-insensitive)
      const target = args.sectionName.toLowerCase()
      const filtered: Record<string, unknown> = {}
      let found = false

      // Search top-level keys
      for (const [key, value] of Object.entries(sections)) {
        if (key.toLowerCase().includes(target)) {
          filtered[key] = value
          found = true
        }
      }

      // Also check if there's a 'sections' or 'pages' array
      const arrayKey = Object.keys(sections).find(
        (k) => k.toLowerCase() === 'sections' || k.toLowerCase() === 'pages',
      )
      if (arrayKey && Array.isArray(sections[arrayKey])) {
        const matchingItems = (sections[arrayKey] as Array<Record<string, unknown>>).filter(
          (item) => {
            const name = String(item.name ?? item.title ?? item.id ?? '').toLowerCase()
            return name.includes(target)
          },
        )
        if (matchingItems.length > 0) {
          filtered[arrayKey] = matchingItems
          found = true
        }
      }

      if (found) {
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({ ...result.data, data: filtered }, null, 2),
          }],
        }
      }

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ error: `Section '${args.sectionName}' not found. Available data keys: ${Object.keys(sections).join(', ')}` }),
        }],
      }
    }

    return { content: [{ type: 'text' as const, text: JSON.stringify(result.data, null, 2) }] }
  },
}
