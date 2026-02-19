---
title: Stage Management API
status: in-progress
priority: critical
created: 2026-02-19
source: sdp-import
skills:
- backend-patterns
- postgres-patterns
skill_paths: []
skills_assigned: '2026-02-19'
---

# Stage Management API

## Objective
Stage lifecycle management: read, update data, complete (validates + unlocks next), revert (locks subsequent). This is the core pipeline engine.

## Context
Depends on `build-project-crud` (complete). Source: `context/sdp-source/sections/backend-goals.json` -> `build-stage-api`.

## Acceptance Criteria
- [x] GET /api/projects/:id/stages -- all 9 stages with status
- [x] GET /api/projects/:id/stages/:num -- stage with outputs
- [x] PUT /api/projects/:id/stages/:num -- save stage data (human edits)
- [x] POST /api/projects/:id/stages/:num/complete -- validate + mark complete + unlock next
- [x] POST /api/projects/:id/stages/:num/revert -- revert to review + lock all subsequent
- [x] Stage lifecycle enforced: locked -> active -> generating -> review -> complete
- [x] Only one stage can be active at a time (plus completed stages)
- [ ] Frontend pipeline view uses real API data
- [ ] Generate/Save/Complete/Revert buttons call real endpoints
- [x] Stage data persisted in JSONB column

## Implementation Summary

**Files created:**
- `apps/api/src/routes/stages.ts` -- All 5 stage endpoints with lifecycle enforcement

**Files modified:**
- `apps/api/src/index.ts` -- Wired stage routes at `/api/projects/:projectId/stages`

**Key decisions:**
- All routes verify project ownership via userId from JWT (IDOR-safe)
- PUT only allowed on active/review stages (not locked/complete)
- Complete marks stage done + unlocks next + updates project.currentStage
- Revert locks all subsequent stages + resets project.currentStage
- Stage outputs joined on GET /:num for full stage detail
