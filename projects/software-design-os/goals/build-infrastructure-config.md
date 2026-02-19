---
title: Build Infrastructure Config
status: complete
priority: medium
created: 2026-02-18
source: sdp-import
skills:
- frontend-design
- ci-cd
- docker
- api
- database
- ai-integration
- react-state
- monorepo
skill_paths: []
skills_assigned: '2026-02-18'
---

# Build Infrastructure Config

Stage 8 editor. Define deployment targets, Docker configuration, CI/CD pipelines, and environment variables.

## Acceptance Criteria

- [ ] HostingSelector is implemented and functional — Card grid for selecting hosting approach: Local Docker, Railway, Fly.io, Modal, Vercel+Backend, Custom. Each card shows pricing hints and best-for description.
- [ ] DockerPreview is implemented and functional — Generated Dockerfile and docker-compose.yml with syntax highlighting. Editable in-place. Regenerates when stack or hosting changes.
- [ ] CIPipelineEditor is implemented and functional — Visual pipeline editor showing test → build → deploy stages. Each stage has configurable steps. Generates GitHub Actions YAML.
- [ ] EnvVarManager is implemented and functional — Table of environment variables with name, required flag, default value, and description. AI pre-fills based on stack and infrastructure choices. User can add custom vars.
- [ ] DualViewToggle is implemented and functional — Toggle between Visual Config and raw YAML/JSON output.

## Data Requirements

Reference: `context/data-model.md`

- Stage (stageNumber=8)
- Stage 5 data (stack)
- Stage 3 data (database engine)

## Interactions & Behaviors

- **Select hosting**: Regenerate Docker and CI config for selected target
- **Generate**: AI creates full infra config from stack + hosting choice
- **Edit Dockerfile**: Inline edit with syntax highlighting
- **Add env var**: Add row to environment variable table

## SDP Section Reference

Full specification available at: `context/sdp-source/sections/`

```json
{
  "name": "Infrastructure Config",
  "route": "/projects/:id/stage/8",
  "parentSection": "Pipeline View",
  "description": "Stage 8 editor. Define deployment targets, Docker configuration, CI/CD pipelines, and environment variables.",
  "components": [
    {
      "name": "HostingSelector",
      "description": "Card grid for selecting hosting approach: Local Docker, Railway, Fly.io, Modal, Vercel+Backend, Custom. Each card shows pricing hints and best-for description.",
      "props": [
        "selected: string",
        "onChange"
      ]
    },
    {
      "name": "DockerPreview",
      "description": "Generated Dockerfile and docker-compose.yml with syntax highlighting. Editable in-place. Regenerates when stack or hosting changes.",
      "props": [
        "dockerfile: string",
        "compose: string",
        "onChange"
      ]
    },
    {
      "name": "CIPipelineEditor",
      "description": "Visual pipeline editor showing test \u2192 build \u2192 deploy stages. Each stage has configurable steps. Generates GitHub Actions YAML.",
      "props": [
        "pipeline: CIPipeline",
        "onChange"
      ]
    },
    {
      "name": "EnvVarManager",
      "description": "Table of environment variables with name, required flag, default value, and description. AI pre-fills based on stack and infrastructure choices. User can add custom vars.",
      "props": [
        "envVars: EnvVar[]",
        "onChange"
      ]
    },
    {
      "name": "DualViewToggle",
      "description": "Toggle between Visual Config and raw YAML/JSON output.",
      "props": [
        "mode: visual|yaml|json"
      ]
    }
  ],
  "dataRequirements": [
    "Stage (stageNumber=8)",
    "Stage 5 data (stack)",
    "Stage 3 data (database engine)"
  ],
  "interactions": [
    {
      "trigger": "Select hosting",
      "behavior": "Regenerate Docker and CI config for selected target"
    },
    {
      "trigger": "Generate",
      "behavior": "AI creates full infra config from stack + hosting choice"
    },
    {
      "trigger": "Edit Dockerfile",
      "behavior": "Inline edit with syntax highlighting"
    },
    {
      "trigger": "Add env var",
      "behavior": "Add row to environment variable table"
    }
  ]
}
```
