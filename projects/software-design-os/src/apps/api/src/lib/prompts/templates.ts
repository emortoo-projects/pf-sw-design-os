interface PromptPair {
  systemPrompt: string
  userPrompt: string
}

type StageContext = Record<string, Record<string, unknown> | undefined>

const JSON_SYSTEM_PREAMBLE = 'You are a JSON API. Your entire response must be a single JSON object parseable by JSON.parse(). Do not wrap it in markdown code fences. Do not include any text before or after the JSON.'

const JSON_INSTRUCTION = `

CRITICAL: Respond with ONLY valid JSON. No markdown, no code fences, no explanation text. Start your response with { and end with }.`

export function buildProductPrompt(userInput: string | undefined): PromptPair {
  return {
    systemPrompt: `${JSON_SYSTEM_PREAMBLE}

You are a senior product strategist. Given a product idea, produce a comprehensive Product Definition as a JSON object.

Output schema:
{
  "name": "string — product name",
  "tagline": "string — one-line description",
  "description": "string — 2-3 sentence overview",
  "problems": [{ "id": "string", "problem": "string", "solution": "string" }],
  "features": [{ "id": "string", "name": "string", "description": "string" }],
  "personas": [{ "id": "string", "name": "string", "description": "string" }]
}

Generate 3-5 problems, 4-6 features, and 2-4 personas. Use short kebab-case IDs (e.g. "ps-1", "f-1", "p-1").
${JSON_INSTRUCTION}`,
    userPrompt: userInput
      ? `Product idea: ${userInput}`
      : 'Generate a product definition for a generic SaaS application.',
  }
}

export function buildDataModelPrompt(ctx: StageContext): PromptPair {
  const product = ctx.product ?? {}
  return {
    systemPrompt: `${JSON_SYSTEM_PREAMBLE}

You are a data architect. Given a product definition, design the data model as a JSON object.

Output schema:
{
  "entities": [{
    "id": "string",
    "name": "string",
    "description": "string",
    "fields": [{
      "id": "string",
      "name": "string",
      "type": "string — e.g. uuid, string, text, integer, boolean, datetime, jsonb, enum(...)",
      "required": boolean,
      "description": "string"
    }]
  }],
  "relationships": [{
    "id": "string",
    "fromEntityId": "string",
    "toEntityId": "string",
    "type": "one-to-one | one-to-many | many-to-many",
    "foreignKey": "string",
    "description": "string"
  }]
}

Use IDs like "e-user", "f-u1", "r-1". Every entity must have id, createdAt, updatedAt fields. Include all entities needed to support the product's features and personas.
${JSON_INSTRUCTION}`,
    userPrompt: `Product definition:\n${JSON.stringify(product, null, 2)}`,
  }
}

export function buildDatabasePrompt(ctx: StageContext): PromptPair {
  const dataModel = ctx.dataModel ?? {}
  return {
    systemPrompt: `${JSON_SYSTEM_PREAMBLE}

You are a database engineer specializing in PostgreSQL. Given a data model, produce a database schema as a JSON object.

Output schema:
{
  "engine": "postgresql",
  "schema": "string — compact SQL DDL: CREATE TABLE statements with constraints and a single updated_at trigger function. No comments, minimal whitespace.",
  "tables": [{
    "name": "string — snake_case table name",
    "columns": [{
      "name": "string",
      "type": "string — PostgreSQL type",
      "nullable": boolean,
      "defaultValue": "string | undefined",
      "isPrimaryKey": boolean,
      "isForeignKey": boolean,
      "references": "string | undefined — e.g. users(id)"
    }]
  }],
  "indexes": [{
    "id": "string",
    "table": "string",
    "columns": ["string"],
    "type": "btree | unique | gin"
  }]
}

Rules:
- Use snake_case for all SQL identifiers.
- In the "schema" field, write compact SQL: one CREATE TABLE per entity, no blank lines between columns, no inline comments. Include constraints inline (PRIMARY KEY, NOT NULL, REFERENCES with ON DELETE CASCADE, DEFAULT).
- Create a single reusable trigger function for updated_at, then apply it to all tables.
- Do NOT include a "migrations" field — only the final schema.
- Keep the "indexes" array concise: only include indexes beyond PRIMARY KEY (unique constraints, foreign key lookups, GIN for JSONB).
${JSON_INSTRUCTION}`,
    userPrompt: `Data model:\n${JSON.stringify(dataModel)}`,
  }
}

export function buildApiPrompt(ctx: StageContext): PromptPair {
  const product = ctx.product ?? {}
  const dataModel = ctx.dataModel ?? {}
  return {
    systemPrompt: `${JSON_SYSTEM_PREAMBLE}

You are an API architect. Given a product definition and data model, design a REST API specification as a JSON object.

Output schema:
{
  "style": "rest",
  "basePath": "/api",
  "auth": {
    "strategy": "jwt",
    "jwt": { "tokenExpiry": "string", "refreshTokenExpiry": "string" }
  },
  "endpoints": [{
    "id": "string",
    "method": "GET | POST | PUT | DELETE | PATCH",
    "path": "string",
    "summary": "string",
    "tag": "string — grouping tag",
    "params": [{ "name": "string", "in": "path | query", "type": "string", "required": boolean, "description": "string" }],
    "requestBody": { "contentType": "application/json", "schema": [{ "name": "string", "type": "string", "required": boolean, "description": "string" }] } | undefined,
    "response": { "status": number, "contentType": "application/json", "schema": [{ "name": "string", "type": "string", "required": boolean, "description": "string" }] },
    "curlExample": "string"
  }],
  "integrations": [{ "id": "string", "name": "string", "url": "string", "events": ["string"], "payloadFormat": "json", "description": "string" }],
  "pagination": { "style": "cursor", "defaultLimit": 20, "maxLimit": 100 },
  "errorFormat": { "code": "string", "message": "string", "details": "object?" }
}

Include CRUD endpoints for all entities. Include auth endpoints (login, register, refresh, logout). Use endpoint IDs like "ep-1".
${JSON_INSTRUCTION}`,
    userPrompt: `Product definition:\n${JSON.stringify(product, null, 2)}\n\nData model:\n${JSON.stringify(dataModel, null, 2)}`,
  }
}

export function buildStackPrompt(ctx: StageContext): PromptPair {
  const product = ctx.product ?? {}
  const database = ctx.database ?? {}
  return {
    systemPrompt: `${JSON_SYSTEM_PREAMBLE}

You are a technology strategist. Given a product definition and database schema, recommend the optimal programming stack as a JSON object.

Output schema:
{
  "selections": {
    "frontend": "string",
    "backend": "string",
    "styling": "string",
    "stateManagement": "string",
    "testing": "string",
    "orm": "string"
  },
  "dependencies": [{
    "id": "string",
    "name": "string — npm package name",
    "version": "string — semver range",
    "description": "string",
    "dev": boolean
  }],
  "structure": {
    "name": "string",
    "type": "folder",
    "children": [{ "name": "string", "type": "folder | file", "children": [] }]
  },
  "recommendation": {
    "confidence": number (0-100),
    "summary": "string",
    "reasoning": "string"
  }
}

Use dependency IDs like "dep-1". Include both production and dev dependencies. The file structure should be a practical project tree.
${JSON_INSTRUCTION}`,
    userPrompt: `Product definition:\n${JSON.stringify(product, null, 2)}\n\nDatabase schema:\n${JSON.stringify(database, null, 2)}`,
  }
}

export function buildDesignPrompt(ctx: StageContext): PromptPair {
  const product = ctx.product ?? {}
  return {
    systemPrompt: `${JSON_SYSTEM_PREAMBLE}

You are a design systems engineer. Given a product definition, create a comprehensive design token system as a JSON object.

Output schema:
{
  "colors": {
    "primary": { "50": "string", "100": "string", ..., "900": "string", "950": "string" },
    "secondary": { "50": "string", ..., "950": "string" },
    "neutral": { "50": "string", ..., "950": "string" }
  },
  "typography": {
    "heading": { "fontFamily": "string", "weights": [number] },
    "body": { "fontFamily": "string", "weights": [number] },
    "mono": { "fontFamily": "string", "weights": [number] },
    "scale": { "xs": "string", "sm": "string", "base": "string", "lg": "string", "xl": "string", "2xl": "string", "3xl": "string", "4xl": "string" }
  },
  "spacing": { "base": number, "scale": [number] },
  "borderRadius": { "sm": "string", "md": "string", "lg": "string", "xl": "string", "full": "string" },
  "shadows": { "sm": "string", "md": "string", "lg": "string" },
  "applicationShell": {
    "layout": "sidebar | topnav",
    "sidebar": { "width": "string", "collapsedWidth": "string", "position": "left | right", "collapsible": boolean, "background": "string", "textColor": "string" },
    "mainContent": { "background": "string", "maxWidth": "string", "padding": "string" },
    "navigation": [{ "label": "string", "icon": "string", "route": "string" }]
  }
}

Use hex color values for the color palette. Choose fonts appropriate for the product type. Colors should be from 50 (lightest) to 950 (darkest).
${JSON_INSTRUCTION}`,
    userPrompt: `Product definition:\n${JSON.stringify(product, null, 2)}`,
  }
}

export function buildSectionsPrompt(ctx: StageContext): PromptPair {
  const product = ctx.product ?? {}
  const dataModel = ctx.dataModel ?? {}
  const api = ctx.api ?? {}
  const design = ctx.design ?? {}
  const database = ctx.database ?? {}
  const stack = ctx.stack ?? {}
  return {
    systemPrompt: `${JSON_SYSTEM_PREAMBLE}

You are a frontend architect. Given the product definition, data model, API spec, design system, database schema, and tech stack, define the UI sections and component trees as a JSON object.

Output schema:
{
  "sections": [{
    "id": "string",
    "name": "string",
    "route": "string",
    "description": "string",
    "components": [{
      "id": "string",
      "name": "string — PascalCase React component name",
      "description": "string",
      "props": ["string — prop name with type annotation"],
      "children": [{ ...recursive component }]
    }],
    "dataRequirements": ["string — entity names this section reads"],
    "interactions": [{
      "id": "string",
      "trigger": "string",
      "behavior": "string"
    }],
    "stateManagement": {
      "serverState": "string",
      "clientState": "string"
    }
  }]
}

Include sections for all major pages: dashboard, main workspace, settings, etc. Use section IDs like "sec-dashboard" and component IDs like "comp-dash-layout". Components should form a tree (parent → children).
${JSON_INSTRUCTION}`,
    userPrompt: `Product definition:\n${JSON.stringify(product, null, 2)}\n\nData model:\n${JSON.stringify(dataModel, null, 2)}\n\nAPI spec:\n${JSON.stringify(api, null, 2)}\n\nDesign system:\n${JSON.stringify(design, null, 2)}\n\nDatabase schema:\n${JSON.stringify(database, null, 2)}\n\nTech stack:\n${JSON.stringify(stack, null, 2)}`,
  }
}

export function buildInfrastructurePrompt(ctx: StageContext): PromptPair {
  const stack = ctx.stack ?? {}
  const database = ctx.database ?? {}
  return {
    systemPrompt: `${JSON_SYSTEM_PREAMBLE}

You are a DevOps engineer. Given the tech stack and database schema, produce an infrastructure configuration as a JSON object.

Output schema:
{
  "hosting": "string — e.g. railway, vercel, aws, fly.io",
  "docker": {
    "dockerfile": "string — multi-stage Dockerfile content",
    "compose": "string — docker-compose.yml content"
  },
  "ciPipeline": {
    "name": "string",
    "trigger": "string",
    "stages": [{
      "id": "string",
      "name": "string",
      "steps": [{
        "id": "string",
        "name": "string",
        "command": "string",
        "enabled": boolean
      }]
    }]
  },
  "envVars": [{
    "id": "string",
    "name": "string",
    "required": boolean,
    "defaultValue": "string",
    "description": "string"
  }]
}

Include test, build, and deploy stages in the CI pipeline. List all environment variables the app needs. The Dockerfile should use multi-stage builds for small images.
${JSON_INSTRUCTION}`,
    userPrompt: `Tech stack:\n${JSON.stringify(stack, null, 2)}\n\nDatabase schema:\n${JSON.stringify(database, null, 2)}`,
  }
}
