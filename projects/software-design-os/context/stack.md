# Programming Stack

## Dependencies

```json
{
  "framework": "react",
  "version": "19",
  "bundler": "vite",
  "language": "typescript",
  "styling": {
    "framework": "tailwindcss",
    "version": "4",
    "componentLibrary": "shadcn/ui"
  },
  "stateManagement": {
    "client": "zustand",
    "server": "@tanstack/react-query"
  },
  "routing": "react-router@7",
  "backend": {
    "runtime": "node",
    "framework": "hono",
    "orm": "drizzle",
    "validation": "zod"
  },
  "database": {
    "engine": "postgresql",
    "version": "16"
  },
  "ai": {
    "primarySdk": "@anthropic-ai/sdk",
    "abstraction": "ai",
    "providers": [
      "anthropic",
      "openai",
      "custom"
    ]
  },
  "mcp": {
    "sdk": "@modelcontextprotocol/sdk"
  },
  "testing": {
    "unit": "vitest",
    "e2e": "playwright"
  },
  "monorepo": {
    "tool": "pnpm-workspaces",
    "packages": [
      "apps/web",
      "apps/api",
      "apps/mcp",
      "packages/shared",
      "packages/sdp"
    ]
  },
  "containerization": "docker",
  "ci": "github-actions"
}
```


## Project Structure

```json
{
  "root": "software-design-os",
  "structure": {
    "apps/web/src": {
      "components": [
        "ui/",
        "shared/"
      ],
      "features": {
        "projects": [
          "ProjectList.tsx",
          "CreateProjectModal.tsx",
          "ProjectCard.tsx"
        ],
        "pipeline": [
          "PipelineView.tsx",
          "PipelineProgressBar.tsx",
          "StageNavigation.tsx"
        ],
        "stages": {
          "product-definition": [
            "ProductDefinitionEditor.tsx",
            "FeatureList.tsx",
            "ProblemSolutionPairs.tsx"
          ],
          "data-model": [
            "DataModelEditor.tsx",
            "EntityCard.tsx",
            "FieldEditor.tsx",
            "RelationshipLines.tsx"
          ],
          "database": [
            "DatabaseDesigner.tsx",
            "SchemaPreview.tsx",
            "EngineSelector.tsx"
          ],
          "api-design": [
            "APIDesigner.tsx",
            "EndpointList.tsx",
            "AuthConfig.tsx"
          ],
          "stack": [
            "StackSelector.tsx",
            "DependencyList.tsx",
            "StructurePreview.tsx"
          ],
          "design-system": [
            "DesignSystemEditor.tsx",
            "ColorTokenEditor.tsx",
            "TypographyPreview.tsx",
            "ComponentPreview.tsx"
          ],
          "sections": [
            "SectionBuilder.tsx",
            "ComponentTreeEditor.tsx",
            "SectionPreview.tsx"
          ],
          "infrastructure": [
            "InfraConfig.tsx",
            "DockerPreview.tsx",
            "EnvVarEditor.tsx"
          ],
          "export": [
            "ExportPreview.tsx",
            "SDPTreeView.tsx",
            "ValidationResults.tsx",
            "DownloadButton.tsx"
          ]
        },
        "settings": [
          "SettingsPage.tsx",
          "AIProviderManager.tsx",
          "MCPTokenManager.tsx",
          "UsageStats.tsx"
        ],
        "common": [
          "DualViewToggle.tsx",
          "JSONEditor.tsx",
          "MarkdownPreview.tsx",
          "StageActionBar.tsx"
        ]
      },
      "hooks": [
        "useProject.ts",
        "useStage.ts",
        "useAIGeneration.ts",
        "useExport.ts"
      ],
      "stores": [
        "projectStore.ts",
        "uiStore.ts"
      ],
      "lib": [
        "api.ts",
        "utils.ts",
        "constants.ts"
      ],
      "App.tsx": null,
      "main.tsx": null
    },
    "apps/api/src": {
      "routes": [
        "auth.ts",
        "projects.ts",
        "stages.ts",
        "outputs.ts",
        "generations.ts",
        "exports.ts",
        "templates.ts",
        "providers.ts",
        "mcp-tokens.ts",
        "usage.ts"
      ],
      "services": [
        "projectService.ts",
        "stageService.ts",
        "exportService.ts",
        "validationService.ts",
        "aiService.ts"
      ],
      "ai": {
        "providers": [
          "anthropic.ts",
          "openai.ts",
          "custom.ts",
          "providerFactory.ts"
        ],
        "prompts": [
          "product.ts",
          "dataModel.ts",
          "database.ts",
          "api.ts",
          "stack.ts",
          "design.ts",
          "sections.ts",
          "infrastructure.ts",
          "export.ts"
        ]
      },
      "db": [
        "schema.ts",
        "migrations/",
        "seed.ts"
      ],
      "middleware": [
        "auth.ts",
        "rateLimit.ts",
        "validation.ts"
      ],
      "index.ts": null
    },
    "apps/mcp/src": {
      "tools": [
        "getOverview.ts",
        "getDataModel.ts",
        "getDatabaseSchema.ts",
        "getAPISpec.ts",
        "getStack.ts",
        "getDesignTokens.ts",
        "getSection.ts",
        "getInfrastructure.ts",
        "validate.ts"
      ],
      "auth.ts": null,
      "index.ts": null
    },
    "packages/shared/src": {
      "types": [
        "project.ts",
        "stage.ts",
        "output.ts",
        "generation.ts",
        "template.ts",
        "export.ts",
        "user.ts",
        "mcp.ts"
      ],
      "schemas": [
        "projectSchema.ts",
        "stageDataSchemas.ts",
        "exportSchema.ts"
      ],
      "constants": [
        "stageConfig.ts",
        "models.ts"
      ]
    },
    "packages/sdp/src": {
      "parser.ts": null,
      "generator.ts": null,
      "validator.ts": null,
      "types.ts": null
    },
    "docker-compose.yml": null,
    "Dockerfile": null,
    "pnpm-workspace.yaml": null,
    "package.json": null
  }
}
```



---
*Imported from SDP on 2026-02-18 18:56*
