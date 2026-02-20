/**
 * Contract Generator Engine
 *
 * Pure deterministic function — no AI, no DB access.
 * Input: 8 stage data objects + project name.
 * Output: contract array with pre-assigned UUIDs.
 */

import type { ContractType, ContractStatus } from '@sdos/shared'

export interface ContractInput {
  id: string
  title: string
  type: ContractType
  priority: number
  status: ContractStatus
  dependencies: string[]
  description: string | null
  userStory: string | null
  stack: Record<string, unknown> | null
  targetFiles: string[] | null
  referenceFiles: string[] | null
  constraints: string[] | null
  doNotTouch: string[] | null
  patterns: string[] | null
  dataModels: Record<string, unknown>[] | null
  apiEndpoints: Record<string, unknown>[] | null
  designTokens: Record<string, unknown> | null
  componentSpec: Record<string, unknown> | null
  acceptanceCriteria: string[] | null
  testCases: string[] | null
  generatedPrompt: string | null
}

export interface StageData {
  product: Record<string, unknown>
  dataModel: Record<string, unknown>
  database: Record<string, unknown>
  api: Record<string, unknown>
  stack: Record<string, unknown>
  design: Record<string, unknown>
  sections: Record<string, unknown>
  infrastructure: Record<string, unknown>
}

// ── Pass 1: Extract contracts from stages ──────────────────────────────────

function extractContracts(stages: StageData, projectName: string): ContractInput[] {
  const contracts: ContractInput[] = []
  let priority = 1

  const stackData = stages.stack as { selections?: Record<string, string> }
  const stackSelections = stackData.selections ?? {}

  // Setup contract (from stack stage)
  const setupId = crypto.randomUUID()
  contracts.push({
    id: setupId,
    title: `Project Scaffold: ${projectName}`,
    type: 'setup',
    priority: priority++,
    status: 'backlog',
    dependencies: [],
    description: `Initialize the project with the selected tech stack, install dependencies, and set up the folder structure.`,
    userStory: `As a developer, I want a fully scaffolded project so I can start building features immediately.`,
    stack: stackSelections,
    targetFiles: ['package.json', 'tsconfig.json', 'src/'],
    referenceFiles: null,
    constraints: ['Follow the selected stack exactly', 'Use recommended project structure for the chosen framework'],
    doNotTouch: null,
    patterns: null,
    dataModels: null,
    apiEndpoints: null,
    designTokens: null,
    componentSpec: null,
    acceptanceCriteria: [
      'Project initializes without errors',
      'All dependencies from stack selection are installed',
      'Folder structure matches framework conventions',
      'Dev server starts successfully',
    ],
    testCases: ['Run dev server and verify it starts', 'Verify all deps are in package.json'],
    generatedPrompt: null,
  })

  // DB config contract (from database stage)
  const dbConfigId = crypto.randomUUID()
  contracts.push({
    id: dbConfigId,
    title: 'Database & ORM Configuration',
    type: 'config',
    priority: priority++,
    status: 'backlog',
    dependencies: [setupId],
    description: 'Set up the database connection, ORM configuration, and initial migration infrastructure.',
    userStory: 'As a developer, I want the database layer configured so I can define and migrate data models.',
    stack: stackSelections,
    targetFiles: ['src/db/', 'drizzle.config.ts'],
    referenceFiles: null,
    constraints: null,
    doNotTouch: null,
    patterns: null,
    dataModels: null,
    apiEndpoints: null,
    designTokens: null,
    componentSpec: null,
    acceptanceCriteria: [
      'Database connection is established',
      'ORM is configured with schema directory',
      'Migration infrastructure is in place',
    ],
    testCases: ['Verify DB connection with a simple query', 'Run initial migration'],
    generatedPrompt: null,
  })

  // Model contracts (from dataModel stage) — 1 per entity
  const dataModelData = stages.dataModel as { entities?: Array<{ name: string; fields?: Array<Record<string, unknown>> }> }
  const entities = dataModelData.entities ?? []
  const modelIds: Record<string, string> = {}

  for (const entity of entities) {
    const modelId = crypto.randomUUID()
    modelIds[entity.name.toLowerCase()] = modelId
    contracts.push({
      id: modelId,
      title: `Model: ${entity.name}`,
      type: 'model',
      priority: priority++,
      status: 'backlog',
      dependencies: [setupId, dbConfigId],
      description: `Define the ${entity.name} data model with its fields, relationships, and validation rules.`,
      userStory: `As a developer, I want the ${entity.name} model defined so I can store and query ${entity.name} data.`,
      stack: stackSelections,
      targetFiles: [`src/db/schema/${entity.name.toLowerCase()}.ts`, `src/models/${entity.name.toLowerCase()}.ts`],
      referenceFiles: null,
      constraints: ['Follow the entity definition exactly', 'Include all specified fields and types'],
      doNotTouch: null,
      patterns: ['Use ORM schema definition patterns'],
      dataModels: [{ name: entity.name, fields: entity.fields ?? [] }],
      apiEndpoints: null,
      designTokens: null,
      componentSpec: null,
      acceptanceCriteria: [
        `${entity.name} schema is defined with all fields`,
        'Migration runs without errors',
        'Type definitions are exported',
      ],
      testCases: [`Create and retrieve a ${entity.name} record`, `Validate required fields on ${entity.name}`],
      generatedPrompt: null,
    })
  }

  // API contracts (from api stage) — 1 per endpoint tag group
  const apiData = stages.api as { endpoints?: Array<{ path: string; method: string; tag?: string; description?: string; requestBody?: unknown; response?: unknown }> }
  const endpoints = apiData.endpoints ?? []
  const tagGroups: Record<string, typeof endpoints> = {}

  for (const ep of endpoints) {
    const tag = ep.tag ?? 'general'
    if (!tagGroups[tag]) tagGroups[tag] = []
    tagGroups[tag].push(ep)
  }

  const apiIds: Record<string, string> = {}
  for (const [tag, eps] of Object.entries(tagGroups)) {
    const apiId = crypto.randomUUID()
    apiIds[tag.toLowerCase()] = apiId

    // Find referenced entities from endpoint paths
    const referencedModelIds: string[] = [setupId]
    for (const ep of eps) {
      const pathParts = ep.path.split('/').filter((p) => p && !p.startsWith(':') && !p.startsWith('{'))
      for (const part of pathParts) {
        const singular = part.replace(/s$/, '').toLowerCase()
        if (modelIds[singular]) referencedModelIds.push(modelIds[singular])
        if (modelIds[part.toLowerCase()]) referencedModelIds.push(modelIds[part.toLowerCase()])
      }
    }

    contracts.push({
      id: apiId,
      title: `API: ${tag}`,
      type: 'api',
      priority: priority++,
      status: 'backlog',
      dependencies: [...new Set(referencedModelIds)],
      description: `Implement the ${tag} API endpoints: ${eps.map((e) => `${e.method} ${e.path}`).join(', ')}.`,
      userStory: `As a client, I want ${tag} API endpoints so I can manage ${tag} resources.`,
      stack: stackSelections,
      targetFiles: [`src/routes/${tag.toLowerCase()}.ts`],
      referenceFiles: null,
      constraints: ['Follow REST conventions', 'Include proper error handling and validation'],
      doNotTouch: null,
      patterns: ['Route handler pattern with Zod validation'],
      dataModels: null,
      apiEndpoints: eps.map((e) => ({ path: e.path, method: e.method, description: e.description, requestBody: e.requestBody, response: e.response })),
      designTokens: null,
      componentSpec: null,
      acceptanceCriteria: eps.map((e) => `${e.method} ${e.path} returns correct response`),
      testCases: eps.map((e) => `Test ${e.method} ${e.path} with valid and invalid inputs`),
      generatedPrompt: null,
    })
  }

  // Design system config contract (from design stage)
  const designData = stages.design as { colors?: Record<string, unknown>; typography?: Record<string, unknown>; spacing?: Record<string, unknown> }
  const designConfigId = crypto.randomUUID()
  contracts.push({
    id: designConfigId,
    title: 'Design System Tokens',
    type: 'config',
    priority: priority++,
    status: 'backlog',
    dependencies: [setupId],
    description: 'Set up the design system with color palette, typography scale, and spacing tokens.',
    userStory: 'As a developer, I want a consistent design system so all UI components share the same visual language.',
    stack: stackSelections,
    targetFiles: ['src/styles/tokens.css', 'tailwind.config.ts', 'src/lib/design-tokens.ts'],
    referenceFiles: null,
    constraints: ['Use CSS custom properties for runtime theming', 'Integrate with Tailwind if selected'],
    doNotTouch: null,
    patterns: ['Design token pattern'],
    dataModels: null,
    apiEndpoints: null,
    designTokens: {
      colors: designData.colors ?? null,
      typography: designData.typography ?? null,
      spacing: designData.spacing ?? null,
    },
    componentSpec: null,
    acceptanceCriteria: [
      'Color tokens are defined and accessible',
      'Typography scale is configured',
      'Spacing system is consistent',
    ],
    testCases: ['Verify tokens are applied to a sample component'],
    generatedPrompt: null,
  })

  // Component contracts — shared components referenced by 2+ sections
  const sectionsData = stages.sections as { sections?: Array<{ id?: string; name: string; route?: string; description?: string; components?: Array<{ name: string; props?: Record<string, unknown>; description?: string }>; dataRequirements?: string[] }> }
  const sectionsList = sectionsData.sections ?? []

  // Count component references across sections
  const componentRefCount: Record<string, { name: string; refs: string[]; spec?: Record<string, unknown> }> = {}
  for (const section of sectionsList) {
    if (Array.isArray(section.components)) {
      for (const comp of section.components) {
        const key = comp.name.toLowerCase()
        if (!componentRefCount[key]) {
          componentRefCount[key] = { name: comp.name, refs: [], spec: comp }
        }
        componentRefCount[key].refs.push(section.name)
      }
    }
  }

  const sharedComponents = Object.values(componentRefCount).filter((c) => c.refs.length >= 2)
  const componentIds: Record<string, string> = {}

  for (const comp of sharedComponents) {
    const compId = crypto.randomUUID()
    componentIds[comp.name.toLowerCase()] = compId

    // Find referenced model IDs from component data requirements
    const compDeps: string[] = [setupId, designConfigId]
    // Check if any entity names match component references
    for (const entityName of Object.keys(modelIds)) {
      if (comp.name.toLowerCase().includes(entityName) || comp.refs.some((r) => r.toLowerCase().includes(entityName))) {
        compDeps.push(modelIds[entityName])
      }
    }

    contracts.push({
      id: compId,
      title: `Component: ${comp.name}`,
      type: 'component',
      priority: priority++,
      status: 'backlog',
      dependencies: [...new Set(compDeps)],
      description: `Build the shared ${comp.name} component used by: ${comp.refs.join(', ')}.`,
      userStory: `As a user, I want a reusable ${comp.name} component for consistent UI across pages.`,
      stack: stackSelections,
      targetFiles: [`src/components/${comp.name.toLowerCase()}.tsx`],
      referenceFiles: null,
      constraints: ['Must be reusable across all referencing sections'],
      doNotTouch: null,
      patterns: ['React component with props interface'],
      dataModels: null,
      apiEndpoints: null,
      designTokens: { colors: designData.colors ?? null, typography: designData.typography ?? null },
      componentSpec: comp.spec ?? null,
      acceptanceCriteria: [
        `${comp.name} renders correctly`,
        `${comp.name} accepts and uses all defined props`,
        `${comp.name} uses design tokens`,
      ],
      testCases: [`Render ${comp.name} with default props`, `Render ${comp.name} with all prop variants`],
      generatedPrompt: null,
    })
  }

  // Page contracts (from sections stage) — 1 per section
  for (const section of sectionsList) {
    const pageId = crypto.randomUUID()
    const pageDeps: string[] = [setupId, designConfigId]

    // Add component dependencies
    for (const compId of Object.values(componentIds)) {
      pageDeps.push(compId)
    }
    // Add API dependencies
    for (const apiId of Object.values(apiIds)) {
      pageDeps.push(apiId)
    }

    // Find relevant data models
    const pageDataModels: Record<string, unknown>[] = []
    if (Array.isArray(section.dataRequirements)) {
      for (const req of section.dataRequirements) {
        const entity = entities.find((e) => e.name.toLowerCase() === req.toLowerCase())
        if (entity) pageDataModels.push({ name: entity.name, fields: entity.fields ?? [] })
      }
    }

    // Find relevant API endpoints
    const pageEndpoints: Record<string, unknown>[] = []
    if (Array.isArray(section.dataRequirements)) {
      for (const req of section.dataRequirements) {
        const matchingEps = endpoints.filter((ep) => {
          const pathParts = ep.path.split('/').filter((p) => p && !p.startsWith(':'))
          return pathParts.some((part) => part.replace(/s$/, '').toLowerCase() === req.toLowerCase())
        })
        pageEndpoints.push(...matchingEps)
      }
    }

    contracts.push({
      id: pageId,
      title: `Page: ${section.name}`,
      type: 'page',
      priority: priority++,
      status: 'backlog',
      dependencies: [...new Set(pageDeps)],
      description: `Build the ${section.name} page${section.route ? ` at route ${section.route}` : ''}.${section.description ? ` ${section.description}` : ''}`,
      userStory: `As a user, I want the ${section.name} page so I can ${section.description ?? `access ${section.name} functionality`}.`,
      stack: stackSelections,
      targetFiles: [`src/pages/${(section.name ?? 'unnamed').toLowerCase().replace(/\s+/g, '-')}.tsx`],
      referenceFiles: null,
      constraints: null,
      doNotTouch: null,
      patterns: ['Page component with data fetching'],
      dataModels: pageDataModels.length > 0 ? pageDataModels : null,
      apiEndpoints: pageEndpoints.length > 0 ? pageEndpoints : null,
      designTokens: { colors: designData.colors ?? null },
      componentSpec: section.components ? { components: section.components } : null,
      acceptanceCriteria: [
        `${section.name} page renders correctly`,
        section.route ? `Page is accessible at ${section.route}` : 'Page is accessible via navigation',
        'Data is fetched and displayed',
      ],
      testCases: [`Render ${section.name} page`, `Navigate to ${section.name} and verify content`],
      generatedPrompt: null,
    })
  }

  // Integration contracts (from infrastructure stage) — 1 per infra concern
  const infraData = stages.infrastructure as { docker?: { dockerfile?: string; compose?: string }; cicd?: Record<string, unknown>; env?: Record<string, unknown> }

  if (infraData.docker) {
    const dockerId = crypto.randomUUID()
    contracts.push({
      id: dockerId,
      title: 'Integration: Docker',
      type: 'integration',
      priority: priority++,
      status: 'backlog',
      dependencies: [setupId],
      description: 'Set up Docker containerization with Dockerfile and docker-compose configuration.',
      userStory: 'As a developer, I want Docker configuration so I can run the app in containers.',
      stack: stackSelections,
      targetFiles: ['Dockerfile', 'docker-compose.yml', '.dockerignore'],
      referenceFiles: null,
      constraints: ['Use multi-stage builds for production', 'Include health checks'],
      doNotTouch: null,
      patterns: null,
      dataModels: null,
      apiEndpoints: null,
      designTokens: null,
      componentSpec: null,
      acceptanceCriteria: [
        'Docker image builds successfully',
        'Container starts and serves the application',
        'docker-compose orchestrates all services',
      ],
      testCases: ['Build Docker image', 'Run container and verify health check'],
      generatedPrompt: null,
    })
  }

  if (infraData.cicd) {
    const cicdId = crypto.randomUUID()
    contracts.push({
      id: cicdId,
      title: 'Integration: CI/CD Pipeline',
      type: 'integration',
      priority: priority++,
      status: 'backlog',
      dependencies: [setupId],
      description: 'Set up continuous integration and deployment pipeline.',
      userStory: 'As a developer, I want CI/CD so code is automatically tested and deployed.',
      stack: stackSelections,
      targetFiles: ['.github/workflows/ci.yml'],
      referenceFiles: null,
      constraints: null,
      doNotTouch: null,
      patterns: null,
      dataModels: null,
      apiEndpoints: null,
      designTokens: null,
      componentSpec: null,
      acceptanceCriteria: ['CI pipeline runs on push', 'Tests pass in CI', 'Deployment triggers on main branch'],
      testCases: ['Push a commit and verify CI runs'],
      generatedPrompt: null,
    })
  }

  if (infraData.env) {
    const envId = crypto.randomUUID()
    contracts.push({
      id: envId,
      title: 'Integration: Environment Configuration',
      type: 'integration',
      priority: priority++,
      status: 'backlog',
      dependencies: [setupId],
      description: 'Set up environment variable management and configuration.',
      userStory: 'As a developer, I want env configuration so the app works across environments.',
      stack: stackSelections,
      targetFiles: ['.env.example', 'src/config/env.ts'],
      referenceFiles: null,
      constraints: ['Never commit actual secrets', 'Validate env vars at startup'],
      doNotTouch: ['.env'],
      patterns: null,
      dataModels: null,
      apiEndpoints: null,
      designTokens: null,
      componentSpec: null,
      acceptanceCriteria: ['.env.example documents all required vars', 'App validates env on startup'],
      testCases: ['Start app with missing env var and verify error message'],
      generatedPrompt: null,
    })
  }

  // If no specific infra concerns, add a generic one
  if (!infraData.docker && !infraData.cicd && !infraData.env) {
    const infraId = crypto.randomUUID()
    contracts.push({
      id: infraId,
      title: 'Integration: Infrastructure Setup',
      type: 'integration',
      priority: priority++,
      status: 'backlog',
      dependencies: [setupId],
      description: 'Set up infrastructure configuration based on the infrastructure design.',
      userStory: 'As a developer, I want infrastructure configured for deployment.',
      stack: stackSelections,
      targetFiles: [],
      referenceFiles: null,
      constraints: null,
      doNotTouch: null,
      patterns: null,
      dataModels: null,
      apiEndpoints: null,
      designTokens: null,
      componentSpec: null,
      acceptanceCriteria: ['Infrastructure is configured per spec'],
      testCases: ['Verify infrastructure setup'],
      generatedPrompt: null,
    })
  }

  return contracts
}

// ── Pass 3: Set initial status ─────────────────────────────────────────────

function setInitialStatuses(contracts: ContractInput[]): void {
  for (const contract of contracts) {
    contract.status = contract.dependencies.length === 0 ? 'ready' : 'backlog'
  }
}

// ── Pass 4: Generate prompts ───────────────────────────────────────────────

function generatePrompt(contract: ContractInput): string {
  const lines: string[] = ['<contract>']

  // Task section
  lines.push('  <task>')
  lines.push(`    <title>${escapeXml(contract.title)}</title>`)
  lines.push(`    <type>${contract.type}</type>`)
  if (contract.userStory) lines.push(`    <user_story>${escapeXml(contract.userStory)}</user_story>`)
  if (contract.description) lines.push(`    <description>${escapeXml(contract.description)}</description>`)
  lines.push('  </task>')

  // Context section
  lines.push('  <context>')
  if (contract.stack) lines.push(`    <stack>${escapeXml(JSON.stringify(contract.stack))}</stack>`)
  if (contract.dataModels) lines.push(`    <data_models>${escapeXml(JSON.stringify(contract.dataModels))}</data_models>`)
  if (contract.apiEndpoints) lines.push(`    <api_endpoints>${escapeXml(JSON.stringify(contract.apiEndpoints))}</api_endpoints>`)
  if (contract.designTokens) lines.push(`    <design_tokens>${escapeXml(JSON.stringify(contract.designTokens))}</design_tokens>`)
  lines.push('  </context>')

  // Implementation section
  lines.push('  <implementation>')
  if (contract.targetFiles) lines.push(`    <target_files>${escapeXml(JSON.stringify(contract.targetFiles))}</target_files>`)
  if (contract.referenceFiles) lines.push(`    <reference_files>${escapeXml(JSON.stringify(contract.referenceFiles))}</reference_files>`)
  if (contract.patterns) lines.push(`    <patterns>${escapeXml(JSON.stringify(contract.patterns))}</patterns>`)
  if (contract.constraints) lines.push(`    <constraints>${escapeXml(JSON.stringify(contract.constraints))}</constraints>`)
  if (contract.doNotTouch) lines.push(`    <do_not_touch>${escapeXml(JSON.stringify(contract.doNotTouch))}</do_not_touch>`)
  lines.push('  </implementation>')

  // Component spec
  if (contract.componentSpec) {
    lines.push(`  <component_spec>${escapeXml(JSON.stringify(contract.componentSpec))}</component_spec>`)
  }

  // Acceptance criteria
  if (contract.acceptanceCriteria && contract.acceptanceCriteria.length > 0) {
    lines.push('  <acceptance_criteria>')
    for (const ac of contract.acceptanceCriteria) {
      lines.push(`    <criterion>${escapeXml(ac)}</criterion>`)
    }
    lines.push('  </acceptance_criteria>')
  }

  // Test cases
  if (contract.testCases && contract.testCases.length > 0) {
    lines.push('  <test_cases>')
    for (const tc of contract.testCases) {
      lines.push(`    <test>${escapeXml(tc)}</test>`)
    }
    lines.push('  </test_cases>')
  }

  lines.push('</contract>')
  return lines.join('\n')
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ── Main entry point ───────────────────────────────────────────────────────

export function generateContracts(stages: StageData, projectName: string): ContractInput[] {
  // Pass 1 + 2: Extract contracts with dependencies already wired
  const contracts = extractContracts(stages, projectName)

  // Pass 3: Set initial statuses based on dependencies
  setInitialStatuses(contracts)

  // Pass 4: Generate prompts
  for (const contract of contracts) {
    contract.generatedPrompt = generatePrompt(contract)
  }

  return contracts
}
