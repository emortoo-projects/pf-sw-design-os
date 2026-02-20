import type {
  ExportPreviewData,
  SDPFileNode,
  SDPFolderNode,
  SDPManifest,
  SDPTreeNode,
  ValidationResult,
  ValidationSeverity,
} from './types'
import { generateId } from './types'

import type { Stage } from '@sdos/shared'

export interface StageInputs {
  product: Record<string, unknown>
  dataModel: Record<string, unknown>
  database: Record<string, unknown>
  api: Record<string, unknown>
  stack: Record<string, unknown>
  design: Record<string, unknown>
  sections: Record<string, unknown>
  infrastructure: Record<string, unknown>
}

type InputStageName = keyof StageInputs

const REQUIRED_STAGE_NAMES: InputStageName[] = [
  'product', 'dataModel', 'database', 'api',
  'stack', 'design', 'sections', 'infrastructure',
]

/**
 * Maps Stage[] (stages 1-8) into StageInputs for assembleSDPFromStages().
 * Returns null if any required stage is missing data.
 */
export function buildStageInputsFromStages(stages: Stage[]): StageInputs | null {
  const inputs: Partial<StageInputs> = {}
  for (const name of REQUIRED_STAGE_NAMES) {
    const stage = stages.find((s) => s.stageName === name)
    // Require real generated/edited data — ignore interview-only data
    const hasRealData =
      !!stage?.data &&
      Object.keys(stage.data).length > 0 &&
      !('_interviewAnswers' in stage.data)
    if (!hasRealData) return null
    inputs[name] = stage!.data
  }
  return inputs as StageInputs
}

function makeFile(
  name: string,
  format: SDPFileNode['format'],
  content: string,
): SDPFileNode {
  return {
    name,
    type: 'file',
    format,
    content,
    sizeBytes: new TextEncoder().encode(content).length,
    validation: 'pass',
  }
}

function makeFolder(name: string, children: SDPTreeNode[]): SDPFolderNode {
  return { name, type: 'folder', children }
}

// --- Build file tree ---

function buildFileTree(stages: StageInputs): SDPFolderNode {
  const productFolder = makeFolder('product', [
    makeFile('definition.json', 'json', JSON.stringify(stages.product, null, 2)),
  ])

  const dataModelFolder = makeFolder('data-model', [
    makeFile('entities.json', 'json', JSON.stringify(stages.dataModel, null, 2)),
  ])

  const dbData = stages.database as Record<string, unknown>
  const databaseChildren: SDPTreeNode[] = [
    makeFile('schema-config.json', 'json', JSON.stringify(stages.database, null, 2)),
  ]
  if (typeof dbData.schema === 'string') {
    databaseChildren.push(makeFile('schema.sql', 'sql', dbData.schema))
  }
  const databaseFolder = makeFolder('database', databaseChildren)

  const apiFolder = makeFolder('api', [
    makeFile('design.json', 'json', JSON.stringify(stages.api, null, 2)),
  ])

  const stackFolder = makeFolder('stack', [
    makeFile('selection.json', 'json', JSON.stringify(stages.stack, null, 2)),
  ])

  const designFolder = makeFolder('design', [
    makeFile('design-system.json', 'json', JSON.stringify(stages.design, null, 2)),
  ])

  const sectionsData = stages.sections as { sections?: Array<{ id: string; name: string }> }
  const sectionChildren: SDPTreeNode[] = []
  if (Array.isArray(sectionsData.sections)) {
    for (const section of sectionsData.sections) {
      const name = section.name ?? section.id ?? 'unnamed'
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'unnamed'
      sectionChildren.push(
        makeFile(`${slug}.json`, 'json', JSON.stringify(section, null, 2)),
      )
    }
  }
  if (sectionChildren.length === 0) {
    sectionChildren.push(
      makeFile('sections.json', 'json', JSON.stringify(stages.sections, null, 2)),
    )
  }
  const sectionsFolder = makeFolder('sections', sectionChildren)

  const infraData = stages.infrastructure as Record<string, unknown>
  const infraChildren: SDPTreeNode[] = [
    makeFile('config.json', 'json', JSON.stringify(stages.infrastructure, null, 2)),
  ]
  const docker = infraData.docker as { dockerfile?: string; compose?: string } | undefined
  if (docker?.dockerfile) {
    infraChildren.push(makeFile('Dockerfile', 'yaml', docker.dockerfile))
  }
  if (docker?.compose) {
    infraChildren.push(makeFile('docker-compose.yml', 'yaml', docker.compose))
  }
  const infrastructureFolder = makeFolder('infrastructure', infraChildren)

  return makeFolder('sdp', [
    productFolder,
    dataModelFolder,
    databaseFolder,
    apiFolder,
    stackFolder,
    designFolder,
    sectionsFolder,
    infrastructureFolder,
  ])
}

// --- Generate manifest ---

function generateManifest(
  stages: StageInputs,
  tree: SDPFolderNode,
): SDPManifest {
  const productData = stages.product as { name?: string }
  const name = productData.name ?? 'Untitled Project'

  const stageStatuses: Record<string, string> = {
    product: 'complete',
    dataModel: 'complete',
    database: 'complete',
    api: 'complete',
    stack: 'complete',
    design: 'complete',
    sections: 'complete',
    infrastructure: 'complete',
  }

  const files: Record<string, string | string[]> = {}
  function collectFiles(node: SDPTreeNode, path: string) {
    if (node.type === 'file') {
      const fullPath = `${path}/${node.name}`
      const folder = path.split('/').pop() ?? ''
      if (!files[folder]) {
        files[folder] = fullPath
      } else if (Array.isArray(files[folder])) {
        ;(files[folder] as string[]).push(fullPath)
      } else {
        files[folder] = [files[folder] as string, fullPath]
      }
    } else {
      for (const child of node.children) {
        collectFiles(child, `${path}/${node.name}`)
      }
    }
  }
  for (const child of tree.children) {
    collectFiles(child, tree.name)
  }

  return {
    name,
    version: '1.0.0',
    schemaVersion: '1.0.0',
    stages: stageStatuses,
    files,
  }
}

// --- Generate README ---

function generateReadme(stages: StageInputs): string {
  const productData = stages.product as {
    name?: string
    tagline?: string
    description?: string
    features?: Array<{ name: string; description: string }>
  }
  const sectionsData = stages.sections as {
    sections?: Array<{ name: string; route: string; description: string }>
  }
  const stackData = stages.stack as {
    selections?: Record<string, string>
  }

  const name = productData.name ?? 'Untitled Project'
  const tagline = productData.tagline ?? ''
  const description = productData.description ?? ''

  const lines: string[] = [
    `# ${name}`,
    '',
    tagline ? `> ${tagline}` : '',
    '',
    '## Overview',
    '',
    description,
    '',
    '## Stages',
    '',
    '| # | Stage | Status |',
    '|---|-------|--------|',
    '| 1 | Product Definition | Complete |',
    '| 2 | Data Model | Complete |',
    '| 3 | Database Design | Complete |',
    '| 4 | API Design | Complete |',
    '| 5 | Stack Selection | Complete |',
    '| 6 | Design System | Complete |',
    '| 7 | Sections | Complete |',
    '| 8 | Infrastructure | Complete |',
    '',
  ]

  if (stackData.selections) {
    lines.push('## Tech Stack', '')
    for (const [key, value] of Object.entries(stackData.selections)) {
      lines.push(`- **${key}**: ${value}`)
    }
    lines.push('')
  }

  if (Array.isArray(sectionsData.sections) && sectionsData.sections.length > 0) {
    lines.push('## Sections', '')
    for (const section of sectionsData.sections) {
      lines.push(`### ${section.name}`)
      lines.push(`- **Route**: \`${section.route}\``)
      lines.push(`- ${section.description}`)
      lines.push('')
    }
  }

  if (Array.isArray(productData.features) && productData.features.length > 0) {
    lines.push('## Features', '')
    for (const feature of productData.features) {
      lines.push(`- **${feature.name}**: ${feature.description}`)
    }
    lines.push('')
  }

  lines.push(
    '## AI Agent Quick-Start',
    '',
    'This SDP (Software Design Package) is designed to be consumed by AI coding agents.',
    '',
    '1. Read `sdp.json` for the manifest and file map',
    '2. Start with `product/definition.json` for product context',
    '3. Use `data-model/entities.json` for entity relationships',
    '4. Reference `api/design.json` for endpoint specifications',
    '5. Check `design/design-system.json` for UI tokens and patterns',
    '6. Review `sections/` for component architecture per page',
    '7. Use `infrastructure/` for deployment configuration',
    '',
    '---',
    '',
    `*Generated by Software Design OS*`,
  )

  return lines.filter((l) => l !== undefined).join('\n')
}

// --- Validation ---

function runValidation(stages: StageInputs): ValidationResult[] {
  const results: ValidationResult[] = []

  const dataModel = stages.dataModel as {
    entities?: Array<{ name: string; fields?: Array<{ name: string }> }>
  }
  const apiData = stages.api as {
    endpoints?: Array<{ path: string; method: string; tag?: string }>
  }
  const designData = stages.design as {
    colors?: Record<string, unknown>
    typography?: Record<string, unknown>
    spacing?: Record<string, unknown>
  }
  const sectionsData = stages.sections as {
    sections?: Array<{
      name: string
      dataRequirements?: string[]
    }>
  }

  const entityNames = new Set(
    (dataModel.entities ?? []).map((e) => e.name.toLowerCase()),
  )

  // 1. Entity references — check API paths against data model entities
  if (apiData.endpoints) {
    for (const ep of apiData.endpoints) {
      const pathParts = ep.path
        .split('/')
        .filter((p) => p && !p.startsWith(':'))
      const matchesEntity = pathParts.some((part) => {
        const singular = part.replace(/s$/, '').toLowerCase()
        return entityNames.has(singular) || entityNames.has(part.toLowerCase())
      })
      if (matchesEntity) {
        results.push({
          id: generateId('val'),
          category: 'entity-references',
          severity: 'pass',
          message: `${ep.method} ${ep.path} maps to a known data model entity`,
          source: ep.path,
        })
      } else {
        results.push({
          id: generateId('val'),
          category: 'entity-references',
          severity: 'warning',
          message: `${ep.method} ${ep.path} does not map to a known data model entity`,
          source: ep.path,
        })
      }
    }
  }

  // 2. API endpoint validity — verify endpoints have valid methods and auth
  if (apiData.endpoints) {
    const validMethods = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'])
    for (const ep of apiData.endpoints) {
      if (!validMethods.has(ep.method)) {
        results.push({
          id: generateId('val'),
          category: 'api-endpoint-validity',
          severity: 'error',
          message: `Invalid HTTP method "${ep.method}" on ${ep.path}`,
          source: `${ep.method} ${ep.path}`,
        })
      } else {
        results.push({
          id: generateId('val'),
          category: 'api-endpoint-validity',
          severity: 'pass',
          message: `${ep.method} ${ep.path} uses a valid HTTP method`,
          source: `${ep.method} ${ep.path}`,
        })
      }
    }
  }

  // 3. Design token consistency — confirm colors, typography, spacing are defined
  const tokenChecks: Array<{ key: string; label: string }> = [
    { key: 'colors', label: 'Color palette' },
    { key: 'typography', label: 'Typography scale' },
    { key: 'spacing', label: 'Spacing system' },
  ]
  for (const check of tokenChecks) {
    const value = designData[check.key as keyof typeof designData]
    if (value && typeof value === 'object' && Object.keys(value).length > 0) {
      results.push({
        id: generateId('val'),
        category: 'design-token-consistency',
        severity: 'pass',
        message: `${check.label} is defined with ${Object.keys(value).length} entries`,
        source: `design.${check.key}`,
      })
    } else {
      results.push({
        id: generateId('val'),
        category: 'design-token-consistency',
        severity: 'warning',
        message: `${check.label} is missing or empty`,
        source: `design.${check.key}`,
      })
    }
  }

  // 4. Section data requirements — check dataRequirements against entity names
  if (sectionsData.sections) {
    for (const section of sectionsData.sections) {
      if (Array.isArray(section.dataRequirements)) {
        for (const req of section.dataRequirements) {
          if (entityNames.has(req.toLowerCase())) {
            results.push({
              id: generateId('val'),
              category: 'section-data-requirements',
              severity: 'pass',
              message: `Section "${section.name}" requires "${req}" — found in data model`,
              source: section.name,
              target: req,
            })
          } else {
            results.push({
              id: generateId('val'),
              category: 'section-data-requirements',
              severity: 'warning',
              message: `Section "${section.name}" requires "${req}" — not found in data model`,
              source: section.name,
              target: req,
            })
          }
        }
      }
    }
  }

  return results
}

// --- Apply validation to tree ---

function getWorstSeverity(a: ValidationSeverity, b: ValidationSeverity): ValidationSeverity {
  const rank: Record<ValidationSeverity, number> = { pass: 0, warning: 1, error: 2 }
  return rank[a] >= rank[b] ? a : b
}

const FOLDER_CATEGORY_MAP: Record<string, string[]> = {
  product: ['entity-references'],
  'data-model': ['entity-references'],
  database: ['entity-references'],
  api: ['entity-references', 'api-endpoint-validity'],
  design: ['design-token-consistency'],
  sections: ['section-data-requirements'],
}

function applyValidationToTree(
  tree: SDPFolderNode,
  results: ValidationResult[],
): void {
  // Pre-compute worst severity per category once
  const worstByCategory: Record<string, ValidationSeverity> = {}
  for (const r of results) {
    worstByCategory[r.category] = getWorstSeverity(
      worstByCategory[r.category] ?? 'pass',
      r.severity,
    )
  }

  function applyToNode(node: SDPTreeNode, folderName: string) {
    if (node.type === 'folder') {
      for (const child of node.children) {
        applyToNode(child, node.name)
      }
    } else {
      const relevantCategories = FOLDER_CATEGORY_MAP[folderName] ?? []
      let worst: ValidationSeverity = 'pass'
      for (const cat of relevantCategories) {
        if (worstByCategory[cat]) {
          worst = getWorstSeverity(worst, worstByCategory[cat])
        }
      }
      node.validation = worst
    }
  }

  for (const child of tree.children) {
    applyToNode(child, tree.name)
  }
}

// --- Calculate total size ---

function calculateTotalSize(node: SDPTreeNode): number {
  if (node.type === 'file') return node.sizeBytes
  return node.children.reduce((sum, child) => sum + calculateTotalSize(child), 0)
}

// --- Main assembly function ---

export function assembleSDPFromStages(stages: StageInputs): ExportPreviewData {
  const tree = buildFileTree(stages)
  const manifest = generateManifest(stages, tree)
  const readme = generateReadme(stages)
  const validation = runValidation(stages)

  // Add manifest and readme to tree root
  const manifestContent = JSON.stringify(manifest, null, 2)
  tree.children.push(makeFile('sdp.json', 'json', manifestContent))
  tree.children.push(makeFile('README.md', 'md', readme))

  // Apply validation severities to file nodes
  applyValidationToTree(tree, validation)

  const totalSizeBytes = calculateTotalSize(tree)

  return {
    manifest,
    tree,
    validation,
    readme,
    totalSizeBytes,
  }
}
