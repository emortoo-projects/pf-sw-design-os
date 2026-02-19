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
