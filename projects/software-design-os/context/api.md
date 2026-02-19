# API Design

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get JWT |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/users/me` | Get current user profile |
| PUT | `/users/me` | Update user profile and preferences |
| GET | `/ai-providers` | List user's AI provider configs |
| POST | `/ai-providers` | Add new AI provider config |
| PUT | `/ai-providers/:id` | Update AI provider config |
| DELETE | `/ai-providers/:id` | Delete AI provider config |
| POST | `/ai-providers/:id/test` | Test AI provider connection |
| GET | `/projects` | List user's projects with stage summaries |
| POST | `/projects` | Create new project (creates 9 locked stages) |
| GET | `/projects/:id` | Get project with all stages and current data |
| PUT | `/projects/:id` | Update project metadata |
| DELETE | `/projects/:id` | Soft delete project |
| GET | `/projects/:id/stages` | List all 9 stages with status |
| GET | `/projects/:id/stages/:num` | Get specific stage with data and outputs |
| PUT | `/projects/:id/stages/:num` | Update stage data (human edits) |
| POST | `/projects/:id/stages/:num/generate` | Trigger AI generation for this stage |
| POST | `/projects/:id/stages/:num/complete` | Validate and mark stage as complete. Unlocks next stage. |
| POST | `/projects/:id/stages/:num/revert` | Revert completed stage to review. Locks all subsequent stages. |
| GET | `/projects/:id/stages/:num/outputs` | List all output versions for a stage |
| POST | `/projects/:id/stages/:num/outputs` | Create manual output (human-authored) |
| PUT | `/projects/:id/stages/:num/outputs/:outputId/activate` | Set a specific output version as active |
| POST | `/projects/:id/export` | Generate SDP export package |
| GET | `/projects/:id/exports` | List export history |
| GET | `/projects/:id/exports/:exportId/download` | Download export package |
| POST | `/projects/:id/validate` | Run cross-reference validation without exporting |
| GET | `/projects/:id/generations` | List AI generation history for a project |
| GET | `/usage` | Aggregate usage stats across all projects |
| GET | `/templates` | List available templates |
| POST | `/projects/:id/apply-template` | Apply template to project (fills stage defaults) |
| GET | `/projects/:id/mcp-tokens` | List MCP tokens for a project |
| POST | `/projects/:id/mcp-tokens` | Create MCP access token for a project |
| DELETE | `/projects/:id/mcp-tokens/:tokenId` | Revoke MCP token |


## Authentication

```json
{
  "strategy": "jwt",
  "tokenExpiry": "7d",
  "refreshTokenExpiry": "30d",
  "passwordHashing": "bcrypt"
}
```


## Full API Spec

```json
{
  "basePath": "/api",
  "auth": {
    "strategy": "jwt",
    "tokenExpiry": "7d",
    "refreshTokenExpiry": "30d",
    "passwordHashing": "bcrypt"
  },
  "pagination": {
    "defaultLimit": 20,
    "maxLimit": 100,
    "style": "cursor"
  },
  "errorFormat": {
    "shape": {
      "error": {
        "code": "string",
        "message": "string",
        "details": "object?"
      }
    }
  },
  "endpoints": [
    {
      "method": "POST",
      "path": "/auth/register",
      "description": "Register new user",
      "body": "email, name, password",
      "response": "User + JWT"
    },
    {
      "method": "POST",
      "path": "/auth/login",
      "description": "Login and get JWT",
      "body": "email, password",
      "response": "User + JWT"
    },
    {
      "method": "POST",
      "path": "/auth/refresh",
      "description": "Refresh access token",
      "body": "refreshToken",
      "response": "JWT"
    },
    {
      "method": "GET",
      "path": "/users/me",
      "description": "Get current user profile",
      "auth": true,
      "response": "User"
    },
    {
      "method": "PUT",
      "path": "/users/me",
      "description": "Update user profile and preferences",
      "auth": true,
      "body": "name?, preferences?",
      "response": "User"
    },
    {
      "method": "GET",
      "path": "/ai-providers",
      "description": "List user's AI provider configs",
      "auth": true,
      "response": "AIProviderConfig[]"
    },
    {
      "method": "POST",
      "path": "/ai-providers",
      "description": "Add new AI provider config",
      "auth": true,
      "body": "provider, label, apiKey, defaultModel, baseUrl?",
      "response": "AIProviderConfig"
    },
    {
      "method": "PUT",
      "path": "/ai-providers/:id",
      "description": "Update AI provider config",
      "auth": true,
      "response": "AIProviderConfig"
    },
    {
      "method": "DELETE",
      "path": "/ai-providers/:id",
      "description": "Delete AI provider config",
      "auth": true,
      "response": "void"
    },
    {
      "method": "POST",
      "path": "/ai-providers/:id/test",
      "description": "Test AI provider connection",
      "auth": true,
      "response": "{success, model, latencyMs}"
    },
    {
      "method": "GET",
      "path": "/projects",
      "description": "List user's projects with stage summaries",
      "auth": true,
      "response": "Project[] with stage status"
    },
    {
      "method": "POST",
      "path": "/projects",
      "description": "Create new project (creates 9 locked stages)",
      "auth": true,
      "body": "name, description?, templateId?, aiProviderId?",
      "response": "Project with stages"
    },
    {
      "method": "GET",
      "path": "/projects/:id",
      "description": "Get project with all stages and current data",
      "auth": true,
      "response": "Project with Stage[]"
    },
    {
      "method": "PUT",
      "path": "/projects/:id",
      "description": "Update project metadata",
      "auth": true,
      "body": "name?, description?, aiProviderId?",
      "response": "Project"
    },
    {
      "method": "DELETE",
      "path": "/projects/:id",
      "description": "Soft delete project",
      "auth": true,
      "response": "void"
    },
    {
      "method": "GET",
      "path": "/projects/:id/stages",
      "description": "List all 9 stages with status",
      "auth": true,
      "response": "Stage[]"
    },
    {
      "method": "GET",
      "path": "/projects/:id/stages/:num",
      "description": "Get specific stage with data and outputs",
      "auth": true,
      "response": "Stage with StageOutput[]"
    },
    {
      "method": "PUT",
      "path": "/projects/:id/stages/:num",
      "description": "Update stage data (human edits)",
      "auth": true,
      "body": "data (jsonb)",
      "response": "Stage"
    },
    {
      "method": "POST",
      "path": "/projects/:id/stages/:num/generate",
      "description": "Trigger AI generation for this stage",
      "auth": true,
      "body": "userInput?, regenerate?",
      "response": "Stage with new StageOutput + AIGeneration"
    },
    {
      "method": "POST",
      "path": "/projects/:id/stages/:num/complete",
      "description": "Validate and mark stage as complete. Unlocks next stage.",
      "auth": true,
      "response": "Stage + validation result"
    },
    {
      "method": "POST",
      "path": "/projects/:id/stages/:num/revert",
      "description": "Revert completed stage to review. Locks all subsequent stages.",
      "auth": true,
      "response": "Stage[]"
    },
    {
      "method": "GET",
      "path": "/projects/:id/stages/:num/outputs",
      "description": "List all output versions for a stage",
      "auth": true,
      "response": "StageOutput[]"
    },
    {
      "method": "POST",
      "path": "/projects/:id/stages/:num/outputs",
      "description": "Create manual output (human-authored)",
      "auth": true,
      "body": "format, content",
      "response": "StageOutput"
    },
    {
      "method": "PUT",
      "path": "/projects/:id/stages/:num/outputs/:outputId/activate",
      "description": "Set a specific output version as active",
      "auth": true,
      "response": "StageOutput"
    },
    {
      "method": "POST",
      "path": "/projects/:id/export",
      "description": "Generate SDP export package",
      "auth": true,
      "body": "format (folder|zip)",
      "response": "ExportPackage"
    },
    {
      "method": "GET",
      "path": "/projects/:id/exports",
      "description": "List export history",
      "auth": true,
      "response": "ExportPackage[]"
    },
    {
      "method": "GET",
      "path": "/projects/:id/exports/:exportId/download",
      "description": "Download export package",
      "auth": true,
      "response": "File stream"
    },
    {
      "method": "POST",
      "path": "/projects/:id/validate",
      "description": "Run cross-reference validation without exporting",
      "auth": true,
      "response": "{status, messages[]}"
    },
    {
      "method": "GET",
      "path": "/projects/:id/generations",
      "description": "List AI generation history for a project",
      "auth": true,
      "response": "AIGeneration[] with cost summaries"
    },
    {
      "method": "GET",
      "path": "/usage",
      "description": "Aggregate usage stats across all projects",
      "auth": true,
      "query": "period (7d|30d|90d|all)",
      "response": "{totalTokens, totalCost, byProject[], byModel[]}"
    },
    {
      "method": "GET",
      "path": "/templates",
      "description": "List available templates",
      "auth": true,
      "response": "Template[]"
    },
    {
      "method": "POST",
      "path": "/projects/:id/apply-template",
      "description": "Apply template to project (fills stage defaults)",
      "auth": true,
      "body": "templateId",
      "response": "Project with updated stages"
    },
    {
      "method": "GET",
      "path": "/projects/:id/mcp-tokens",
      "description": "List MCP tokens for a project",
      "auth": true,
      "response": "MCPToken[]"
    },
    {
      "method": "POST",
      "path": "/projects/:id/mcp-tokens",
      "description": "Create MCP access token for a project",
      "auth": true,
      "body": "label, expiresAt?",
      "response": "MCPToken with plaintext token (shown once)"
    },
    {
      "method": "DELETE",
      "path": "/projects/:id/mcp-tokens/:tokenId",
      "description": "Revoke MCP token",
      "auth": true,
      "response": "void"
    }
  ]
}
```



---
*Imported from SDP on 2026-02-18 18:56*
