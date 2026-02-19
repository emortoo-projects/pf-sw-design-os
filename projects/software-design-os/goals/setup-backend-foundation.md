---
title: Setup Backend Foundation
status: complete
priority: high
created: 2026-02-19
source: sdp-import
skills:
- backend-patterns
- database
- postgres-patterns
- security-review
skill_paths: []
skills_assigned: '2026-02-19'
---

# Setup Backend Foundation

## Objective
Lay the database and middleware foundation that all subsequent backend goals depend on.

## Context
The SDOS API app (`apps/api/`) needs PostgreSQL via Docker, Drizzle ORM schema for all 9 tables, migrations, a seed script, and a production-grade middleware stack. Source: `context/sdp-source/sections/backend-goals.json` → `setup-backend-foundation`.

## Acceptance Criteria
- [x] `apps/api/src/index.ts` serves Hono on configurable port (default 3001)
- [x] Drizzle config connects to PostgreSQL via `DATABASE_URL`
- [x] `db/schema.ts` defines all 9 tables from the SDP database schema
- [x] Drizzle migrations generated and runnable
- [x] Seed script creates demo user and built-in templates
- [x] Middleware: CORS, error handler, request logger
- [x] Health check endpoint at `GET /api/health` with DB ping
- [x] Docker Compose with postgres service

## Implementation Summary

**Files created:**
- `docker-compose.yml` — PostgreSQL 16-alpine with volume persistence
- `.env.example` / `.env` — Environment configuration
- `drizzle.config.ts` — Drizzle Kit configuration
- `src/db/schema.ts` — All 9 tables, 9 enums, relations
- `src/db/index.ts` — DB connection with exported client for graceful shutdown
- `src/db/migrate.ts` — Programmatic migration runner
- `src/db/seed.ts` — Demo user + 6 built-in templates (idempotent)
- `src/middleware/error-handler.ts` — Zod validation + generic error handling
- `src/middleware/logger.ts` — Request/response logger with timing
- `src/middleware/index.ts` — Barrel export

**Files modified:**
- `package.json` — Added drizzle-orm, postgres, dotenv deps + db scripts
- `src/index.ts` — dotenv, middleware stack, health check with DB ping, graceful shutdown
