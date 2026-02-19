# Infrastructure & Deployment

## Deployment Configuration

```json
{
  "hosting": {
    "primary": "docker-compose",
    "alternatives": [
      "railway",
      "fly.io",
      "modal"
    ],
    "frontend": {
      "build": "vite build",
      "serve": "served as static files from API or Vercel/Cloudflare Pages"
    }
  },
  "docker": {
    "services": {
      "web": {
        "build": "./apps/web",
        "port": 5173,
        "description": "React frontend dev server (production: built static files served by API)"
      },
      "api": {
        "build": "./apps/api",
        "port": 3000,
        "environment": [
          "DATABASE_URL",
          "JWT_SECRET",
          "CORS_ORIGINS"
        ],
        "dependsOn": [
          "db"
        ]
      },
      "mcp": {
        "build": "./apps/mcp",
        "port": 3100,
        "environment": [
          "DATABASE_URL",
          "MCP_AUTH_SECRET"
        ],
        "dependsOn": [
          "db"
        ]
      },
      "db": {
        "image": "postgres:16-alpine",
        "port": 5432,
        "volumes": [
          "pgdata:/var/lib/postgresql/data"
        ],
        "environment": [
          "POSTGRES_DB=sdos",
          "POSTGRES_USER=sdos",
          "POSTGRES_PASSWORD"
        ]
      }
    }
  },
  "ci": {
    "provider": "github-actions",
    "stages": {
      "test": {
        "trigger": "push to any branch",
        "steps": [
          "pnpm install",
          "pnpm lint",
          "pnpm typecheck",
          "pnpm test"
        ]
      },
      "build": {
        "trigger": "push to main or dev",
        "steps": [
          "docker build",
          "docker push to registry"
        ]
      },
      "deploy": {
        "trigger": "push to main",
        "steps": [
          "deploy to production host"
        ]
      }
    }
  },
  "environment": {
    "required": {
      "DATABASE_URL": "PostgreSQL connection string",
      "JWT_SECRET": "Secret for signing JWT tokens",
      "ENCRYPTION_KEY": "AES-256 key for encrypting API keys at rest"
    },
    "optional": {
      "AI_PROVIDER": "Default AI provider (anthropic|openai|custom), default: anthropic",
      "ANTHROPIC_API_KEY": "Anthropic API key (can also be set per-user in the app)",
      "OPENAI_API_KEY": "OpenAI API key (can also be set per-user in the app)",
      "MCP_SERVER_PORT": "MCP server port, default: 3100",
      "STORAGE_PATH": "SDP export storage path, default: ./exports",
      "CORS_ORIGINS": "Allowed CORS origins, default: http://localhost:5173",
      "LOG_LEVEL": "Logging level, default: info"
    }
  }
}
```



---
*Imported from SDP on 2026-02-18 18:56*
