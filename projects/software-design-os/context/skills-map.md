# Skills Map

*Auto-generated on 2026-02-18 18:57*

This document maps which skills Claude should read before working on each goal.

## How to Use

Before starting any goal, Claude should:

1. Read this file to see which skills are assigned
2. Use the `view` tool to read each listed SKILL.md file
3. Follow the skill's best practices while implementing the goal

## Goal → Skills Matrix

| Goal | Skills | Skill Files to Read |
|------|--------|---------------------|
| _example |  | *(no skill files — use built-in knowledge)* |
| build-api-designer | api, frontend-design, auth, database, ai-integration, react-state, design-tokens, ci-cd | *(no skill files — use built-in knowledge)* |
| build-dashboard | frontend-design, react-state, api, data-visualization, ai-integration, database, ci-cd | *(no skill files — use built-in knowledge)* |
| build-data-model-editor | frontend-design, database, ai-integration, api, react-state, ci-cd | *(no skill files — use built-in knowledge)* |
| build-database-designer | database, frontend-design, ai-integration, react-state, ci-cd, api, design-tokens | *(no skill files — use built-in knowledge)* |
| build-design-system-editor | frontend-design, design-tokens, ai-integration, ci-cd, api, react-state | *(no skill files — use built-in knowledge)* |
| build-export-preview | export-packaging, frontend-design, api, ai-integration, database, react-state, mcp, design-tokens, ci-cd | *(no skill files — use built-in knowledge)* |
| build-infrastructure-config | frontend-design, ci-cd, docker, api, database, ai-integration, react-state, monorepo | *(no skill files — use built-in knowledge)* |
| build-pipeline | frontend-design, react-state, api, ai-integration, monorepo, ci-cd | *(no skill files — use built-in knowledge)* |
| build-product-definition | frontend-design, ai-integration, api, react-state, ci-cd, database | *(no skill files — use built-in knowledge)* |
| build-section-builder | frontend-design, ai-integration, api, ci-cd, react-state, design-tokens | *(no skill files — use built-in knowledge)* |
| build-settings | data-visualization, frontend-design, api, ai-integration, react-state, mcp, auth, design-tokens, ci-cd, database | *(no skill files — use built-in knowledge)* |
| build-stack-selector | frontend-design, ci-cd, database, react-state, api, ai-integration, monorepo, export-packaging | *(no skill files — use built-in knowledge)* |
| manifest |  | *(no skill files — use built-in knowledge)* |


## Detailed Assignments

### _example
**_example**

- *No specific skills assigned — use general knowledge*

### build-api-designer
**Build API Designer**

- 🧠 **api** (relevance: 23) → *use built-in knowledge*
  - Why: keywords: endpoint, route, api, POST, GET; goal pattern: build-api.*; 10 keyword hits in SDP section
- 🧠 **frontend-design** (relevance: 17) → *use built-in knowledge*
  - Why: keywords: component, form, toggle, badge, preview; goal pattern: build-.*; applies to all build-* goals; 6 keyword hits in SDP section
- 🧠 **auth** (relevance: 13) → *use built-in knowledge*
  - Why: keywords: auth, jwt, token, session; goal pattern: build-api-designer; file type: auth; 4 keyword hits in SDP section
- 🧠 **database** (relevance: 12) → *use built-in knowledge*
  - Why: keywords: schema, gin, entity, query, orm; file type: schema; 5 keyword hits in SDP section
- 🧠 **ai-integration** (relevance: 10) → *use built-in knowledge*
  - Why: keywords: ai, generate, model, token; goal pattern: build-api-designer; 3 keyword hits in SDP section
- 🧠 **react-state** (relevance: 5) → *use built-in knowledge*
  - Why: goal pattern: build-.*; applies to all build-* goals
- 🧠 **design-tokens** (relevance: 4) → *use built-in knowledge*
  - Why: keywords: token, color; file type: design
- 🧠 **ci-cd** (relevance: 3) → *use built-in knowledge*
  - Why: keywords: ci, pipeline, build
- 🔗 Composite: **pipeline-stage-editor** — A pipeline stage editor with AI generation, data editing, and dual-view

### build-dashboard
**Build Dashboard**

- 🧠 **frontend-design** (relevance: 19) → *use built-in knowledge*
  - Why: keywords: component, card, modal, grid, responsive; goal pattern: build-.*; applies to all build-* goals; 7 keyword hits in SDP section
- 🧠 **react-state** (relevance: 15) → *use built-in knowledge*
  - Why: keywords: useQuery, state, stateManagement, serverState, clientState; goal pattern: build-.*; applies to all build-* goals; 5 keyword hits in SDP section
- 🧠 **api** (relevance: 11) → *use built-in knowledge*
  - Why: keywords: route, api, POST, fetch; goal pattern: build-dashboard; 4 keyword hits in SDP section
- 🧠 **data-visualization** (relevance: 11) → *use built-in knowledge*
  - Why: keywords: stats, cost, aggregate, progress bar; goal pattern: build-dashboard; 4 keyword hits in SDP section
- 🧠 **ai-integration** (relevance: 9) → *use built-in knowledge*
  - Why: keywords: ai, generation, model, cost, provider; 4 keyword hits in SDP section
- 🧠 **database** (relevance: 6) → *use built-in knowledge*
  - Why: keywords: uuid, query, orm; 3 keyword hits in SDP section
- 🧠 **ci-cd** (relevance: 5) → *use built-in knowledge*
  - Why: keywords: ci, pipeline, build; file type: ci
- 🔗 Composite: **full-stack-section** — Full-stack feature requiring frontend, API, and database work

### build-data-model-editor
**Build Data Model Editor**

- 🧠 **frontend-design** (relevance: 27) → *use built-in knowledge*
  - Why: keywords: component, layout, card, grid, button; goal pattern: build-.*; applies to all build-* goals; 11 keyword hits in SDP section
- 🧠 **database** (relevance: 15) → *use built-in knowledge*
  - Why: keywords: table, jsonb, uuid, foreign key, entity; goal pattern: build-data-model.*; 6 keyword hits in SDP section
- 🧠 **ai-integration** (relevance: 9) → *use built-in knowledge*
  - Why: keywords: ai, generate, model; goal pattern: build-data-model.*; 3 keyword hits in SDP section
- 🧠 **api** (relevance: 8) → *use built-in knowledge*
  - Why: keywords: route, GET, PUT, DELETE; 4 keyword hits in SDP section
- 🧠 **react-state** (relevance: 5) → *use built-in knowledge*
  - Why: goal pattern: build-.*; applies to all build-* goals
- 🧠 **ci-cd** (relevance: 5) → *use built-in knowledge*
  - Why: keywords: ci, pipeline, build; file type: ci
- 🔗 Composite: **pipeline-stage-editor** — A pipeline stage editor with AI generation, data editing, and dual-view

### build-database-designer
**Build Database Designer**

- 🧠 **database** (relevance: 25) → *use built-in knowledge*
  - Why: keywords: database, schema, table, column, index; goal pattern: build-database.*; file type: schema; 10 keyword hits in SDP section
- 🧠 **frontend-design** (relevance: 23) → *use built-in knowledge*
  - Why: keywords: component, card, grid, button, table; goal pattern: build-.*; applies to all build-* goals; 9 keyword hits in SDP section
- 🧠 **ai-integration** (relevance: 9) → *use built-in knowledge*
  - Why: keywords: ai, generate, model; goal pattern: build-database.*; 3 keyword hits in SDP section
- 🧠 **react-state** (relevance: 5) → *use built-in knowledge*
  - Why: goal pattern: build-.*; applies to all build-* goals
- 🧠 **ci-cd** (relevance: 3) → *use built-in knowledge*
  - Why: keywords: ci, pipeline, build
- 🧠 **api** (relevance: 2) → *use built-in knowledge*
  - Why: keywords: route, POST
- 🧠 **design-tokens** (relevance: 2) → *use built-in knowledge*
  - Why: file type: design
- 🔗 Composite: **pipeline-stage-editor** — A pipeline stage editor with AI generation, data editing, and dual-view

### build-design-system-editor
**Build Design System Editor**

- 🧠 **frontend-design** (relevance: 37) → *use built-in knowledge*
  - Why: keywords: component, layout, sidebar, navigation, card; goal pattern: build-.*; applies to all build-* goals; 16 keyword hits in SDP section
- 🧠 **design-tokens** (relevance: 27) → *use built-in knowledge*
  - Why: keywords: design system, token, color, palette, typography; goal pattern: build-design-system.*; file type: tokens; 11 keyword hits in SDP section
- 🧠 **ai-integration** (relevance: 10) → *use built-in knowledge*
  - Why: keywords: ai, generate, model, token; goal pattern: build-design-system.*; 3 keyword hits in SDP section
- 🧠 **ci-cd** (relevance: 8) → *use built-in knowledge*
  - Why: keywords: ci, pipeline, build; file type: ci; 3 keyword hits in SDP section
- 🧠 **api** (relevance: 6) → *use built-in knowledge*
  - Why: keywords: route, PUT, token; 3 keyword hits in SDP section
- 🧠 **react-state** (relevance: 5) → *use built-in knowledge*
  - Why: goal pattern: build-.*; applies to all build-* goals
- 🔗 Composite: **pipeline-stage-editor** — A pipeline stage editor with AI generation, data editing, and dual-view

### build-export-preview
**Build Export Preview**

- 🧠 **export-packaging** (relevance: 25) → *use built-in knowledge*
  - Why: keywords: export, package, zip, download, validation; goal pattern: build-export.*; file type: export; 10 keyword hits in SDP section
- 🧠 **frontend-design** (relevance: 19) → *use built-in knowledge*
  - Why: keywords: component, button, form, badge, icon; goal pattern: build-.*; applies to all build-* goals; 7 keyword hits in SDP section
- 🧠 **api** (relevance: 15) → *use built-in knowledge*
  - Why: keywords: endpoint, route, api, POST, token; goal pattern: build-export.*; 6 keyword hits in SDP section
- 🧠 **ai-integration** (relevance: 7) → *use built-in knowledge*
  - Why: keywords: ai, generate, model, token; 3 keyword hits in SDP section
- 🧠 **database** (relevance: 6) → *use built-in knowledge*
  - Why: keywords: entity, sql, orm; 3 keyword hits in SDP section
- 🧠 **react-state** (relevance: 5) → *use built-in knowledge*
  - Why: goal pattern: build-.*; applies to all build-* goals
- 🧠 **mcp** (relevance: 3) → *use built-in knowledge*
  - Why: goal pattern: build-export.*
- 🧠 **design-tokens** (relevance: 3) → *use built-in knowledge*
  - Why: keywords: token; file type: design
- 🧠 **ci-cd** (relevance: 3) → *use built-in knowledge*
  - Why: keywords: ci, pipeline, build
- 🔗 Composite: **full-stack-section** — Full-stack feature requiring frontend, API, and database work

### build-infrastructure-config
**Build Infrastructure Config**

- 🧠 **frontend-design** (relevance: 21) → *use built-in knowledge*
  - Why: keywords: component, card, modal, grid, table; goal pattern: build-.*; applies to all build-* goals; 8 keyword hits in SDP section
- 🧠 **ci-cd** (relevance: 19) → *use built-in knowledge*
  - Why: keywords: ci, cd, pipeline, github actions, deploy; goal pattern: build-infrastructure.*; file type: .yml; 7 keyword hits in SDP section
- 🧠 **docker** (relevance: 15) → *use built-in knowledge*
  - Why: keywords: docker, compose, dockerfile, environment, deploy; goal pattern: build-infrastructure.*; file type: docker; 5 keyword hits in SDP section
- 🧠 **api** (relevance: 6) → *use built-in knowledge*
  - Why: keywords: route, GET, PUT; 3 keyword hits in SDP section
- 🧠 **database** (relevance: 6) → *use built-in knowledge*
  - Why: keywords: database, table, gin; 3 keyword hits in SDP section
- 🧠 **ai-integration** (relevance: 6) → *use built-in knowledge*
  - Why: keywords: ai, generate, model; goal pattern: build-infrastructure.*
- 🧠 **react-state** (relevance: 5) → *use built-in knowledge*
  - Why: goal pattern: build-.*; applies to all build-* goals
- 🧠 **monorepo** (relevance: 3) → *use built-in knowledge*
  - Why: goal pattern: build-infrastructure.*
- 🔗 Composite: **pipeline-stage-editor** — A pipeline stage editor with AI generation, data editing, and dual-view

### build-pipeline
**Build Pipeline View**

- 🧠 **frontend-design** (relevance: 21) → *use built-in knowledge*
  - Why: keywords: component, layout, navigation, button, tooltip; goal pattern: build-.*; applies to all build-* goals; 8 keyword hits in SDP section
- 🧠 **react-state** (relevance: 17) → *use built-in knowledge*
  - Why: keywords: useQuery, useMutation, state, stateManagement, serverState; goal pattern: build-.*; applies to all build-* goals; 6 keyword hits in SDP section
- 🧠 **api** (relevance: 10) → *use built-in knowledge*
  - Why: keywords: route, api, POST, PUT, mutation; 5 keyword hits in SDP section
- 🧠 **ai-integration** (relevance: 7) → *use built-in knowledge*
  - Why: keywords: ai, generation, generate, model; 3 keyword hits in SDP section
- 🧠 **monorepo** (relevance: 4) → *use built-in knowledge*
  - Why: keywords: workspace; goal pattern: build-pipeline
- 🧠 **ci-cd** (relevance: 3) → *use built-in knowledge*
  - Why: keywords: ci, pipeline, build

### build-product-definition
**Build Product Definition Editor**

- 🧠 **frontend-design** (relevance: 27) → *use built-in knowledge*
  - Why: keywords: component, card, grid, button, form; goal pattern: build-.*; applies to all build-* goals; 11 keyword hits in SDP section
- 🧠 **ai-integration** (relevance: 10) → *use built-in knowledge*
  - Why: keywords: ai, generation, generate, model; goal pattern: build-product-definition; 3 keyword hits in SDP section
- 🧠 **api** (relevance: 8) → *use built-in knowledge*
  - Why: keywords: route, POST, GET, PUT; 4 keyword hits in SDP section
- 🧠 **react-state** (relevance: 5) → *use built-in knowledge*
  - Why: goal pattern: build-.*; applies to all build-* goals
- 🧠 **ci-cd** (relevance: 3) → *use built-in knowledge*
  - Why: keywords: ci, pipeline, build
- 🧠 **database** (relevance: 2) → *use built-in knowledge*
  - Why: keywords: table, orm
- 🔗 Composite: **pipeline-stage-editor** — A pipeline stage editor with AI generation, data editing, and dual-view

### build-section-builder
**Build Section Builder**

- 🧠 **frontend-design** (relevance: 25) → *use built-in knowledge*
  - Why: keywords: component, layout, button, tabs, toggle; goal pattern: build-.*; applies to all build-* goals; 10 keyword hits in SDP section
- 🧠 **ai-integration** (relevance: 10) → *use built-in knowledge*
  - Why: keywords: ai, generate, model, token; goal pattern: build-section-builder; 3 keyword hits in SDP section
- 🧠 **api** (relevance: 8) → *use built-in knowledge*
  - Why: keywords: route, api, DELETE, token; 4 keyword hits in SDP section
- 🧠 **ci-cd** (relevance: 8) → *use built-in knowledge*
  - Why: keywords: ci, pipeline, build; file type: ci; 3 keyword hits in SDP section
- 🧠 **react-state** (relevance: 7) → *use built-in knowledge*
  - Why: keywords: state, stateManagement; goal pattern: build-.*; applies to all build-* goals
- 🧠 **design-tokens** (relevance: 3) → *use built-in knowledge*
  - Why: keywords: token; file type: tokens
- 🔗 Composite: **pipeline-stage-editor** — A pipeline stage editor with AI generation, data editing, and dual-view

### build-settings
**Build Settings**

- 🧠 **data-visualization** (relevance: 25) → *use built-in knowledge*
  - Why: keywords: chart, stats, statistics, usage, cost; goal pattern: build-settings; 11 keyword hits in SDP section
- 🧠 **frontend-design** (relevance: 19) → *use built-in knowledge*
  - Why: keywords: component, navigation, card, button, form; goal pattern: build-.*; applies to all build-* goals; 7 keyword hits in SDP section
- 🧠 **api** (relevance: 17) → *use built-in knowledge*
  - Why: keywords: route, api, POST, GET, PUT; goal pattern: build-settings; 7 keyword hits in SDP section
- 🧠 **ai-integration** (relevance: 17) → *use built-in knowledge*
  - Why: keywords: ai, generation, model, token, cost; goal pattern: build-settings; file type: providers; 6 keyword hits in SDP section
- 🧠 **react-state** (relevance: 5) → *use built-in knowledge*
  - Why: goal pattern: build-.*; applies to all build-* goals
- 🧠 **mcp** (relevance: 5) → *use built-in knowledge*
  - Why: keywords: mcp, mcp token; goal pattern: build-settings
- 🧠 **auth** (relevance: 4) → *use built-in knowledge*
  - Why: keywords: token; goal pattern: build-settings
- 🧠 **design-tokens** (relevance: 3) → *use built-in knowledge*
  - Why: keywords: token; file type: tokens
- 🧠 **ci-cd** (relevance: 3) → *use built-in knowledge*
  - Why: keywords: ci, build, test
- 🧠 **database** (relevance: 2) → *use built-in knowledge*
  - Why: keywords: gin, orm
- 🔗 Composite: **full-stack-section** — Full-stack feature requiring frontend, API, and database work

### build-stack-selector
**Build Stack Selector**

- 🧠 **frontend-design** (relevance: 21) → *use built-in knowledge*
  - Why: keywords: component, card, tailwind, table, toggle; goal pattern: build-.*; applies to all build-* goals; 8 keyword hits in SDP section
- 🧠 **ci-cd** (relevance: 9) → *use built-in knowledge*
  - Why: keywords: ci, pipeline, build, test; file type: ci; 3 keyword hits in SDP section
- 🧠 **database** (relevance: 8) → *use built-in knowledge*
  - Why: keywords: table, drizzle, gin, orm; 4 keyword hits in SDP section
- 🧠 **react-state** (relevance: 7) → *use built-in knowledge*
  - Why: keywords: zustand, state; goal pattern: build-.*; applies to all build-* goals
- 🧠 **api** (relevance: 6) → *use built-in knowledge*
  - Why: keywords: route, api, hono; 3 keyword hits in SDP section
- 🧠 **ai-integration** (relevance: 6) → *use built-in knowledge*
  - Why: keywords: ai, generate, model; goal pattern: build-stack-selector
- 🧠 **monorepo** (relevance: 4) → *use built-in knowledge*
  - Why: keywords: package, packages; file type: package.json
- 🧠 **export-packaging** (relevance: 2) → *use built-in knowledge*
  - Why: keywords: package, sdp
- 🔗 Composite: **pipeline-stage-editor** — A pipeline stage editor with AI generation, data editing, and dual-view

### manifest
**manifest**

- *No specific skills assigned — use general knowledge*


## Skill Usage Summary

| Skill | Used In # Goals | Has Skill File |
|-------|-----------------|----------------|
| api | 12 | ❌ |
| frontend-design | 12 | ❌ |
| ai-integration | 12 | ❌ |
| react-state | 12 | ❌ |
| ci-cd | 12 | ❌ |
| database | 9 | ❌ |
| design-tokens | 6 | ❌ |
| monorepo | 3 | ❌ |
| auth | 2 | ❌ |
| data-visualization | 2 | ❌ |
| export-packaging | 2 | ❌ |
| mcp | 2 | ❌ |
| docker | 1 | ❌ |


---
*Generated by skills assigner — re-run `assign_skills.py` to update*
