---
title: AI Provider Management API
status: complete
priority: medium
created: 2026-02-19
source: sdp-import
skills:
- backend-patterns
- postgres-patterns
- security-review
skill_paths: []
skills_assigned: '2026-02-19'
---

# AI Provider Management API

## Objective
CRUD for AI provider configurations. Test connection endpoint. Encrypted API key storage.

## Context
Depends on `setup-auth` (complete). Source: `context/sdp-source/sections/backend-goals.json` -> `build-ai-provider-crud`.

## Acceptance Criteria
- [x] GET /api/ai-providers -- list user's providers
- [x] POST /api/ai-providers -- add new provider (encrypts API key)
- [x] PUT /api/ai-providers/:id -- update provider config
- [x] DELETE /api/ai-providers/:id -- delete provider
- [x] POST /api/ai-providers/:id/test -- test connection (makes a tiny API call)
- [x] API keys encrypted with AES-256 using ENCRYPTION_KEY env var
- [x] Frontend Settings > AI Providers tab uses real API
- [x] Test Connection button shows success/failure in real time

## Implementation Summary

**Files created:**
- `apps/api/src/lib/encryption.ts` -- AES-256-GCM encryption with cached key derivation
- `apps/api/src/routes/ai-providers.ts` -- Full CRUD + test connection endpoints
- `apps/web/src/hooks/use-ai-providers.ts` -- React Query hooks for all provider operations

**Files modified:**
- `apps/api/src/index.ts` -- Wired ai-provider routes at `/api/ai-providers`
- `apps/api/.env.example` + `.env` -- Added ENCRYPTION_KEY
- `apps/web/src/lib/api-client.ts` -- Added AI provider methods to interface + both impls
- `apps/web/src/features/settings/ai-provider-manager.tsx` -- Rewritten to use real API hooks
- `apps/web/src/pages/settings-page.tsx` -- Removed mock provider state
- `apps/web/src/features/settings/index.ts` -- Updated barrel exports

**Security measures:**
- AES-256-GCM with 12-byte IV (NIST-recommended) and cached key derivation
- API keys never returned in responses (sanitized to boolean `apiKeySet` flag)
- SSRF prevention: baseUrl validated against private/internal IP ranges, HTTPS required
- Per-user rate limiting on test endpoint (5 req/min)
- AbortController timeout on outbound requests (15s)
- Sanitized error messages from upstream providers
- Atomic default-provider toggling via transactions
- UUID validation on all path params
- All routes scoped by userId (IDOR-safe)
