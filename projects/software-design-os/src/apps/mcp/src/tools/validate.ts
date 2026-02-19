import { z } from 'zod'
import type { AuthContext } from '../auth'
import { getAllStageOutputs } from './helpers'

interface ValidationIssue {
  stage: string
  issue: string
}

interface CrossReferenceIssue {
  sourceStage: string
  targetStage: string
  issue: string
}

const STAGE_NAMES = ['product', 'dataModel', 'database', 'api', 'stack', 'design', 'sections', 'infrastructure']
const STAGE_LABELS: Record<string, string> = {
  product: 'Product Definition',
  dataModel: 'Data Model',
  database: 'Database Schema',
  api: 'API Specification',
  stack: 'Tech Stack',
  design: 'Design System',
  sections: 'Sections/Pages',
  infrastructure: 'Infrastructure',
}

export const validateTool = {
  name: 'validate',
  description: 'Cross-reference validation across all 8 design stages. Checks completeness, status, and consistency between stages (e.g., data model entities referenced in API endpoints).',
  schema: z.object({}),
  handler: async (auth: AuthContext) => {
    const results = await getAllStageOutputs(auth)

    const stageIssues: ValidationIssue[] = []
    const crossReferenceIssues: CrossReferenceIssue[] = []
    const stageStatuses: Array<{
      stage: string
      label: string
      status: string
      hasData: boolean
      version: number | null
    }> = []

    // Collect per-stage data for cross-referencing
    const stageData: Record<string, Record<string, unknown>> = {}

    for (let i = 0; i < STAGE_NAMES.length; i++) {
      const name = STAGE_NAMES[i]
      const label = STAGE_LABELS[name]
      const result = results[i]

      if (result.error) {
        stageStatuses.push({ stage: name, label, status: 'missing', hasData: false, version: null })
        stageIssues.push({ stage: name, issue: result.error })
        continue
      }

      const output = result.data!
      stageStatuses.push({
        stage: name,
        label,
        status: output.stageStatus,
        hasData: true,
        version: output.version,
      })

      stageData[name] = output.data

      if (output.stageStatus === 'locked') {
        stageIssues.push({ stage: name, issue: `Stage is locked — not yet started` })
      }
    }

    // Cross-reference: data model entities vs API endpoints
    if (stageData.dataModel && stageData.api) {
      const dm = stageData.dataModel
      const api = stageData.api

      // Extract entity names from data model
      const entityNames = extractNames(dm, ['entities', 'models', 'tables'])

      // Extract endpoint paths from API spec
      const endpointPaths = extractStringValues(api, ['endpoints', 'routes', 'paths'])

      if (entityNames.length > 0 && endpointPaths.length > 0) {
        for (const entity of entityNames) {
          const lower = entity.toLowerCase()
          const plural = lower.endsWith('s') ? lower : `${lower}s`
          const hasEndpoint = endpointPaths.some(
            (p) => p.toLowerCase().includes(lower) || p.toLowerCase().includes(plural),
          )
          if (!hasEndpoint) {
            crossReferenceIssues.push({
              sourceStage: 'dataModel',
              targetStage: 'api',
              issue: `Entity '${entity}' in data model has no corresponding API endpoint`,
            })
          }
        }
      }
    }

    // Cross-reference: data model entities vs database tables
    if (stageData.dataModel && stageData.database) {
      const entityNames = extractNames(stageData.dataModel, ['entities', 'models', 'tables'])
      const tableNames = extractNames(stageData.database, ['tables', 'schemas', 'migrations'])

      if (entityNames.length > 0 && tableNames.length > 0) {
        for (const entity of entityNames) {
          const lower = entity.toLowerCase().replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
          const plural = lower.endsWith('s') ? lower : `${lower}s`
          const hasTable = tableNames.some((t) => {
            const tl = t.toLowerCase()
            return tl === lower || tl === plural || tl === entity.toLowerCase()
          })
          if (!hasTable) {
            crossReferenceIssues.push({
              sourceStage: 'dataModel',
              targetStage: 'database',
              issue: `Entity '${entity}' in data model has no corresponding database table`,
            })
          }
        }
      }
    }

    const completedCount = stageStatuses.filter((s) => s.status === 'complete').length
    const valid = stageIssues.length === 0 && crossReferenceIssues.length === 0

    const summary = valid
      ? `All ${completedCount}/8 stages are valid with no cross-reference issues.`
      : `${completedCount}/8 stages complete. Found ${stageIssues.length} stage issue(s) and ${crossReferenceIssues.length} cross-reference issue(s).`

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          valid,
          summary,
          stages: stageStatuses,
          stageIssues,
          crossReferenceIssues,
        }, null, 2),
      }],
    }
  },
}

/** Extract names from known array keys in a data object. */
function extractNames(data: Record<string, unknown>, keys: string[]): string[] {
  const names: string[] = []
  for (const key of keys) {
    const arr = data[key]
    if (Array.isArray(arr)) {
      for (const item of arr) {
        if (typeof item === 'string') {
          names.push(item)
        } else if (item && typeof item === 'object') {
          const name = (item as Record<string, unknown>).name ?? (item as Record<string, unknown>).title ?? (item as Record<string, unknown>).id
          if (typeof name === 'string') names.push(name)
        }
      }
    }
  }
  return names
}

/** Extract string values (like paths) from known array keys. */
function extractStringValues(data: Record<string, unknown>, keys: string[]): string[] {
  const values: string[] = []
  for (const key of keys) {
    const arr = data[key]
    if (Array.isArray(arr)) {
      for (const item of arr) {
        if (typeof item === 'string') {
          values.push(item)
        } else if (item && typeof item === 'object') {
          const path = (item as Record<string, unknown>).path ?? (item as Record<string, unknown>).url ?? (item as Record<string, unknown>).route
          if (typeof path === 'string') values.push(path)
        }
      }
    } else if (typeof arr === 'object' && arr !== null) {
      // Handle OpenAPI-style paths object { "/users": {...}, "/posts": {...} }
      values.push(...Object.keys(arr as Record<string, unknown>))
    }
  }
  return values
}
