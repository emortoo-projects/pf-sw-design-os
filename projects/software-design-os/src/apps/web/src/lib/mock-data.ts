import type {
  ProjectWithStages,
  Stage,
  StageWithOutputs,
  StageOutput,
  AIGeneration,
  GenerateResponse,
  CompleteResponse,
  RevertResponse,
  StageStatus,
} from '@sdos/shared'
import { STAGE_CONFIGS } from '@sdos/shared'
import { assembleSDPFromStages } from '@/features/stages/export-preview'

const now = new Date().toISOString()
const yesterday = new Date(Date.now() - 86400000).toISOString()

const mockProductDefinition = {
  name: 'Software Design OS',
  tagline: 'The AI-native blueprint engine for building software',
  description:
    'Software Design OS is a hybrid human-AI tool that transforms software ideas into complete, machine-readable blueprints called Software Design Packages (SDPs). It provides a structured 9-stage pipeline that guides users from initial product vision through data modeling, API design, infrastructure planning, and UI specification.',
  problems: [
    {
      id: 'ps-1',
      problem: 'Unstructured handoff between product thinking and AI code generation',
      solution:
        'A 9-stage guided pipeline that captures every critical design decision in a structured format before any code is written',
    },
    {
      id: 'ps-2',
      problem: 'No standard machine-readable format for describing a complete software product',
      solution:
        'The Software Design Package (SDP) format — a portable, queryable specification with JSON for machines and Markdown for humans',
    },
    {
      id: 'ps-3',
      problem: 'Design decisions live in the developer\'s head instead of a shared document',
      solution:
        'Each pipeline stage explicitly captures decisions about database, API, stack, design tokens, and component architecture',
    },
    {
      id: 'ps-4',
      problem: 'Repetitive specification work for every new project',
      solution:
        'Template system for common product types that pre-fills pipeline stages, plus reusable design patterns',
    },
  ],
  features: [
    {
      id: 'f-1',
      name: '9-Stage Pipeline',
      description:
        'Guided progression through Product Definition, Data Model, Database Design, API Design, Programming Stack, Design System, Sections, Infrastructure, and Export',
    },
    {
      id: 'f-2',
      name: 'AI-Powered Generation',
      description:
        'Each pipeline stage uses AI to expand user input into structured specifications. Supports Claude, OpenAI, and any OpenAI-compatible provider',
    },
    {
      id: 'f-3',
      name: 'Dual-Format Output',
      description:
        'Every artifact exists as both structured JSON/YAML (for AI agents) and clean Markdown (for human review) simultaneously',
    },
    {
      id: 'f-4',
      name: 'Software Design Package Export',
      description:
        'Assembles all stage outputs into a portable SDP folder with manifest, cross-reference validation, and downloadable archive',
    },
    {
      id: 'f-5',
      name: 'MCP Server Interface',
      description:
        'Exposes SDP contents as queryable MCP tools so AI coding agents can pull exactly the context they need during development',
    },
    {
      id: 'f-6',
      name: 'Template System',
      description:
        'Reusable starting points for common product types (SaaS dashboard, API service, landing page) that pre-fill pipeline stages',
    },
  ],
  personas: [
    {
      id: 'p-1',
      name: 'Solo AI Builder',
      description:
        'Technical entrepreneur using AI coding agents (Claude Code, Cursor) to build products. Has strong product intuition but needs a structured way to communicate vision to AI agents.',
    },
    {
      id: 'p-2',
      name: 'Technical Product Manager',
      description:
        'PM at a startup writing PRDs that engineering teams or AI agents interpret inconsistently. Wants a structured format bridging product thinking and implementation.',
    },
    {
      id: 'p-3',
      name: 'AI Agent Orchestrator',
      description:
        'Developer managing multiple AI agents across platforms. Needs a single source of truth (SDP) that any agent can consume regardless of the coding platform.',
    },
  ],
}

const mockDataModel = {
  entities: [
    {
      id: 'e-user',
      name: 'User',
      description: 'The human operator of the tool',
      fields: [
        { id: 'f-u1', name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { id: 'f-u2', name: 'email', type: 'string', required: true, description: 'User email for auth' },
        { id: 'f-u3', name: 'name', type: 'string', required: true, description: 'Display name' },
        { id: 'f-u4', name: 'avatarUrl', type: 'string', required: false, description: 'Profile image URL' },
        { id: 'f-u5', name: 'preferences', type: 'jsonb', required: false, description: 'UI preferences' },
        { id: 'f-u6', name: 'createdAt', type: 'datetime', required: true, description: 'Account creation timestamp' },
        { id: 'f-u7', name: 'updatedAt', type: 'datetime', required: true, description: 'Last update timestamp' },
      ],
    },
    {
      id: 'e-project',
      name: 'Project',
      description: 'A single software design effort moving through the 9-stage pipeline',
      fields: [
        { id: 'f-p1', name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { id: 'f-p2', name: 'userId', type: 'uuid', required: true, description: 'FK to User (owner)' },
        { id: 'f-p3', name: 'name', type: 'string', required: true, description: 'Project name' },
        { id: 'f-p4', name: 'slug', type: 'string', required: true, description: 'URL-safe slug' },
        { id: 'f-p5', name: 'description', type: 'text', required: false, description: 'Brief project description' },
        { id: 'f-p6', name: 'currentStage', type: 'integer', required: true, description: 'Current active stage (1-9)' },
        { id: 'f-p7', name: 'status', type: 'enum(active,archived,deleted)', required: true, description: 'Project lifecycle status' },
        { id: 'f-p8', name: 'createdAt', type: 'datetime', required: true, description: 'Creation timestamp' },
        { id: 'f-p9', name: 'updatedAt', type: 'datetime', required: true, description: 'Last update timestamp' },
      ],
    },
    {
      id: 'e-stage',
      name: 'Stage',
      description: 'One of the 9 pipeline stages for a project',
      fields: [
        { id: 'f-s1', name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { id: 'f-s2', name: 'projectId', type: 'uuid', required: true, description: 'FK to Project' },
        { id: 'f-s3', name: 'stageNumber', type: 'integer', required: true, description: 'Stage position (1-9)' },
        { id: 'f-s4', name: 'stageName', type: 'enum(product,dataModel,database,api,stack,design,sections,infrastructure,export)', required: true, description: 'Stage identifier' },
        { id: 'f-s5', name: 'status', type: 'enum(locked,active,generating,review,complete)', required: true, description: 'Current stage lifecycle status' },
        { id: 'f-s6', name: 'data', type: 'jsonb', required: false, description: 'Stage data payload' },
        { id: 'f-s7', name: 'createdAt', type: 'datetime', required: true, description: 'Creation timestamp' },
        { id: 'f-s8', name: 'updatedAt', type: 'datetime', required: true, description: 'Last update timestamp' },
      ],
    },
    {
      id: 'e-stageoutput',
      name: 'StageOutput',
      description: 'A versioned output artifact from a stage',
      fields: [
        { id: 'f-o1', name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { id: 'f-o2', name: 'stageId', type: 'uuid', required: true, description: 'FK to Stage' },
        { id: 'f-o3', name: 'version', type: 'integer', required: true, description: 'Version number' },
        { id: 'f-o4', name: 'format', type: 'enum(json,md,sql,yaml)', required: true, description: 'Output file format' },
        { id: 'f-o5', name: 'content', type: 'text', required: true, description: 'The actual output content' },
        { id: 'f-o6', name: 'generatedBy', type: 'enum(ai,human)', required: true, description: 'AI or human authored' },
        { id: 'f-o7', name: 'isActive', type: 'boolean', required: true, description: 'Current active version' },
        { id: 'f-o8', name: 'createdAt', type: 'datetime', required: true, description: 'Creation timestamp' },
      ],
    },
  ],
  relationships: [
    { id: 'r-1', fromEntityId: 'e-user', toEntityId: 'e-project', type: 'one-to-many', foreignKey: 'userId', description: 'A user owns many projects' },
    { id: 'r-2', fromEntityId: 'e-project', toEntityId: 'e-stage', type: 'one-to-many', foreignKey: 'projectId', description: 'A project has exactly 9 stages' },
    { id: 'r-3', fromEntityId: 'e-stage', toEntityId: 'e-stageoutput', type: 'one-to-many', foreignKey: 'stageId', description: 'A stage has versioned outputs' },
  ],
}

const mockDatabaseSchema = {
  engine: 'postgresql',
  schema: `-- Software Design OS Database Schema
-- Engine: PostgreSQL 16
-- Generated from Data Model (Stage 2)

CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "name" VARCHAR(255) NOT NULL,
  "avatar_url" TEXT,
  "preferences" JSONB DEFAULT '{}',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "projects" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "current_stage" INTEGER NOT NULL DEFAULT 1 CHECK ("current_stage" BETWEEN 1 AND 9),
  "status" VARCHAR(20) NOT NULL DEFAULT 'active' CHECK ("status" IN ('active', 'archived', 'deleted')),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("user_id", "slug")
);

CREATE TABLE "stages" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "stage_number" INTEGER NOT NULL CHECK ("stage_number" BETWEEN 1 AND 9),
  "stage_name" VARCHAR(50) NOT NULL CHECK ("stage_name" IN ('product', 'dataModel', 'database', 'api', 'stack', 'design', 'sections', 'infrastructure', 'export')),
  "status" VARCHAR(20) NOT NULL DEFAULT 'locked' CHECK ("status" IN ('locked', 'active', 'generating', 'review', 'complete')),
  "data" JSONB,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("project_id", "stage_number")
);

CREATE TABLE "stage_outputs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "stage_id" UUID NOT NULL REFERENCES "stages"("id") ON DELETE CASCADE,
  "version" INTEGER NOT NULL,
  "format" VARCHAR(10) NOT NULL CHECK ("format" IN ('json', 'md', 'sql', 'yaml')),
  "content" TEXT NOT NULL,
  "generated_by" VARCHAR(10) NOT NULL CHECK ("generated_by" IN ('ai', 'human')),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("stage_id", "version")
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON "projects" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER stages_updated_at BEFORE UPDATE ON "stages" FOR EACH ROW EXECUTE FUNCTION update_updated_at();`,
  tables: [
    {
      name: 'users',
      columns: [
        { name: 'id', type: 'UUID', nullable: false, defaultValue: 'gen_random_uuid()', isPrimaryKey: true, isForeignKey: false },
        { name: 'email', type: 'VARCHAR(255)', nullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: 'name', type: 'VARCHAR(255)', nullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: 'avatar_url', type: 'TEXT', nullable: true, isPrimaryKey: false, isForeignKey: false },
        { name: 'preferences', type: 'JSONB', nullable: true, defaultValue: "'{}'", isPrimaryKey: false, isForeignKey: false },
        { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'NOW()', isPrimaryKey: false, isForeignKey: false },
        { name: 'updated_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'NOW()', isPrimaryKey: false, isForeignKey: false },
      ],
    },
    {
      name: 'projects',
      columns: [
        { name: 'id', type: 'UUID', nullable: false, defaultValue: 'gen_random_uuid()', isPrimaryKey: true, isForeignKey: false },
        { name: 'user_id', type: 'UUID', nullable: false, isPrimaryKey: false, isForeignKey: true, references: 'users(id)' },
        { name: 'name', type: 'VARCHAR(255)', nullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: 'slug', type: 'VARCHAR(255)', nullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: 'description', type: 'TEXT', nullable: true, isPrimaryKey: false, isForeignKey: false },
        { name: 'current_stage', type: 'INTEGER', nullable: false, defaultValue: '1', isPrimaryKey: false, isForeignKey: false },
        { name: 'status', type: 'VARCHAR(20)', nullable: false, defaultValue: "'active'", isPrimaryKey: false, isForeignKey: false },
        { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'NOW()', isPrimaryKey: false, isForeignKey: false },
        { name: 'updated_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'NOW()', isPrimaryKey: false, isForeignKey: false },
      ],
    },
    {
      name: 'stages',
      columns: [
        { name: 'id', type: 'UUID', nullable: false, defaultValue: 'gen_random_uuid()', isPrimaryKey: true, isForeignKey: false },
        { name: 'project_id', type: 'UUID', nullable: false, isPrimaryKey: false, isForeignKey: true, references: 'projects(id)' },
        { name: 'stage_number', type: 'INTEGER', nullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: 'stage_name', type: 'VARCHAR(50)', nullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: 'status', type: 'VARCHAR(20)', nullable: false, defaultValue: "'locked'", isPrimaryKey: false, isForeignKey: false },
        { name: 'data', type: 'JSONB', nullable: true, isPrimaryKey: false, isForeignKey: false },
        { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'NOW()', isPrimaryKey: false, isForeignKey: false },
        { name: 'updated_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'NOW()', isPrimaryKey: false, isForeignKey: false },
      ],
    },
    {
      name: 'stage_outputs',
      columns: [
        { name: 'id', type: 'UUID', nullable: false, defaultValue: 'gen_random_uuid()', isPrimaryKey: true, isForeignKey: false },
        { name: 'stage_id', type: 'UUID', nullable: false, isPrimaryKey: false, isForeignKey: true, references: 'stages(id)' },
        { name: 'version', type: 'INTEGER', nullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: 'format', type: 'VARCHAR(10)', nullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: 'content', type: 'TEXT', nullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: 'generated_by', type: 'VARCHAR(10)', nullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: 'is_active', type: 'BOOLEAN', nullable: false, defaultValue: 'true', isPrimaryKey: false, isForeignKey: false },
        { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'NOW()', isPrimaryKey: false, isForeignKey: false },
      ],
    },
  ],
  indexes: [
    { id: 'idx-1', table: 'users', columns: ['email'], type: 'unique', rationale: 'Fast lookup and uniqueness for authentication' },
    { id: 'idx-2', table: 'projects', columns: ['user_id'], type: 'btree', rationale: 'Efficient query for user\'s projects' },
    { id: 'idx-3', table: 'projects', columns: ['user_id', 'slug'], type: 'unique', rationale: 'Unique slugs per user for URL routing' },
    { id: 'idx-4', table: 'projects', columns: ['status'], type: 'btree', rationale: 'Filter projects by lifecycle status' },
    { id: 'idx-5', table: 'stages', columns: ['project_id', 'stage_number'], type: 'unique', rationale: 'Unique stage per project, fast ordered retrieval' },
    { id: 'idx-6', table: 'stages', columns: ['project_id'], type: 'btree', rationale: 'Efficient query for project stages' },
    { id: 'idx-7', table: 'stages', columns: ['data'], type: 'gin', rationale: 'Fast JSONB queries on stage data payload' },
    { id: 'idx-8', table: 'stage_outputs', columns: ['stage_id'], type: 'btree', rationale: 'Efficient query for stage outputs' },
    { id: 'idx-9', table: 'stage_outputs', columns: ['stage_id', 'version'], type: 'unique', rationale: 'Unique version per stage output' },
    { id: 'idx-10', table: 'stage_outputs', columns: ['stage_id', 'is_active'], type: 'btree', rationale: 'Fast lookup for active output version' },
  ],
  migrations: [
    { id: 'm-1', step: 1, name: '001_create_users', description: 'Create users table with UUID primary key, email uniqueness, and JSONB preferences', sql: 'CREATE TABLE "users" (...)' },
    { id: 'm-2', step: 2, name: '002_create_projects', description: 'Create projects table with FK to users, slug uniqueness per user, and status check constraint', sql: 'CREATE TABLE "projects" (...)' },
    { id: 'm-3', step: 3, name: '003_create_stages', description: 'Create stages table with FK to projects, unique stage number per project, and JSONB data field', sql: 'CREATE TABLE "stages" (...)' },
    { id: 'm-4', step: 4, name: '004_create_stage_outputs', description: 'Create stage_outputs table with FK to stages, versioning, and format constraints', sql: 'CREATE TABLE "stage_outputs" (...)' },
    { id: 'm-5', step: 5, name: '005_add_indexes', description: 'Add performance indexes: btree on FKs, unique on email/slug, GIN on JSONB', sql: 'CREATE INDEX ...' },
    { id: 'm-6', step: 6, name: '006_add_triggers', description: 'Add updated_at auto-update trigger function and apply to users, projects, stages tables', sql: 'CREATE FUNCTION update_updated_at() ...' },
  ],
}

const mockApiDesign = {
  style: 'rest',
  basePath: '/api',
  auth: {
    strategy: 'jwt',
    jwt: { tokenExpiry: '7d', refreshTokenExpiry: '30d' },
  },
  endpoints: [
    {
      id: 'ep-1',
      method: 'GET',
      path: '/users/me',
      summary: 'Get current user profile',
      tag: 'Users',
      params: [],
      response: {
        status: 200,
        contentType: 'application/json',
        schema: [
          { name: 'id', type: 'string', required: true, description: 'User UUID' },
          { name: 'email', type: 'string', required: true, description: 'User email' },
          { name: 'name', type: 'string', required: true, description: 'Display name' },
          { name: 'avatarUrl', type: 'string', required: false, description: 'Profile image URL' },
        ],
      },
      curlExample: "curl -X GET http://localhost:3000/api/users/me \\\n  -H 'Authorization: Bearer <token>'",
    },
    {
      id: 'ep-2',
      method: 'PUT',
      path: '/users/me',
      summary: 'Update current user profile',
      tag: 'Users',
      params: [],
      requestBody: {
        contentType: 'application/json',
        schema: [
          { name: 'name', type: 'string', required: false, description: 'Display name' },
          { name: 'avatarUrl', type: 'string', required: false, description: 'Profile image URL' },
        ],
      },
      response: {
        status: 200,
        contentType: 'application/json',
        schema: [
          { name: 'id', type: 'string', required: true },
          { name: 'email', type: 'string', required: true },
          { name: 'name', type: 'string', required: true },
          { name: 'avatarUrl', type: 'string', required: false },
        ],
      },
      curlExample: "curl -X PUT http://localhost:3000/api/users/me \\\n  -H 'Authorization: Bearer <token>' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"name\": \"New Name\"}'",
    },
    {
      id: 'ep-3',
      method: 'GET',
      path: '/projects',
      summary: 'List all projects for current user',
      tag: 'Projects',
      params: [
        { name: 'limit', in: 'query', type: 'integer', required: false, description: 'Max results (default 20)' },
        { name: 'cursor', in: 'query', type: 'string', required: false, description: 'Pagination cursor' },
      ],
      response: {
        status: 200,
        contentType: 'application/json',
        schema: [
          { name: 'data', type: 'array', required: true, description: 'List of projects' },
          { name: 'nextCursor', type: 'string', required: false, description: 'Next page cursor' },
        ],
      },
      curlExample: "curl -X GET 'http://localhost:3000/api/projects?limit=20' \\\n  -H 'Authorization: Bearer <token>'",
    },
    {
      id: 'ep-4',
      method: 'POST',
      path: '/projects',
      summary: 'Create a new project',
      tag: 'Projects',
      params: [],
      requestBody: {
        contentType: 'application/json',
        schema: [
          { name: 'name', type: 'string', required: true, description: 'Project name' },
          { name: 'description', type: 'string', required: false, description: 'Project description' },
        ],
      },
      response: {
        status: 201,
        contentType: 'application/json',
        schema: [
          { name: 'id', type: 'string', required: true },
          { name: 'name', type: 'string', required: true },
          { name: 'slug', type: 'string', required: true },
          { name: 'currentStage', type: 'integer', required: true },
        ],
      },
      curlExample: "curl -X POST http://localhost:3000/api/projects \\\n  -H 'Authorization: Bearer <token>' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"name\": \"My Project\"}'",
    },
    {
      id: 'ep-5',
      method: 'GET',
      path: '/projects/:id',
      summary: 'Get project by ID',
      tag: 'Projects',
      params: [
        { name: 'id', in: 'path', type: 'string', required: true, description: 'Project UUID' },
      ],
      response: {
        status: 200,
        contentType: 'application/json',
        schema: [
          { name: 'id', type: 'string', required: true },
          { name: 'name', type: 'string', required: true },
          { name: 'slug', type: 'string', required: true },
          { name: 'description', type: 'string', required: false },
          { name: 'currentStage', type: 'integer', required: true },
          { name: 'status', type: 'string', required: true },
        ],
      },
      curlExample: "curl -X GET http://localhost:3000/api/projects/:id \\\n  -H 'Authorization: Bearer <token>'",
    },
    {
      id: 'ep-6',
      method: 'PUT',
      path: '/projects/:id',
      summary: 'Update project',
      tag: 'Projects',
      params: [
        { name: 'id', in: 'path', type: 'string', required: true, description: 'Project UUID' },
      ],
      requestBody: {
        contentType: 'application/json',
        schema: [
          { name: 'name', type: 'string', required: false },
          { name: 'description', type: 'string', required: false },
        ],
      },
      response: {
        status: 200,
        contentType: 'application/json',
        schema: [
          { name: 'id', type: 'string', required: true },
          { name: 'name', type: 'string', required: true },
          { name: 'slug', type: 'string', required: true },
        ],
      },
      curlExample: "curl -X PUT http://localhost:3000/api/projects/:id \\\n  -H 'Authorization: Bearer <token>' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"name\": \"Updated Name\"}'",
    },
    {
      id: 'ep-7',
      method: 'DELETE',
      path: '/projects/:id',
      summary: 'Delete project',
      tag: 'Projects',
      params: [
        { name: 'id', in: 'path', type: 'string', required: true, description: 'Project UUID' },
      ],
      response: {
        status: 200,
        contentType: 'application/json',
        schema: [
          { name: 'success', type: 'boolean', required: true },
        ],
      },
      curlExample: "curl -X DELETE http://localhost:3000/api/projects/:id \\\n  -H 'Authorization: Bearer <token>'",
    },
    {
      id: 'ep-8',
      method: 'GET',
      path: '/projects/:id/stages',
      summary: 'List all stages for a project',
      tag: 'Stages',
      params: [
        { name: 'id', in: 'path', type: 'string', required: true, description: 'Project UUID' },
      ],
      response: {
        status: 200,
        contentType: 'application/json',
        schema: [
          { name: 'data', type: 'array', required: true, description: 'List of 9 stages' },
        ],
      },
      curlExample: "curl -X GET http://localhost:3000/api/projects/:id/stages \\\n  -H 'Authorization: Bearer <token>'",
    },
    {
      id: 'ep-9',
      method: 'GET',
      path: '/projects/:id/stages/:num',
      summary: 'Get stage by number',
      tag: 'Stages',
      params: [
        { name: 'id', in: 'path', type: 'string', required: true, description: 'Project UUID' },
        { name: 'num', in: 'path', type: 'integer', required: true, description: 'Stage number (1-9)' },
      ],
      response: {
        status: 200,
        contentType: 'application/json',
        schema: [
          { name: 'id', type: 'string', required: true },
          { name: 'stageNumber', type: 'integer', required: true },
          { name: 'stageName', type: 'string', required: true },
          { name: 'status', type: 'string', required: true },
          { name: 'data', type: 'object', required: false },
        ],
      },
      curlExample: "curl -X GET http://localhost:3000/api/projects/:id/stages/:num \\\n  -H 'Authorization: Bearer <token>'",
    },
    {
      id: 'ep-10',
      method: 'PUT',
      path: '/projects/:id/stages/:num',
      summary: 'Update stage data',
      tag: 'Stages',
      params: [
        { name: 'id', in: 'path', type: 'string', required: true, description: 'Project UUID' },
        { name: 'num', in: 'path', type: 'integer', required: true, description: 'Stage number (1-9)' },
      ],
      requestBody: {
        contentType: 'application/json',
        schema: [
          { name: 'data', type: 'object', required: true, description: 'Stage data payload' },
          { name: 'userInput', type: 'string', required: false, description: 'User guidance for AI' },
        ],
      },
      response: {
        status: 200,
        contentType: 'application/json',
        schema: [
          { name: 'id', type: 'string', required: true },
          { name: 'status', type: 'string', required: true },
          { name: 'data', type: 'object', required: false },
        ],
      },
      curlExample: "curl -X PUT http://localhost:3000/api/projects/:id/stages/:num \\\n  -H 'Authorization: Bearer <token>' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"data\": {...}}'",
    },
    {
      id: 'ep-11',
      method: 'POST',
      path: '/projects/:id/stages/:num/generate',
      summary: 'Trigger AI generation for stage',
      tag: 'Stages',
      params: [
        { name: 'id', in: 'path', type: 'string', required: true, description: 'Project UUID' },
        { name: 'num', in: 'path', type: 'integer', required: true, description: 'Stage number (1-9)' },
      ],
      requestBody: {
        contentType: 'application/json',
        schema: [
          { name: 'userInput', type: 'string', required: false, description: 'Additional guidance for the AI' },
        ],
      },
      response: {
        status: 200,
        contentType: 'application/json',
        schema: [
          { name: 'stage', type: 'object', required: true, description: 'Updated stage with generated data' },
          { name: 'output', type: 'object', required: true, description: 'Generated output artifact' },
          { name: 'generation', type: 'object', required: true, description: 'AI generation metadata' },
        ],
      },
      curlExample: "curl -X POST http://localhost:3000/api/projects/:id/stages/:num/generate \\\n  -H 'Authorization: Bearer <token>' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"userInput\": \"Focus on REST endpoints\"}'",
    },
    {
      id: 'ep-12',
      method: 'GET',
      path: '/projects/:id/stages/:num/outputs',
      summary: 'List outputs for a stage',
      tag: 'StageOutputs',
      params: [
        { name: 'id', in: 'path', type: 'string', required: true, description: 'Project UUID' },
        { name: 'num', in: 'path', type: 'integer', required: true, description: 'Stage number (1-9)' },
      ],
      response: {
        status: 200,
        contentType: 'application/json',
        schema: [
          { name: 'data', type: 'array', required: true, description: 'Versioned output artifacts' },
        ],
      },
      curlExample: "curl -X GET http://localhost:3000/api/projects/:id/stages/:num/outputs \\\n  -H 'Authorization: Bearer <token>'",
    },
  ],
  integrations: [
    {
      id: 'int-1',
      name: 'OpenAI API',
      url: 'https://api.openai.com/v1',
      events: ['generate', 'regenerate'],
      payloadFormat: 'json',
      description: 'AI provider for stage generation',
    },
    {
      id: 'int-2',
      name: 'SendGrid',
      url: 'https://api.sendgrid.com/v3/mail/send',
      events: ['user.created', 'project.exported'],
      payloadFormat: 'json',
      description: 'Transactional email delivery',
    },
  ],
  pagination: { style: 'cursor', defaultLimit: 20, maxLimit: 100 },
  errorFormat: { code: 'string', message: 'string', details: 'object?' },
}

const mockStackSelection = {
  selections: {
    frontend: 'react',
    backend: 'hono',
    styling: 'tailwindcss',
    stateManagement: 'zustand',
    testing: 'vitest',
    orm: 'drizzle',
  },
  dependencies: [
    { id: 'dep-1', name: 'react', version: '^19.0.0', description: 'UI library', dev: false },
    { id: 'dep-2', name: 'react-dom', version: '^19.0.0', description: 'React DOM renderer', dev: false },
    { id: 'dep-3', name: 'hono', version: '^4.6.0', description: 'Ultrafast web framework', dev: false },
    { id: 'dep-4', name: 'drizzle-orm', version: '^0.36.0', description: 'TypeScript ORM', dev: false },
    { id: 'dep-5', name: 'zustand', version: '^5.0.0', description: 'State management', dev: false },
    { id: 'dep-6', name: '@tanstack/react-query', version: '^5.62.0', description: 'Async state management', dev: false },
    { id: 'dep-7', name: 'zod', version: '^3.24.0', description: 'Schema validation', dev: false },
    { id: 'dep-8', name: 'tailwindcss', version: '^4.0.0', description: 'Utility-first CSS', dev: true },
    { id: 'dep-9', name: 'typescript', version: '^5.7.0', description: 'TypeScript compiler', dev: true },
    { id: 'dep-10', name: 'vite', version: '^6.0.0', description: 'Build tool', dev: true },
    { id: 'dep-11', name: '@vitejs/plugin-react', version: '^4.3.0', description: 'React Vite plugin', dev: true },
    { id: 'dep-12', name: 'vitest', version: '^2.1.0', description: 'Vite-native test runner', dev: true },
    { id: 'dep-13', name: 'playwright', version: '^1.49.0', description: 'E2E testing framework', dev: true },
    { id: 'dep-14', name: 'drizzle-kit', version: '^0.30.0', description: 'Drizzle migration CLI', dev: true },
    { id: 'dep-15', name: 'eslint', version: '^9.16.0', description: 'Linter', dev: true },
  ],
  structure: {
    name: 'project-root',
    type: 'folder' as const,
    children: [
      {
        name: 'src',
        type: 'folder' as const,
        children: [
          {
            name: 'app',
            type: 'folder' as const,
            children: [
              { name: 'app.tsx', type: 'file' as const },
              { name: 'main.tsx', type: 'file' as const },
              { name: 'app.css', type: 'file' as const },
            ],
          },
          {
            name: 'components',
            type: 'folder' as const,
            children: [
              {
                name: 'ui',
                type: 'folder' as const,
                children: [
                  { name: 'button.tsx', type: 'file' as const },
                  { name: 'card.tsx', type: 'file' as const },
                  { name: 'dialog.tsx', type: 'file' as const },
                ],
              },
            ],
          },
          {
            name: 'features',
            type: 'folder' as const,
            children: [
              { name: 'auth', type: 'folder' as const, children: [{ name: 'login.tsx', type: 'file' as const }] },
              { name: 'dashboard', type: 'folder' as const, children: [{ name: 'dashboard-view.tsx', type: 'file' as const }] },
            ],
          },
          {
            name: 'lib',
            type: 'folder' as const,
            children: [
              { name: 'api-client.ts', type: 'file' as const },
              { name: 'utils.ts', type: 'file' as const },
            ],
          },
          {
            name: 'stores',
            type: 'folder' as const,
            children: [{ name: 'app-store.ts', type: 'file' as const }],
          },
        ],
      },
      {
        name: 'server',
        type: 'folder' as const,
        children: [
          { name: 'index.ts', type: 'file' as const },
          {
            name: 'routes',
            type: 'folder' as const,
            children: [
              { name: 'auth.ts', type: 'file' as const },
              { name: 'projects.ts', type: 'file' as const },
            ],
          },
          {
            name: 'db',
            type: 'folder' as const,
            children: [
              { name: 'schema.ts', type: 'file' as const },
              { name: 'migrate.ts', type: 'file' as const },
            ],
          },
        ],
      },
      {
        name: 'tests',
        type: 'folder' as const,
        children: [
          { name: 'setup.ts', type: 'file' as const },
          { name: 'auth.test.ts', type: 'file' as const },
        ],
      },
      { name: 'package.json', type: 'file' as const },
      { name: 'tsconfig.json', type: 'file' as const },
      { name: 'vite.config.ts', type: 'file' as const },
      { name: 'drizzle.config.ts', type: 'file' as const },
    ],
  },
  recommendation: {
    confidence: 92,
    summary: 'React + Hono + Drizzle is the ideal modern TypeScript full-stack combination for this project.',
    reasoning:
      'Based on the product definition and data model, this project benefits from a type-safe full-stack approach. React 19 provides the mature component ecosystem needed for the multi-stage pipeline UI. Hono offers ultrafast edge-compatible API routing that pairs well with Drizzle\'s SQL-like query builder for the PostgreSQL schema. Zustand keeps client state minimal and predictable, while Tailwind CSS enables rapid UI development matching the design system requirements. Vitest integrates natively with Vite for fast test feedback loops.',
  },
}

const mockDesignSystem = {
  colors: {
    primary: {
      '50': '#f0f9ff',
      '100': '#e0f2fe',
      '200': '#bae6fd',
      '300': '#7dd3fc',
      '400': '#38bdf8',
      '500': '#0ea5e9',
      '600': '#0284c7',
      '700': '#0369a1',
      '800': '#075985',
      '900': '#0c4a6e',
      '950': '#082f49',
    },
    secondary: {
      '50': '#fffbeb',
      '100': '#fef3c7',
      '200': '#fde68a',
      '300': '#fcd34d',
      '400': '#fbbf24',
      '500': '#f59e0b',
      '600': '#d97706',
      '700': '#b45309',
      '800': '#92400e',
      '900': '#78350f',
      '950': '#451a03',
    },
    neutral: {
      '50': '#fafafa',
      '100': '#f4f4f5',
      '200': '#e4e4e7',
      '300': '#d4d4d8',
      '400': '#a1a1aa',
      '500': '#71717a',
      '600': '#52525b',
      '700': '#3f3f46',
      '800': '#27272a',
      '900': '#18181b',
      '950': '#09090b',
    },
  },
  typography: {
    heading: { fontFamily: 'Inter', weights: [600, 700] },
    body: { fontFamily: 'Inter', weights: [400, 500] },
    mono: { fontFamily: 'JetBrains Mono', weights: [400, 500] },
    scale: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
  },
  spacing: {
    base: 4,
    scale: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64],
  },
  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
  applicationShell: {
    layout: 'sidebar',
    sidebar: {
      width: '260px',
      collapsedWidth: '64px',
      position: 'left',
      collapsible: true,
      background: 'neutral.900',
      textColor: 'neutral.200',
    },
    mainContent: {
      background: 'neutral.50',
      maxWidth: 'none',
      padding: '24px',
    },
    navigation: [
      { label: 'Dashboard', icon: 'Home', route: '/' },
      { label: 'Projects', icon: 'FolderOpen', route: '/projects' },
      { label: 'Templates', icon: 'LayoutTemplate', route: '/templates' },
      { label: 'Usage', icon: 'BarChart3', route: '/usage' },
      { label: 'Settings', icon: 'Settings', route: '/settings' },
    ],
  },
}

const mockSectionsData = {
  sections: [
    {
      id: 'sec-dashboard',
      name: 'Dashboard',
      route: '/',
      description: 'Landing page showing all projects with pipeline completion status. Grid of project cards with creation, status, and progress indicators.',
      components: [
        {
          id: 'comp-dash-layout',
          name: 'DashboardLayout',
          description: 'Main layout wrapper with stats bar and project grid',
          props: [],
          children: [
            {
              id: 'comp-dash-header',
              name: 'DashboardHeader',
              description: 'Page title, search input, and create project button',
              props: ['onSearch', 'onCreate'],
              children: [],
            },
            {
              id: 'comp-project-grid',
              name: 'ProjectGrid',
              description: 'Responsive grid of ProjectCard components sorted by last updated',
              props: ['projects: Project[]'],
              children: [
                {
                  id: 'comp-project-card',
                  name: 'ProjectCard',
                  description: 'Card showing project name, description snippet, 9-stage progress bar, and completion percentage',
                  props: ['project: Project', 'stages: Stage[]'],
                  children: [
                    {
                      id: 'comp-stage-badge',
                      name: 'StageBadge',
                      description: 'Mini badge showing stage number and completion status',
                      props: ['stage: Stage'],
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      dataRequirements: ['Project', 'Stage'],
      interactions: [
        { id: 'int-dash-1', trigger: 'Click project card', behavior: 'Navigate to /projects/:id (PipelineView)' },
        { id: 'int-dash-2', trigger: 'Click create button', behavior: 'Open CreateProjectModal' },
        { id: 'int-dash-3', trigger: 'Search/filter', behavior: 'Filter project grid by name or status (client-side)' },
      ],
      stateManagement: {
        serverState: 'useQuery to fetch projects list with stages',
        clientState: 'Modal open/close, search filter text',
      },
    },
    {
      id: 'sec-pipeline',
      name: 'Pipeline View',
      route: '/projects/:id',
      description: 'Primary workspace for a single project. Displays the 9-stage pipeline progress bar with the active stage editor loaded below.',
      components: [
        {
          id: 'comp-pipe-layout',
          name: 'PipelineLayout',
          description: 'Full-width layout with progress bar and editor container',
          props: [],
          children: [
            {
              id: 'comp-stage-sidebar',
              name: 'StageSidebar',
              description: 'Vertical list of 9 stages with status indicators and navigation',
              props: ['stages: Stage[]', 'currentStage: number'],
              children: [
                {
                  id: 'comp-stage-pill',
                  name: 'StagePill',
                  description: 'Individual stage node with status icon, name, and click handler',
                  props: ['stage: Stage', 'isActive: boolean', 'onClick'],
                  children: [],
                },
              ],
            },
            {
              id: 'comp-editor-panel',
              name: 'EditorPanel',
              description: 'Dynamic container loading the appropriate stage editor component',
              props: ['stage: Stage'],
              children: [
                {
                  id: 'comp-action-bar',
                  name: 'StageActionBar',
                  description: 'Bottom action bar with Generate, Save, Complete, and Revert buttons',
                  props: ['stage: Stage', 'onGenerate', 'onSave', 'onComplete', 'onRevert'],
                  children: [],
                },
              ],
            },
          ],
        },
      ],
      dataRequirements: ['Project', 'Stage', 'StageOutput'],
      interactions: [
        { id: 'int-pipe-1', trigger: 'Click stage in sidebar', behavior: 'Navigate to that stage if completed or active' },
        { id: 'int-pipe-2', trigger: 'Click Generate', behavior: 'POST /generate → show loading → display result' },
        { id: 'int-pipe-3', trigger: 'Click Complete', behavior: 'Validate → unlock next stage' },
        { id: 'int-pipe-4', trigger: 'Click Revert', behavior: 'Confirm dialog → lock subsequent stages' },
      ],
      stateManagement: {
        serverState: 'useQuery for project + all stages. useMutation for generate/save/complete/revert.',
        clientState: 'activeStageNumber, editorDirtyState, confirmRevertDialog',
      },
    },
    {
      id: 'sec-settings',
      name: 'Settings',
      route: '/settings',
      description: 'User preferences, AI provider management, and aggregate usage statistics.',
      components: [
        {
          id: 'comp-settings-layout',
          name: 'SettingsLayout',
          description: 'Settings page with tab navigation and content area',
          props: [],
          children: [
            {
              id: 'comp-settings-tabs',
              name: 'SettingsTabs',
              description: 'Tab navigation for settings categories: Profile, AI Providers, Usage',
              props: ['activeTab: string', 'onSelect'],
              children: [],
            },
            {
              id: 'comp-profile-form',
              name: 'ProfileForm',
              description: 'User profile form with name, email, avatar, and default preferences',
              props: ['user: User', 'onChange'],
              children: [],
            },
            {
              id: 'comp-ai-provider',
              name: 'AIProviderConfig',
              description: 'List of configured AI providers with add/edit/delete/test buttons',
              props: ['providers: AIProviderConfig[]', 'onChange'],
              children: [
                {
                  id: 'comp-provider-card',
                  name: 'ProviderCard',
                  description: 'Card showing provider label, type, model, connection status, and test button',
                  props: ['provider: AIProviderConfig', 'onTest', 'onEdit', 'onDelete'],
                  children: [],
                },
              ],
            },
          ],
        },
      ],
      dataRequirements: ['User'],
      interactions: [
        { id: 'int-set-1', trigger: 'Switch tab', behavior: 'Show corresponding settings panel' },
        { id: 'int-set-2', trigger: 'Save profile', behavior: 'PUT /api/users/me → show success toast' },
        { id: 'int-set-3', trigger: 'Test provider', behavior: 'POST /api/ai-providers/:id/test → show success/failure' },
      ],
      stateManagement: {
        serverState: 'useQuery for user profile and AI providers',
        clientState: 'activeTab, form dirty state',
      },
    },
  ],
}

const mockInfrastructureData = {
  hosting: 'railway' as const,
  docker: {
    dockerfile: `# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Stage 3: Production
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
USER appuser
EXPOSE 3000
CMD ["node", "dist/server/index.js"]`,
    compose: `version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/sdos
      - NODE_ENV=production
      - SESSION_SECRET=\${SESSION_SECRET}
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: sdos
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:`,
  },
  ciPipeline: {
    name: 'CI/CD',
    trigger: 'push to main',
    stages: [
      {
        id: 'ci-test',
        name: 'test',
        steps: [
          { id: 'step-lint', name: 'Lint', command: 'pnpm lint', enabled: true },
          { id: 'step-typecheck', name: 'Type Check', command: 'pnpm typecheck', enabled: true },
          { id: 'step-unit', name: 'Unit Tests', command: 'pnpm test', enabled: true },
          { id: 'step-e2e', name: 'E2E Tests', command: 'pnpm test:e2e', enabled: false },
        ],
      },
      {
        id: 'ci-build',
        name: 'build',
        steps: [
          { id: 'step-docker-build', name: 'Docker Build', command: 'docker build -t sdos:latest .', enabled: true },
          { id: 'step-push-registry', name: 'Push to Registry', command: 'docker push registry/sdos:latest', enabled: true },
        ],
      },
      {
        id: 'ci-deploy',
        name: 'deploy',
        steps: [
          { id: 'step-deploy-railway', name: 'Deploy to Railway', command: 'railway up --detach', enabled: true },
          { id: 'step-migrate', name: 'Run Migrations', command: 'pnpm drizzle-kit push', enabled: true },
        ],
      },
    ],
  },
  envVars: [
    { id: 'env-1', name: 'DATABASE_URL', required: true, defaultValue: '', description: 'PostgreSQL connection string' },
    { id: 'env-2', name: 'SESSION_SECRET', required: true, defaultValue: '', description: 'Secret key for session encryption' },
    { id: 'env-3', name: 'AI_PROVIDER_API_KEY', required: true, defaultValue: '', description: 'API key for AI provider (Claude/OpenAI)' },
    { id: 'env-4', name: 'PORT', required: false, defaultValue: '3000', description: 'Server port' },
    { id: 'env-5', name: 'NODE_ENV', required: false, defaultValue: 'production', description: 'Node environment' },
    { id: 'env-6', name: 'CORS_ORIGIN', required: false, defaultValue: '', description: 'Allowed CORS origin for API requests' },
  ],
}

export function createMockStage(stageNumber: number, statusOverride?: StageStatus): Stage {
  const config = STAGE_CONFIGS[stageNumber - 1]
  let status: StageStatus
  if (statusOverride) {
    status = statusOverride
  } else if (stageNumber === 1) {
    status = 'complete'
  } else if (stageNumber === 2) {
    status = 'active'
  } else {
    status = 'locked'
  }

  let data: Record<string, unknown> | undefined
  if (stageNumber === 1 && (status === 'complete' || status === 'review')) {
    data = mockProductDefinition as unknown as Record<string, unknown>
  } else if (status === 'complete') {
    data = { generated: true }
  }

  return {
    id: `stage-${stageNumber}`,
    projectId: 'mock-project-1',
    stageNumber: config.number,
    stageName: config.name,
    stageLabel: config.label,
    status,
    data,
    validatedAt: status === 'complete' ? yesterday : undefined,
    completedAt: status === 'complete' ? yesterday : undefined,
    createdAt: yesterday,
    updatedAt: now,
  }
}

export function createMockProject(id: string): ProjectWithStages {
  return {
    id,
    userId: 'mock-user-1',
    name: 'My Software Project',
    slug: 'my-software-project',
    description: 'A sample project to demonstrate the pipeline view',
    currentStage: 2,
    status: 'active',
    createdAt: yesterday,
    updatedAt: now,
    stages: STAGE_CONFIGS.map((_, i) => createMockStage(i + 1)),
  }
}

export function createMockStageWithOutputs(stageNumber: number): StageWithOutputs {
  const stage = createMockStage(stageNumber)
  const outputs: StageOutput[] =
    stage.status === 'complete' || stage.status === 'review'
      ? [
          {
            id: `output-${stageNumber}-1`,
            stageId: stage.id,
            version: 1,
            format: 'json',
            content: JSON.stringify(stage.data ?? { stageNumber, generated: true }),
            generatedBy: 'ai',
            aiGenerationId: `gen-${stageNumber}`,
            isActive: true,
            createdAt: yesterday,
          },
        ]
      : []
  return { ...stage, outputs }
}

export function createMockGenerateResponse(stageNumber: number): GenerateResponse {
  const stage = createMockStage(stageNumber, 'review')
  // For stage 1, the generate response includes the full product definition
  if (stageNumber === 1) {
    stage.data = mockProductDefinition as unknown as Record<string, unknown>
  } else if (stageNumber === 2) {
    stage.data = mockDataModel as unknown as Record<string, unknown>
  } else if (stageNumber === 3) {
    stage.data = mockDatabaseSchema as unknown as Record<string, unknown>
  } else if (stageNumber === 4) {
    stage.data = mockApiDesign as unknown as Record<string, unknown>
  } else if (stageNumber === 5) {
    stage.data = mockStackSelection as unknown as Record<string, unknown>
  } else if (stageNumber === 6) {
    stage.data = mockDesignSystem as unknown as Record<string, unknown>
  } else if (stageNumber === 7) {
    stage.data = mockSectionsData as unknown as Record<string, unknown>
  } else if (stageNumber === 8) {
    stage.data = mockInfrastructureData as unknown as Record<string, unknown>
  } else if (stageNumber === 9) {
    stage.data = assembleSDPFromStages({
      product: mockProductDefinition as unknown as Record<string, unknown>,
      dataModel: mockDataModel as unknown as Record<string, unknown>,
      database: mockDatabaseSchema as unknown as Record<string, unknown>,
      api: mockApiDesign as unknown as Record<string, unknown>,
      stack: mockStackSelection as unknown as Record<string, unknown>,
      design: mockDesignSystem as unknown as Record<string, unknown>,
      sections: mockSectionsData as unknown as Record<string, unknown>,
      infrastructure: mockInfrastructureData as unknown as Record<string, unknown>,
    }) as unknown as Record<string, unknown>
  }
  const output: StageOutput = {
    id: `output-${stageNumber}-${Date.now()}`,
    stageId: stage.id,
    version: 1,
    format: 'json',
    content: JSON.stringify(stage.data ?? { stageNumber, generated: true }),
    generatedBy: 'ai',
    aiGenerationId: `gen-${Date.now()}`,
    isActive: true,
    createdAt: now,
  }
  const generation: AIGeneration = {
    id: output.aiGenerationId!,
    stageId: stage.id,
    providerId: 'mock-provider',
    model: 'claude-sonnet-4-5-20250929',
    promptTemplate: `stage-${stage.stageName}-v1`,
    inputTokens: 1200,
    outputTokens: 800,
    totalTokens: 2000,
    estimatedCost: 0.012,
    durationMs: 1500,
    status: 'success',
    createdAt: now,
  }
  return { stage, output, generation }
}

export function createMockCompleteResponse(stageNumber: number): CompleteResponse {
  const stage = createMockStage(stageNumber, 'complete')
  const nextStage = stageNumber < 9 ? createMockStage(stageNumber + 1, 'active') : null
  return { stage, nextStage }
}

export function createMockRevertResponse(stageNumber: number): RevertResponse {
  const stage = createMockStage(stageNumber, 'active')
  const lockedStages: Stage[] = []
  for (let i = stageNumber + 1; i <= 9; i++) {
    lockedStages.push(createMockStage(i, 'locked'))
  }
  return { stage, lockedStages }
}

function createMockProjectWithProgress(
  id: string,
  name: string,
  description: string,
  currentStage: number,
  updatedAt: string,
): ProjectWithStages {
  const stages = STAGE_CONFIGS.map((config, i) => {
    const stageNum = i + 1
    let status: StageStatus
    if (stageNum < currentStage) {
      status = 'complete'
    } else if (stageNum === currentStage) {
      status = 'active'
    } else {
      status = 'locked'
    }
    return {
      id: `${id}-stage-${stageNum}`,
      projectId: id,
      stageNumber: config.number,
      stageName: config.name,
      stageLabel: config.label,
      status,
      data: status === 'complete' ? ({ generated: true } as Record<string, unknown>) : undefined,
      validatedAt: status === 'complete' ? yesterday : undefined,
      completedAt: status === 'complete' ? yesterday : undefined,
      createdAt: yesterday,
      updatedAt,
    }
  })

  return {
    id,
    userId: 'mock-user-1',
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    description,
    currentStage,
    status: 'active',
    createdAt: yesterday,
    updatedAt,
    stages,
  }
}

export function createMockProjectsList(): ProjectWithStages[] {
  const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString()
  const fiveDaysAgo = new Date(Date.now() - 5 * 86400000).toISOString()

  return [
    createMockProjectWithProgress(
      'mock-project-1',
      'Software Design OS',
      'AI-native blueprint engine for building software',
      5,
      now,
    ),
    createMockProjectWithProgress(
      'mock-project-2',
      'E-Commerce Platform',
      'Full-stack marketplace with vendor management and payments',
      3,
      twoDaysAgo,
    ),
    createMockProjectWithProgress(
      'mock-project-3',
      'Analytics Dashboard',
      'Real-time metrics visualization and alerting system',
      7,
      yesterday,
    ),
    createMockProjectWithProgress(
      'mock-project-4',
      'Learning Management System',
      'Course authoring platform with progress tracking and certificates',
      1,
      fiveDaysAgo,
    ),
  ]
}
