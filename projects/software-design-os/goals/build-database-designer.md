---
title: Build Database Designer
status: complete
priority: medium
created: 2026-02-18
source: sdp-import
skills:
- database
- frontend-design
- ai-integration
- react-state
- ci-cd
- api
- design-tokens
skill_paths: []
skills_assigned: '2026-02-18'
---

# Build Database Designer

Stage 3 editor. Translates the abstract data model into a concrete database schema. User selects a DB engine, AI generates the schema with indexing strategy and migrations.

## Acceptance Criteria

- [ ] EngineSelector is implemented and functional — Card grid for selecting database engine: PostgreSQL, MySQL, SQLite, MongoDB, Supabase, PlanetScale. Each card shows engine logo, name, and brief pros. Selected engine is highlighted.
- [ ] SchemaPreview is implemented and functional — Read-only syntax-highlighted SQL (or equivalent) preview of the generated schema. Copy button. For MongoDB shows JSON schema.
- [ ] IndexingStrategy is implemented and functional — Table showing recommended indexes with table, columns, type (btree/gin/unique), and rationale. User can add/remove indexes.
- [ ] MigrationPlan is implemented and functional — Ordered list of migration steps with descriptions. Shows what each migration creates/modifies.
- [ ] DualViewToggle is implemented and functional — Toggle between Visual Schema (table diagram), SQL Preview, and JSON Config.

## Data Requirements

Reference: `context/data-model.md`

- Stage (stageNumber=3)
- Stage 2 data (entities + relationships)

## Interactions & Behaviors

- **Select DB engine**: Regenerate schema for selected engine
- **Generate**: AI creates schema from data model + engine choice
- **Edit indexes**: Add/remove from indexing strategy table
- **Copy SQL**: Copy schema SQL to clipboard

## SDP Section Reference

Full specification available at: `context/sdp-source/sections/`

```json
{
  "name": "Database Designer",
  "route": "/projects/:id/stage/3",
  "parentSection": "Pipeline View",
  "description": "Stage 3 editor. Translates the abstract data model into a concrete database schema. User selects a DB engine, AI generates the schema with indexing strategy and migrations.",
  "components": [
    {
      "name": "EngineSelector",
      "description": "Card grid for selecting database engine: PostgreSQL, MySQL, SQLite, MongoDB, Supabase, PlanetScale. Each card shows engine logo, name, and brief pros. Selected engine is highlighted.",
      "props": [
        "selected: string",
        "onChange"
      ]
    },
    {
      "name": "SchemaPreview",
      "description": "Read-only syntax-highlighted SQL (or equivalent) preview of the generated schema. Copy button. For MongoDB shows JSON schema.",
      "props": [
        "schema: string",
        "language: sql|json"
      ]
    },
    {
      "name": "IndexingStrategy",
      "description": "Table showing recommended indexes with table, columns, type (btree/gin/unique), and rationale. User can add/remove indexes.",
      "props": [
        "indexes: Index[]",
        "onChange"
      ]
    },
    {
      "name": "MigrationPlan",
      "description": "Ordered list of migration steps with descriptions. Shows what each migration creates/modifies.",
      "props": [
        "migrations: Migration[]"
      ]
    },
    {
      "name": "DualViewToggle",
      "description": "Toggle between Visual Schema (table diagram), SQL Preview, and JSON Config.",
      "props": [
        "mode: visual|sql|json"
      ]
    }
  ],
  "dataRequirements": [
    "Stage (stageNumber=3)",
    "Stage 2 data (entities + relationships)"
  ],
  "interactions": [
    {
      "trigger": "Select DB engine",
      "behavior": "Regenerate schema for selected engine"
    },
    {
      "trigger": "Generate",
      "behavior": "AI creates schema from data model + engine choice"
    },
    {
      "trigger": "Edit indexes",
      "behavior": "Add/remove from indexing strategy table"
    },
    {
      "trigger": "Copy SQL",
      "behavior": "Copy schema SQL to clipboard"
    }
  ]
}
```
