import { relations, sql } from 'drizzle-orm'
import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  decimal,
  jsonb,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core'

// ── Enums ────────────────────────────────────────────────────────────────────

export const providerTypeEnum = pgEnum('provider_type', [
  'anthropic',
  'openai',
  'openrouter',
  'deepseek',
  'kimi',
  'custom',
])
export const projectStatusEnum = pgEnum('project_status', ['active', 'archived', 'deleted'])
export const stageStatusEnum = pgEnum('stage_status', [
  'locked',
  'active',
  'generating',
  'review',
  'complete',
])
export const outputFormatEnum = pgEnum('output_format', ['json', 'md', 'sql', 'yaml'])
export const generatedByEnum = pgEnum('generated_by', ['ai', 'human'])
export const generationStatusEnum = pgEnum('generation_status', ['success', 'error', 'timeout'])
export const templateCategoryEnum = pgEnum('template_category', [
  'saas',
  'api',
  'landing',
  'mobile',
  'cli',
  'fullstack',
  'other',
])
export const exportFormatEnum = pgEnum('export_format', ['folder', 'zip'])
export const validationStatusEnum = pgEnum('validation_status', ['valid', 'warnings', 'errors'])
export const contractTypeEnum = pgEnum('contract_type', [
  'setup',
  'model',
  'api',
  'component',
  'page',
  'integration',
  'config',
])
export const contractStatusEnum = pgEnum('contract_status', [
  'backlog',
  'ready',
  'in_progress',
  'in_review',
  'done',
])
export const contractEventTypeEnum = pgEnum('contract_event_type', [
  'started',
  'submitted',
  'approved',
  'changes_requested',
  'rejected',
  'comment',
])
export const batchRunStatusEnum = pgEnum('batch_run_status', [
  'running',
  'completed',
  'stopped',
  'failed',
])

// ── Tables ───────────────────────────────────────────────────────────────────

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    passwordHash: varchar('password_hash', { length: 60 }),
    avatarUrl: text('avatar_url'),
    preferences: jsonb('preferences').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex('idx_users_email').on(table.email)],
)

export const aiProviderConfigs = pgTable(
  'ai_provider_configs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: providerTypeEnum('provider').notNull(),
    label: varchar('label', { length: 255 }).notNull(),
    apiKeyEncrypted: text('api_key_encrypted').notNull(),
    defaultModel: varchar('default_model', { length: 100 }).notNull(),
    baseUrl: text('base_url'),
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_ai_configs_user').on(table.userId)],
)

export const templates = pgTable('templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: templateCategoryEnum('category').notNull(),
  icon: varchar('icon', { length: 50 }),
  stageDefaults: jsonb('stage_defaults').notNull(),
  isBuiltIn: boolean('is_built_in').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    description: text('description'),
    currentStage: integer('current_stage').default(1).notNull(),
    status: projectStatusEnum('status').default('active').notNull(),
    aiProviderId: uuid('ai_provider_id').references(() => aiProviderConfigs.id),
    templateId: uuid('template_id').references(() => templates.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
    automationConfig: jsonb('automation_config'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_projects_user').on(table.userId),
    uniqueIndex('idx_projects_user_slug')
      .on(table.userId, table.slug),
  ],
)

export const stages = pgTable(
  'stages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    stageNumber: integer('stage_number').notNull(),
    stageName: varchar('stage_name', { length: 20 }).notNull(),
    stageLabel: varchar('stage_label', { length: 50 }).notNull(),
    status: stageStatusEnum('status').default('locked').notNull(),
    data: jsonb('data'),
    userInput: text('user_input'),
    validatedAt: timestamp('validated_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('idx_stages_project_number').on(table.projectId, table.stageNumber),
    index('idx_stages_data').using('gin', table.data),
  ],
)

export const aiGenerations = pgTable(
  'ai_generations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    stageId: uuid('stage_id')
      .notNull()
      .references(() => stages.id, { onDelete: 'cascade' }),
    providerId: uuid('provider_id')
      .notNull()
      .references(() => aiProviderConfigs.id),
    model: varchar('model', { length: 100 }).notNull(),
    promptTemplate: varchar('prompt_template', { length: 100 }).notNull(),
    inputTokens: integer('input_tokens').notNull(),
    outputTokens: integer('output_tokens').notNull(),
    totalTokens: integer('total_tokens').notNull(),
    estimatedCost: decimal('estimated_cost', { precision: 10, scale: 6 }).notNull(),
    durationMs: integer('duration_ms').notNull(),
    status: generationStatusEnum('status').notNull(),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_generations_stage').on(table.stageId),
    index('idx_generations_created').on(table.createdAt),
  ],
)

export const stageOutputs = pgTable(
  'stage_outputs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    stageId: uuid('stage_id')
      .notNull()
      .references(() => stages.id, { onDelete: 'cascade' }),
    version: integer('version').notNull(),
    format: outputFormatEnum('format').notNull(),
    content: text('content').notNull(),
    generatedBy: generatedByEnum('generated_by').notNull(),
    aiGenerationId: uuid('ai_generation_id').references(() => aiGenerations.id),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_outputs_stage').on(table.stageId),
    uniqueIndex('idx_outputs_stage_version').on(table.stageId, table.version),
  ],
)

export const exportPackages = pgTable(
  'export_packages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    format: exportFormatEnum('format').notNull(),
    validationStatus: validationStatusEnum('validation_status').notNull(),
    validationMessages: jsonb('validation_messages'),
    filePath: text('file_path').notNull(),
    fileSizeBytes: integer('file_size_bytes').notNull(),
    exportedAt: timestamp('exported_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_exports_project').on(table.projectId)],
)

export const mcpTokens = pgTable(
  'mcp_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    tokenHash: varchar('token_hash', { length: 64 }).notNull(),
    tokenPrefix: varchar('token_prefix', { length: 16 }).notNull(),
    label: varchar('label', { length: 255 }).notNull(),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_mcp_token_hash').on(table.tokenHash),
    index('idx_mcp_tokens_project').on(table.projectId),
  ],
)

export const batchRuns = pgTable(
  'batch_runs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    status: batchRunStatusEnum('status').notNull(),
    config: jsonb('config'),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    tasksAttempted: integer('tasks_attempted').default(0).notNull(),
    tasksCompleted: integer('tasks_completed').default(0).notNull(),
    tasksFailed: integer('tasks_failed').default(0).notNull(),
    tasksParkedForReview: integer('tasks_parked_for_review').default(0).notNull(),
    report: jsonb('report'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_batch_runs_project').on(table.projectId),
  ],
)

export const promptContracts = pgTable(
  'prompt_contracts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    type: contractTypeEnum('type').notNull(),
    priority: integer('priority').notNull(),
    status: contractStatusEnum('status').default('backlog').notNull(),
    dependencies: jsonb('dependencies').default([]).notNull(),
    description: text('description'),
    userStory: text('user_story'),
    stack: jsonb('stack'),
    targetFiles: jsonb('target_files'),
    referenceFiles: jsonb('reference_files'),
    constraints: jsonb('constraints'),
    doNotTouch: jsonb('do_not_touch'),
    patterns: jsonb('patterns'),
    dataModels: jsonb('data_models'),
    apiEndpoints: jsonb('api_endpoints'),
    designTokens: jsonb('design_tokens'),
    componentSpec: jsonb('component_spec'),
    acceptanceCriteria: jsonb('acceptance_criteria'),
    testCases: jsonb('test_cases'),
    generatedPrompt: text('generated_prompt'),
    reviewSummary: text('review_summary'),
    reviewFeedback: text('review_feedback'),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    batchRunId: uuid('batch_run_id').references(() => batchRuns.id),
    qualityReport: jsonb('quality_report'),
    submittedAt: timestamp('submitted_at', { withTimezone: true }),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    reviewNotes: text('review_notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (table) => [
    index('idx_contracts_project').on(table.projectId),
    index('idx_contracts_project_status').on(table.projectId, table.status),
  ],
)

export const contractEvents = pgTable(
  'contract_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    contractId: uuid('contract_id')
      .notNull()
      .references(() => promptContracts.id, { onDelete: 'cascade' }),
    type: contractEventTypeEnum('type').notNull(),
    actor: varchar('actor', { length: 50 }).notNull(),
    message: text('message'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_contract_events_contract').on(table.contractId)],
)

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: varchar('token_hash', { length: 64 }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('idx_refresh_token_hash').on(table.tokenHash),
    index('idx_refresh_tokens_user').on(table.userId),
  ],
)

// ── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  aiProviderConfigs: many(aiProviderConfigs),
  mcpTokens: many(mcpTokens),
  refreshTokens: many(refreshTokens),
}))

export const aiProviderConfigsRelations = relations(aiProviderConfigs, ({ one }) => ({
  user: one(users, { fields: [aiProviderConfigs.userId], references: [users.id] }),
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  aiProvider: one(aiProviderConfigs, {
    fields: [projects.aiProviderId],
    references: [aiProviderConfigs.id],
  }),
  template: one(templates, { fields: [projects.templateId], references: [templates.id] }),
  stages: many(stages),
  exportPackages: many(exportPackages),
  mcpTokens: many(mcpTokens),
  promptContracts: many(promptContracts),
  batchRuns: many(batchRuns),
}))

export const stagesRelations = relations(stages, ({ one, many }) => ({
  project: one(projects, { fields: [stages.projectId], references: [projects.id] }),
  outputs: many(stageOutputs),
  generations: many(aiGenerations),
}))

export const aiGenerationsRelations = relations(aiGenerations, ({ one }) => ({
  stage: one(stages, { fields: [aiGenerations.stageId], references: [stages.id] }),
  provider: one(aiProviderConfigs, {
    fields: [aiGenerations.providerId],
    references: [aiProviderConfigs.id],
  }),
}))

export const stageOutputsRelations = relations(stageOutputs, ({ one }) => ({
  stage: one(stages, { fields: [stageOutputs.stageId], references: [stages.id] }),
  aiGeneration: one(aiGenerations, {
    fields: [stageOutputs.aiGenerationId],
    references: [aiGenerations.id],
  }),
}))

export const exportPackagesRelations = relations(exportPackages, ({ one }) => ({
  project: one(projects, { fields: [exportPackages.projectId], references: [projects.id] }),
}))

export const mcpTokensRelations = relations(mcpTokens, ({ one }) => ({
  user: one(users, { fields: [mcpTokens.userId], references: [users.id] }),
  project: one(projects, { fields: [mcpTokens.projectId], references: [projects.id] }),
}))

export const batchRunsRelations = relations(batchRuns, ({ one, many }) => ({
  project: one(projects, { fields: [batchRuns.projectId], references: [projects.id] }),
  contracts: many(promptContracts),
}))

export const promptContractsRelations = relations(promptContracts, ({ one, many }) => ({
  project: one(projects, { fields: [promptContracts.projectId], references: [projects.id] }),
  batchRun: one(batchRuns, { fields: [promptContracts.batchRunId], references: [batchRuns.id] }),
  events: many(contractEvents),
}))

export const contractEventsRelations = relations(contractEvents, ({ one }) => ({
  contract: one(promptContracts, { fields: [contractEvents.contractId], references: [promptContracts.id] }),
}))

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, { fields: [refreshTokens.userId], references: [users.id] }),
}))
