# Database Design

**Engine:** postgresql


## Schema Configuration

```json
{
  "engine": "postgresql",
  "version": "16",
  "orm": "drizzle",
  "features": [
    "jsonb",
    "uuid_extension",
    "gin_indexes"
  ],
  "schemas": {
    "users": {
      "table": "users",
      "primaryKey": "id",
      "columns": {
        "id": "uuid DEFAULT gen_random_uuid() PRIMARY KEY",
        "email": "varchar(255) UNIQUE NOT NULL",
        "name": "varchar(255) NOT NULL",
        "avatar_url": "text",
        "preferences": "jsonb DEFAULT '{}'",
        "created_at": "timestamptz DEFAULT now() NOT NULL",
        "updated_at": "timestamptz DEFAULT now() NOT NULL"
      },
      "indexes": [
        "CREATE UNIQUE INDEX idx_users_email ON users(email)"
      ]
    },
    "ai_provider_configs": {
      "table": "ai_provider_configs",
      "primaryKey": "id",
      "columns": {
        "id": "uuid DEFAULT gen_random_uuid() PRIMARY KEY",
        "user_id": "uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE",
        "provider": "varchar(20) NOT NULL CHECK (provider IN ('anthropic','openai','custom'))",
        "label": "varchar(255) NOT NULL",
        "api_key_encrypted": "text NOT NULL",
        "default_model": "varchar(100) NOT NULL",
        "base_url": "text",
        "is_default": "boolean DEFAULT false NOT NULL",
        "created_at": "timestamptz DEFAULT now() NOT NULL"
      },
      "indexes": [
        "CREATE INDEX idx_ai_configs_user ON ai_provider_configs(user_id)"
      ]
    },
    "projects": {
      "table": "projects",
      "primaryKey": "id",
      "columns": {
        "id": "uuid DEFAULT gen_random_uuid() PRIMARY KEY",
        "user_id": "uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE",
        "name": "varchar(255) NOT NULL",
        "slug": "varchar(255) NOT NULL",
        "description": "text",
        "current_stage": "integer DEFAULT 1 NOT NULL",
        "status": "varchar(20) DEFAULT 'active' NOT NULL CHECK (status IN ('active','archived','deleted'))",
        "ai_provider_id": "uuid REFERENCES ai_provider_configs(id)",
        "template_id": "uuid REFERENCES templates(id)",
        "created_at": "timestamptz DEFAULT now() NOT NULL",
        "updated_at": "timestamptz DEFAULT now() NOT NULL",
        "deleted_at": "timestamptz"
      },
      "indexes": [
        "CREATE INDEX idx_projects_user ON projects(user_id)",
        "CREATE UNIQUE INDEX idx_projects_user_slug ON projects(user_id, slug) WHERE deleted_at IS NULL"
      ]
    },
    "stages": {
      "table": "stages",
      "primaryKey": "id",
      "columns": {
        "id": "uuid DEFAULT gen_random_uuid() PRIMARY KEY",
        "project_id": "uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE",
        "stage_number": "integer NOT NULL CHECK (stage_number BETWEEN 1 AND 9)",
        "stage_name": "varchar(20) NOT NULL",
        "stage_label": "varchar(50) NOT NULL",
        "status": "varchar(20) DEFAULT 'locked' NOT NULL CHECK (status IN ('locked','active','generating','review','complete'))",
        "data": "jsonb",
        "user_input": "text",
        "validated_at": "timestamptz",
        "completed_at": "timestamptz",
        "created_at": "timestamptz DEFAULT now() NOT NULL",
        "updated_at": "timestamptz DEFAULT now() NOT NULL"
      },
      "indexes": [
        "CREATE UNIQUE INDEX idx_stages_project_number ON stages(project_id, stage_number)",
        "CREATE INDEX idx_stages_data ON stages USING GIN(data)"
      ]
    },
    "stage_outputs": {
      "table": "stage_outputs",
      "primaryKey": "id",
      "columns": {
        "id": "uuid DEFAULT gen_random_uuid() PRIMARY KEY",
        "stage_id": "uuid NOT NULL REFERENCES stages(id) ON DELETE CASCADE",
        "version": "integer NOT NULL",
        "format": "varchar(10) NOT NULL CHECK (format IN ('json','md','sql','yaml'))",
        "content": "text NOT NULL",
        "generated_by": "varchar(10) NOT NULL CHECK (generated_by IN ('ai','human'))",
        "ai_generation_id": "uuid REFERENCES ai_generations(id)",
        "is_active": "boolean DEFAULT true NOT NULL",
        "created_at": "timestamptz DEFAULT now() NOT NULL"
      },
      "indexes": [
        "CREATE INDEX idx_outputs_stage ON stage_outputs(stage_id)",
        "CREATE UNIQUE INDEX idx_outputs_stage_version ON stage_outputs(stage_id, version)"
      ]
    },
    "ai_generations": {
      "table": "ai_generations",
      "primaryKey": "id",
      "columns": {
        "id": "uuid DEFAULT gen_random_uuid() PRIMARY KEY",
        "stage_id": "uuid NOT NULL REFERENCES stages(id) ON DELETE CASCADE",
        "provider_id": "uuid NOT NULL REFERENCES ai_provider_configs(id)",
        "model": "varchar(100) NOT NULL",
        "prompt_template": "varchar(100) NOT NULL",
        "input_tokens": "integer NOT NULL",
        "output_tokens": "integer NOT NULL",
        "total_tokens": "integer NOT NULL",
        "estimated_cost": "decimal(10,6) NOT NULL",
        "duration_ms": "integer NOT NULL",
        "status": "varchar(10) NOT NULL CHECK (status IN ('success','error','timeout'))",
        "error_message": "text",
        "created_at": "timestamptz DEFAULT now() NOT NULL"
      },
      "indexes": [
        "CREATE INDEX idx_generations_stage ON ai_generations(stage_id)",
        "CREATE INDEX idx_generations_created ON ai_generations(created_at)"
      ]
    },
    "templates": {
      "table": "templates",
      "primaryKey": "id",
      "columns": {
        "id": "uuid DEFAULT gen_random_uuid() PRIMARY KEY",
        "name": "varchar(255) NOT NULL",
        "description": "text NOT NULL",
        "category": "varchar(20) NOT NULL CHECK (category IN ('saas','api','landing','mobile','cli','fullstack','other'))",
        "icon": "varchar(50)",
        "stage_defaults": "jsonb NOT NULL",
        "is_built_in": "boolean DEFAULT false NOT NULL",
        "created_at": "timestamptz DEFAULT now() NOT NULL"
      }
    },
    "export_packages": {
      "table": "export_packages",
      "primaryKey": "id",
      "columns": {
        "id": "uuid DEFAULT gen_random_uuid() PRIMARY KEY",
        "project_id": "uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE",
        "format": "varchar(10) NOT NULL CHECK (format IN ('folder','zip'))",
        "validation_status": "varchar(10) NOT NULL CHECK (validation_status IN ('valid','warnings','errors'))",
        "validation_messages": "jsonb",
        "file_path": "text NOT NULL",
        "file_size_bytes": "integer NOT NULL",
        "exported_at": "timestamptz DEFAULT now() NOT NULL"
      },
      "indexes": [
        "CREATE INDEX idx_exports_project ON export_packages(project_id)"
      ]
    },
    "mcp_tokens": {
      "table": "mcp_tokens",
      "primaryKey": "id",
      "columns": {
        "id": "uuid DEFAULT gen_random_uuid() PRIMARY KEY",
        "user_id": "uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE",
        "project_id": "uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE",
        "token_hash": "varchar(64) NOT NULL",
        "label": "varchar(255) NOT NULL",
        "last_used_at": "timestamptz",
        "expires_at": "timestamptz",
        "created_at": "timestamptz DEFAULT now() NOT NULL"
      },
      "indexes": [
        "CREATE UNIQUE INDEX idx_mcp_token_hash ON mcp_tokens(token_hash)",
        "CREATE INDEX idx_mcp_tokens_project ON mcp_tokens(project_id)"
      ]
    }
  },
  "seedStrategy": "Built-in templates are seeded on first run. Demo project optional."
}
```



---
*Imported from SDP on 2026-02-18 18:56*
