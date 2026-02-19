# Data Model

## Entities

### User

The human operator of the tool

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | Yes | Primary key |
| email | string | Yes | User email for auth |
| name | string | Yes | Display name |
| avatarUrl | string | No | Profile image URL |
| preferences | jsonb | No | UI preferences, default stack, default DB engine |
| createdAt | datetime | Yes | Account creation timestamp |
| updatedAt | datetime | Yes | Last update timestamp |

### AIProviderConfig

Configuration for an AI provider (API key, model preferences). Stored per-user with encrypted keys.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | Yes | Primary key |
| userId | uuid | Yes | FK to User |
| provider | enum(anthropic,openai,custom) | Yes | AI provider type |
| label | string | Yes | User-friendly name (e.g., 'My Claude Key') |
| apiKeyEncrypted | string | Yes | AES-256 encrypted API key |
| defaultModel | string | Yes | Default model ID (e.g., claude-sonnet-4-5-20250929) |
| baseUrl | string | No | Custom base URL for OpenAI-compatible endpoints |
| isDefault | boolean | Yes | Whether this is the default provider for new projects |
| createdAt | datetime | Yes | Creation timestamp |

### Project

A single software design effort moving through the 9-stage pipeline

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | Yes | Primary key |
| userId | uuid | Yes | FK to User (owner) |
| name | string | Yes | Project name |
| slug | string | Yes | URL-safe slug derived from name |
| description | text | No | Brief project description |
| currentStage | integer | Yes | Current active stage number (1-9) |
| status | enum(active,archived,deleted) | Yes | Project lifecycle status |
| aiProviderId | uuid | No | FK to AIProviderConfig — override for this project |
| templateId | uuid | No | FK to Template if created from a template |
| createdAt | datetime | Yes | Creation timestamp |
| updatedAt | datetime | Yes | Last update timestamp |
| deletedAt | datetime | No | Soft delete timestamp |

### Stage

One of the 9 pipeline stages for a project. Each stage has a lifecycle: locked → active → generating → review → complete

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | Yes | Primary key |
| projectId | uuid | Yes | FK to Project |
| stageNumber | integer | Yes | Stage position (1-9) |
| stageName | enum(product,dataModel,database,api,stack,design,sections,infrastructure,export) | Yes | Stage identifier |
| stageLabel | string | Yes | Human-readable label (e.g., 'Product Definition') |
| status | enum(locked,active,generating,review,complete) | Yes | Current stage lifecycle status |
| data | jsonb | No | The stage's complete data payload — schema varies per stage type |
| userInput | text | No | The user's original input for this stage |
| validatedAt | datetime | No | When the stage was last validated |
| completedAt | datetime | No | When the stage was marked complete |
| createdAt | datetime | Yes | Creation timestamp |
| updatedAt | datetime | Yes | Last update timestamp |

### StageOutput

A versioned output artifact from a stage. Each stage can have multiple versions as the user iterates.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | Yes | Primary key |
| stageId | uuid | Yes | FK to Stage |
| version | integer | Yes | Version number (auto-incremented per stage) |
| format | enum(json,md,sql,yaml) | Yes | Output file format |
| content | text | Yes | The actual output content |
| generatedBy | enum(ai,human) | Yes | Whether AI generated or human authored |
| aiGenerationId | uuid | No | FK to AIGeneration if AI-generated |
| isActive | boolean | Yes | Whether this is the current active version |
| createdAt | datetime | Yes | Creation timestamp |

### AIGeneration

Record of a single AI generation call. Used for cost tracking, audit trail, and prompt iteration history.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | Yes | Primary key |
| stageId | uuid | Yes | FK to Stage |
| providerId | uuid | Yes | FK to AIProviderConfig |
| model | string | Yes | Model ID used (e.g., claude-sonnet-4-5-20250929) |
| promptTemplate | string | Yes | Name/version of the prompt template used |
| inputTokens | integer | Yes | Number of input tokens |
| outputTokens | integer | Yes | Number of output tokens |
| totalTokens | integer | Yes | Total tokens (input + output) |
| estimatedCost | decimal | Yes | Estimated cost in USD |
| durationMs | integer | Yes | Generation duration in milliseconds |
| status | enum(success,error,timeout) | Yes | Generation result status |
| errorMessage | text | No | Error details if status is error/timeout |
| createdAt | datetime | Yes | Timestamp of the generation call |

### Template

Reusable starting point for common product types. Contains pre-filled stage data that gets cloned into a new project.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | Yes | Primary key |
| name | string | Yes | Template name (e.g., 'SaaS Dashboard') |
| description | text | Yes | What this template provides |
| category | enum(saas,api,landing,mobile,cli,fullstack,other) | Yes | Template category |
| icon | string | No | Icon emoji or Lucide icon name |
| stageDefaults | jsonb | Yes | Pre-filled data for each stage |
| isBuiltIn | boolean | Yes | Whether this is a system template vs user-created |
| createdAt | datetime | Yes | Creation timestamp |

### ExportPackage

A generated SDP archive. Tracks each export for download history and validation status.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | Yes | Primary key |
| projectId | uuid | Yes | FK to Project |
| format | enum(folder,zip) | Yes | Export format |
| validationStatus | enum(valid,warnings,errors) | Yes | Cross-reference validation result |
| validationMessages | jsonb | No | Array of validation warnings/errors |
| filePath | string | Yes | Path to the exported package on storage |
| fileSizeBytes | integer | Yes | Package size in bytes |
| exportedAt | datetime | Yes | Export timestamp |

### MCPToken

Bearer token for MCP server access. Scoped to a specific project so agents only see authorized SDPs.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | Yes | Primary key |
| userId | uuid | Yes | FK to User (owner) |
| projectId | uuid | Yes | FK to Project (scope) |
| tokenHash | string | Yes | SHA-256 hash of the bearer token |
| label | string | Yes | User-friendly label (e.g., 'Claude Code access') |
| lastUsedAt | datetime | No | Last time this token was used |
| expiresAt | datetime | No | Expiration date (null = never) |
| createdAt | datetime | Yes | Creation timestamp |


## Raw Entity Schema

```json
{
  "entities": [
    {
      "name": "User",
      "description": "The human operator of the tool",
      "fields": [
        {
          "name": "id",
          "type": "uuid",
          "required": true,
          "description": "Primary key"
        },
        {
          "name": "email",
          "type": "string",
          "required": true,
          "description": "User email for auth"
        },
        {
          "name": "name",
          "type": "string",
          "required": true,
          "description": "Display name"
        },
        {
          "name": "avatarUrl",
          "type": "string",
          "required": false,
          "description": "Profile image URL"
        },
        {
          "name": "preferences",
          "type": "jsonb",
          "required": false,
          "description": "UI preferences, default stack, default DB engine"
        },
        {
          "name": "createdAt",
          "type": "datetime",
          "required": true,
          "description": "Account creation timestamp"
        },
        {
          "name": "updatedAt",
          "type": "datetime",
          "required": true,
          "description": "Last update timestamp"
        }
      ]
    },
    {
      "name": "AIProviderConfig",
      "description": "Configuration for an AI provider (API key, model preferences). Stored per-user with encrypted keys.",
      "fields": [
        {
          "name": "id",
          "type": "uuid",
          "required": true,
          "description": "Primary key"
        },
        {
          "name": "userId",
          "type": "uuid",
          "required": true,
          "description": "FK to User"
        },
        {
          "name": "provider",
          "type": "enum(anthropic,openai,custom)",
          "required": true,
          "description": "AI provider type"
        },
        {
          "name": "label",
          "type": "string",
          "required": true,
          "description": "User-friendly name (e.g., 'My Claude Key')"
        },
        {
          "name": "apiKeyEncrypted",
          "type": "string",
          "required": true,
          "description": "AES-256 encrypted API key"
        },
        {
          "name": "defaultModel",
          "type": "string",
          "required": true,
          "description": "Default model ID (e.g., claude-sonnet-4-5-20250929)"
        },
        {
          "name": "baseUrl",
          "type": "string",
          "required": false,
          "description": "Custom base URL for OpenAI-compatible endpoints"
        },
        {
          "name": "isDefault",
          "type": "boolean",
          "required": true,
          "description": "Whether this is the default provider for new projects"
        },
        {
          "name": "createdAt",
          "type": "datetime",
          "required": true,
          "description": "Creation timestamp"
        }
      ]
    },
    {
      "name": "Project",
      "description": "A single software design effort moving through the 9-stage pipeline",
      "fields": [
        {
          "name": "id",
          "type": "uuid",
          "required": true,
          "description": "Primary key"
        },
        {
          "name": "userId",
          "type": "uuid",
          "required": true,
          "description": "FK to User (owner)"
        },
        {
          "name": "name",
          "type": "string",
          "required": true,
          "description": "Project name"
        },
        {
          "name": "slug",
          "type": "string",
          "required": true,
          "description": "URL-safe slug derived from name"
        },
        {
          "name": "description",
          "type": "text",
          "required": false,
          "description": "Brief project description"
        },
        {
          "name": "currentStage",
          "type": "integer",
          "required": true,
          "description": "Current active stage number (1-9)"
        },
        {
          "name": "status",
          "type": "enum(active,archived,deleted)",
          "required": true,
          "description": "Project lifecycle status"
        },
        {
          "name": "aiProviderId",
          "type": "uuid",
          "required": false,
          "description": "FK to AIProviderConfig \u2014 override for this project"
        },
        {
          "name": "templateId",
          "type": "uuid",
          "required": false,
          "description": "FK to Template if created from a template"
        },
        {
          "name": "createdAt",
          "type": "datetime",
          "required": true,
          "description": "Creation timestamp"
        },
        {
          "name": "updatedAt",
          "type": "datetime",
          "required": true,
          "description": "Last update timestamp"
        },
        {
          "name": "deletedAt",
          "type": "datetime",
          "required": false,
          "description": "Soft delete timestamp"
        }
      ]
    },
    {
      "name": "Stage",
      "description": "One of the 9 pipeline stages for a project. Each stage has a lifecycle: locked \u2192 active \u2192 generating \u2192 review \u2192 complete",
      "fields": [
        {
          "name": "id",
          "type": "uuid",
          "required": true,
          "description": "Primary key"
        },
        {
          "name": "projectId",
          "type": "uuid",
          "required": true,
          "description": "FK to Project"
        },
        {
          "name": "stageNumber",
          "type": "integer",
          "required": true,
          "description": "Stage position (1-9)"
        },
        {
          "name": "stageName",
          "type": "enum(product,dataModel,database,api,stack,design,sections,infrastructure,export)",
          "required": true,
          "description": "Stage identifier"
        },
        {
          "name": "stageLabel",
          "type": "string",
          "required": true,
          "description": "Human-readable label (e.g., 'Product Definition')"
        },
        {
          "name": "status",
          "type": "enum(locked,active,generating,review,complete)",
          "required": true,
          "description": "Current stage lifecycle status"
        },
        {
          "name": "data",
          "type": "jsonb",
          "required": false,
          "description": "The stage's complete data payload \u2014 schema varies per stage type"
        },
        {
          "name": "userInput",
          "type": "text",
          "required": false,
          "description": "The user's original input for this stage"
        },
        {
          "name": "validatedAt",
          "type": "datetime",
          "required": false,
          "description": "When the stage was last validated"
        },
        {
          "name": "completedAt",
          "type": "datetime",
          "required": false,
          "description": "When the stage was marked complete"
        },
        {
          "name": "createdAt",
          "type": "datetime",
          "required": true,
          "description": "Creation timestamp"
        },
        {
          "name": "updatedAt",
          "type": "datetime",
          "required": true,
          "description": "Last update timestamp"
        }
      ]
    },
    {
      "name": "StageOutput",
      "description": "A versioned output artifact from a stage. Each stage can have multiple versions as the user iterates.",
      "fields": [
        {
          "name": "id",
          "type": "uuid",
          "required": true,
          "description": "Primary key"
        },
        {
          "name": "stageId",
          "type": "uuid",
          "required": true,
          "description": "FK to Stage"
        },
        {
          "name": "version",
          "type": "integer",
          "required": true,
          "description": "Version number (auto-incremented per stage)"
        },
        {
          "name": "format",
          "type": "enum(json,md,sql,yaml)",
          "required": true,
          "description": "Output file format"
        },
        {
          "name": "content",
          "type": "text",
          "required": true,
          "description": "The actual output content"
        },
        {
          "name": "generatedBy",
          "type": "enum(ai,human)",
          "required": true,
          "description": "Whether AI generated or human authored"
        },
        {
          "name": "aiGenerationId",
          "type": "uuid",
          "required": false,
          "description": "FK to AIGeneration if AI-generated"
        },
        {
          "name": "isActive",
          "type": "boolean",
          "required": true,
          "description": "Whether this is the current active version"
        },
        {
          "name": "createdAt",
          "type": "datetime",
          "required": true,
          "description": "Creation timestamp"
        }
      ]
    },
    {
      "name": "AIGeneration",
      "description": "Record of a single AI generation call. Used for cost tracking, audit trail, and prompt iteration history.",
      "fields": [
        {
          "name": "id",
          "type": "uuid",
          "required": true,
          "description": "Primary key"
        },
        {
          "name": "stageId",
          "type": "uuid",
          "required": true,
          "description": "FK to Stage"
        },
        {
          "name": "providerId",
          "type": "uuid",
          "required": true,
          "description": "FK to AIProviderConfig"
        },
        {
          "name": "model",
          "type": "string",
          "required": true,
          "description": "Model ID used (e.g., claude-sonnet-4-5-20250929)"
        },
        {
          "name": "promptTemplate",
          "type": "string",
          "required": true,
          "description": "Name/version of the prompt template used"
        },
        {
          "name": "inputTokens",
          "type": "integer",
          "required": true,
          "description": "Number of input tokens"
        },
        {
          "name": "outputTokens",
          "type": "integer",
          "required": true,
          "description": "Number of output tokens"
        },
        {
          "name": "totalTokens",
          "type": "integer",
          "required": true,
          "description": "Total tokens (input + output)"
        },
        {
          "name": "estimatedCost",
          "type": "decimal",
          "required": true,
          "description": "Estimated cost in USD"
        },
        {
          "name": "durationMs",
          "type": "integer",
          "required": true,
          "description": "Generation duration in milliseconds"
        },
        {
          "name": "status",
          "type": "enum(success,error,timeout)",
          "required": true,
          "description": "Generation result status"
        },
        {
          "name": "errorMessage",
          "type": "text",
          "required": false,
          "description": "Error details if status is error/timeout"
        },
        {
          "name": "createdAt",
          "type": "datetime",
          "required": true,
          "description": "Timestamp of the generation call"
        }
      ]
    },
    {
      "name": "Template",
      "description": "Reusable starting point for common product types. Contains pre-filled stage data that gets cloned into a new project.",
      "fields": [
        {
          "name": "id",
          "type": "uuid",
          "required": true,
          "description": "Primary key"
        },
        {
          "name": "name",
          "type": "string",
          "required": true,
          "description": "Template name (e.g., 'SaaS Dashboard')"
        },
        {
          "name": "description",
          "type": "text",
          "required": true,
          "description": "What this template provides"
        },
        {
          "name": "category",
          "type": "enum(saas,api,landing,mobile,cli,fullstack,other)",
          "required": true,
          "description": "Template category"
        },
        {
          "name": "icon",
          "type": "string",
          "required": false,
          "description": "Icon emoji or Lucide icon name"
        },
        {
          "name": "stageDefaults",
          "type": "jsonb",
          "required": true,
          "description": "Pre-filled data for each stage"
        },
        {
          "name": "isBuiltIn",
          "type": "boolean",
          "required": true,
          "description": "Whether this is a system template vs user-created"
        },
        {
          "name": "createdAt",
          "type": "datetime",
          "required": true,
          "description": "Creation timestamp"
        }
      ]
    },
    {
      "name": "ExportPackage",
      "description": "A generated SDP archive. Tracks each export for download history and validation status.",
      "fields": [
        {
          "name": "id",
          "type": "uuid",
          "required": true,
          "description": "Primary key"
        },
        {
          "name": "projectId",
          "type": "uuid",
          "required": true,
          "description": "FK to Project"
        },
        {
          "name": "format",
          "type": "enum(folder,zip)",
          "required": true,
          "description": "Export format"
        },
        {
          "name": "validationStatus",
          "type": "enum(valid,warnings,errors)",
          "required": true,
          "description": "Cross-reference validation result"
        },
        {
          "name": "validationMessages",
          "type": "jsonb",
          "required": false,
          "description": "Array of validation warnings/errors"
        },
        {
          "name": "filePath",
          "type": "string",
          "required": true,
          "description": "Path to the exported package on storage"
        },
        {
          "name": "fileSizeBytes",
          "type": "integer",
          "required": true,
          "description": "Package size in bytes"
        },
        {
          "name": "exportedAt",
          "type": "datetime",
          "required": true,
          "description": "Export timestamp"
        }
      ]
    },
    {
      "name": "MCPToken",
      "description": "Bearer token for MCP server access. Scoped to a specific project so agents only see authorized SDPs.",
      "fields": [
        {
          "name": "id",
          "type": "uuid",
          "required": true,
          "description": "Primary key"
        },
        {
          "name": "userId",
          "type": "uuid",
          "required": true,
          "description": "FK to User (owner)"
        },
        {
          "name": "projectId",
          "type": "uuid",
          "required": true,
          "description": "FK to Project (scope)"
        },
        {
          "name": "tokenHash",
          "type": "string",
          "required": true,
          "description": "SHA-256 hash of the bearer token"
        },
        {
          "name": "label",
          "type": "string",
          "required": true,
          "description": "User-friendly label (e.g., 'Claude Code access')"
        },
        {
          "name": "lastUsedAt",
          "type": "datetime",
          "required": false,
          "description": "Last time this token was used"
        },
        {
          "name": "expiresAt",
          "type": "datetime",
          "required": false,
          "description": "Expiration date (null = never)"
        },
        {
          "name": "createdAt",
          "type": "datetime",
          "required": true,
          "description": "Creation timestamp"
        }
      ]
    }
  ]
}
```


## Relationships

```json
{
  "relationships": [
    {
      "from": "User",
      "to": "Project",
      "type": "one-to-many",
      "foreignKey": "userId",
      "description": "A user owns many projects"
    },
    {
      "from": "User",
      "to": "AIProviderConfig",
      "type": "one-to-many",
      "foreignKey": "userId",
      "description": "A user has multiple AI provider configs"
    },
    {
      "from": "User",
      "to": "MCPToken",
      "type": "one-to-many",
      "foreignKey": "userId",
      "description": "A user manages MCP access tokens"
    },
    {
      "from": "Project",
      "to": "Stage",
      "type": "one-to-many",
      "foreignKey": "projectId",
      "description": "A project has exactly 9 stages"
    },
    {
      "from": "Project",
      "to": "ExportPackage",
      "type": "one-to-many",
      "foreignKey": "projectId",
      "description": "A project can have multiple exports"
    },
    {
      "from": "Project",
      "to": "MCPToken",
      "type": "one-to-many",
      "foreignKey": "projectId",
      "description": "A project can have multiple MCP tokens"
    },
    {
      "from": "Project",
      "to": "AIProviderConfig",
      "type": "many-to-one",
      "foreignKey": "aiProviderId",
      "description": "A project optionally overrides the AI provider"
    },
    {
      "from": "Project",
      "to": "Template",
      "type": "many-to-one",
      "foreignKey": "templateId",
      "description": "A project may be created from a template"
    },
    {
      "from": "Stage",
      "to": "StageOutput",
      "type": "one-to-many",
      "foreignKey": "stageId",
      "description": "A stage has versioned outputs"
    },
    {
      "from": "Stage",
      "to": "AIGeneration",
      "type": "one-to-many",
      "foreignKey": "stageId",
      "description": "A stage tracks all AI generation calls"
    },
    {
      "from": "StageOutput",
      "to": "AIGeneration",
      "type": "many-to-one",
      "foreignKey": "aiGenerationId",
      "description": "An AI-generated output links to its generation record"
    },
    {
      "from": "AIGeneration",
      "to": "AIProviderConfig",
      "type": "many-to-one",
      "foreignKey": "providerId",
      "description": "Each generation uses a specific provider config"
    }
  ]
}
```



---
*Imported from SDP on 2026-02-18 18:56*
