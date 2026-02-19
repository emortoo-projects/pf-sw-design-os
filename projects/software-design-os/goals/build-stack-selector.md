---
title: Build Stack Selector
status: not-started
priority: medium
created: 2026-02-18
source: sdp-import
skills:
- frontend-design
- ci-cd
- database
- react-state
- api
- ai-integration
- monorepo
- export-packaging
skill_paths: []
skills_assigned: '2026-02-18'
---

# Build Stack Selector

Stage 5 editor. Select or let AI recommend the technology stack. Covers frontend framework, backend, state management, styling, testing, and project structure.

## Acceptance Criteria

- [ ] StackRecommendation is implemented and functional — AI-generated recommendation card explaining why a particular stack suits this project. Includes confidence score and reasoning.
- [ ] CategoryPicker is implemented and functional — Grouped selection for each stack category: Frontend (React/Next.js/Vue/Svelte), Backend (Hono/Express/FastAPI), Styling (Tailwind/CSS Modules/styled-components), State (Zustand/Redux/Jotai), Testing (Vitest/Jest), ORM (Drizzle/Prisma).
- [ ] DependencyList is implemented and functional — Generated list of npm/pip packages with version constraints. Editable — user can add/remove packages. Shows total bundle size estimate.
- [ ] StructurePreview is implemented and functional — Tree view of recommended project folder structure. Expandable folders showing where key files go.
- [ ] DualViewToggle is implemented and functional — Toggle between Visual Picker, package.json preview, and JSON config.

## Data Requirements

Reference: `context/data-model.md`

- Stage (stageNumber=5)
- Stage 1 data (product type/features)
- Stage 3 data (DB engine)

## Interactions & Behaviors

- **Generate**: AI recommends stack based on product requirements
- **Change selection**: Update dependencies and structure preview reactively
- **Add/remove dependency**: Edit dependency list directly
- **Toggle structure view**: Expand/collapse folders in tree preview

## SDP Section Reference

Full specification available at: `context/sdp-source/sections/`

```json
{
  "name": "Stack Selector",
  "route": "/projects/:id/stage/5",
  "parentSection": "Pipeline View",
  "description": "Stage 5 editor. Select or let AI recommend the technology stack. Covers frontend framework, backend, state management, styling, testing, and project structure.",
  "components": [
    {
      "name": "StackRecommendation",
      "description": "AI-generated recommendation card explaining why a particular stack suits this project. Includes confidence score and reasoning.",
      "props": [
        "recommendation: StackRec"
      ]
    },
    {
      "name": "CategoryPicker",
      "description": "Grouped selection for each stack category: Frontend (React/Next.js/Vue/Svelte), Backend (Hono/Express/FastAPI), Styling (Tailwind/CSS Modules/styled-components), State (Zustand/Redux/Jotai), Testing (Vitest/Jest), ORM (Drizzle/Prisma).",
      "props": [
        "categories: Category[]",
        "selections: Record<string, string>",
        "onChange"
      ]
    },
    {
      "name": "DependencyList",
      "description": "Generated list of npm/pip packages with version constraints. Editable \u2014 user can add/remove packages. Shows total bundle size estimate.",
      "props": [
        "dependencies: Dependency[]",
        "onChange"
      ]
    },
    {
      "name": "StructurePreview",
      "description": "Tree view of recommended project folder structure. Expandable folders showing where key files go.",
      "props": [
        "structure: FolderTree"
      ]
    },
    {
      "name": "DualViewToggle",
      "description": "Toggle between Visual Picker, package.json preview, and JSON config.",
      "props": [
        "mode: visual|packagejson|json"
      ]
    }
  ],
  "dataRequirements": [
    "Stage (stageNumber=5)",
    "Stage 1 data (product type/features)",
    "Stage 3 data (DB engine)"
  ],
  "interactions": [
    {
      "trigger": "Generate",
      "behavior": "AI recommends stack based on product requirements"
    },
    {
      "trigger": "Change selection",
      "behavior": "Update dependencies and structure preview reactively"
    },
    {
      "trigger": "Add/remove dependency",
      "behavior": "Edit dependency list directly"
    },
    {
      "trigger": "Toggle structure view",
      "behavior": "Expand/collapse folders in tree preview"
    }
  ]
}
```
