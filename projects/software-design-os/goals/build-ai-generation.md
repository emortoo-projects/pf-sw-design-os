# Goal: AI Generation Service (build-ai-generation)

## Status: COMPLETE

## Summary

Added the core AI generation service that powers the SDOS pipeline's "Generate" button. When a user clicks Generate on any stage (1–8), the backend now:

1. Atomically claims the stage (active/review → generating) to prevent concurrent generations
2. Resolves the AI provider (project-level or user's default)
3. Gathers context from completed dependency stages
4. Builds a stage-specific prompt with JSON output schema
5. Calls the AI provider (Anthropic or OpenAI-compatible)
6. Parses the response, calculates cost, and saves generation + output records
7. Sets the stage to `review` with the generated data

## Files Created

| File | Purpose |
|------|---------|
| `apps/api/src/lib/ai-provider.ts` | Unified AI provider factory (Anthropic + OpenAI/custom) |
| `apps/api/src/lib/cost-calculator.ts` | Model pricing table and cost estimation |
| `apps/api/src/lib/prompts/index.ts` | Prompt registry mapping stage names to builders |
| `apps/api/src/lib/prompts/templates.ts` | 8 stage-specific prompt templates |
| `apps/api/src/lib/generation-service.ts` | Orchestration service with full generation flow |

## Files Modified

| File | Change |
|------|--------|
| `apps/api/package.json` | Added `@anthropic-ai/sdk` and `openai` dependencies |
| `apps/api/src/routes/stages.ts` | Added `POST /:num/generate` endpoint |
| `apps/api/src/lib/encryption.ts` | Fixed `decrypt()` Buffer concatenation safety |

## Dependencies

- setup-backend-foundation ✅
- setup-auth ✅
- build-project-crud ✅
- build-stage-api ✅
- build-ai-provider-crud ✅

## Verification

- [x] `pnpm --filter @sdos/api build` — compiles clean
- [x] `pnpm --filter @sdos/web build` — compiles clean (no frontend changes)
- [x] Code review: CRITICAL issues fixed (race condition, error recovery, decrypt safety)
