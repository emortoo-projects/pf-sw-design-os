---
title: Project CRUD API
status: complete
priority: critical
created: 2026-02-19
source: sdp-import
skills:
- backend-patterns
- postgres-patterns
- security-review
skill_paths: []
skills_assigned: '2026-02-19'
---

# Project CRUD API

## Objective
Full project lifecycle: create, read, update, soft delete. Creating a project auto-generates 9 locked stages. Replace frontend mock data with real API calls.

## Context
Depends on `setup-auth` (complete). Source: `context/sdp-source/sections/backend-goals.json` -> `build-project-crud`.

## Acceptance Criteria
- [x] GET /api/projects -- list user's projects with stage summaries
- [x] POST /api/projects -- create project + 9 stages (stage 1 = active, rest locked)
- [x] GET /api/projects/:id -- project with all stages
- [x] PUT /api/projects/:id -- update project metadata
- [x] DELETE /api/projects/:id -- soft delete
- [x] Frontend Dashboard fetches real projects from API
- [x] CreateProjectModal calls POST /api/projects
- [x] Project cards show real stage progress data
- [x] Template application pre-fills stage defaults on create

## Implementation Summary

**Files created:**
- `apps/api/src/routes/templates.ts` -- GET /api/templates listing

**Files modified:**
- `apps/api/src/routes/projects.ts` -- Full rewrite: mock data replaced with real Drizzle queries, all routes scoped by userId
- `apps/api/src/index.ts` -- Wired template routes
- `apps/web/src/lib/api-client.ts` -- Added updateProject, deleteProject, listTemplates to interface + both impls
- `apps/web/src/hooks/use-projects.ts` -- Added useUpdateProject, useDeleteProject, useTemplates hooks

**Key decisions:**
- All routes filter by `userId` from JWT context (IDOR-safe)
- Soft delete sets `status='deleted'` + `deletedAt` timestamp
- Unique slug generation with collision-safe suffix loop
- Invalid templateId returns 400 (not silently ignored)
- Template defaults applied per-stage via `config.name` key matching
