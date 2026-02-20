import { Hono } from 'hono'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '../db'
import { aiProviderConfigs as providersTable } from '../db/schema'
import { encrypt, decrypt } from '../lib/encryption'
import type { AppEnv } from '../types'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const TEST_TIMEOUT_MS = 15_000

// Simple per-user rate limiting for test endpoint
const testRateLimits = new Map<string, { count: number; resetAt: number }>()
const TEST_RATE_LIMIT = 5
const TEST_RATE_WINDOW_MS = 60_000

/** Validate that a baseUrl is safe (no SSRF to internal networks). */
function validateBaseUrl(url: string): void {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new Error('Invalid URL')
  }

  if (parsed.protocol !== 'https:') {
    throw new Error('Only HTTPS URLs are allowed for provider base URLs')
  }

  const hostname = parsed.hostname.toLowerCase()
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname === '0.0.0.0' ||
    hostname.startsWith('10.') ||
    hostname.startsWith('192.168.') ||
    hostname === '169.254.169.254' ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.local') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  ) {
    throw new Error('Internal/private URLs are not allowed')
  }
}

const baseUrlSchema = z.string().url().max(500).refine(
  (url) => {
    try { validateBaseUrl(url); return true } catch { return false }
  },
  { message: 'Only HTTPS URLs to public hosts are allowed' },
)

const PROVIDER_TYPES = ['anthropic', 'openai', 'openrouter', 'deepseek', 'kimi', 'custom'] as const

/** Default base URLs for providers with fixed endpoints. */
const PROVIDER_DEFAULT_BASE_URLS: Partial<Record<string, string>> = {
  openrouter: 'https://openrouter.ai/api/v1',
  deepseek: 'https://api.deepseek.com/v1',
  kimi: 'https://api.moonshot.cn/v1',
}

const createProviderSchema = z.object({
  provider: z.enum(PROVIDER_TYPES),
  label: z.string().min(1).max(255),
  apiKey: z.string().min(1).max(500),
  defaultModel: z.string().min(1).max(100),
  baseUrl: baseUrlSchema.optional(),
  isDefault: z.boolean().optional(),
})

const updateProviderSchema = z.object({
  label: z.string().min(1).max(255).optional(),
  apiKey: z.string().min(1).max(500).optional(),
  defaultModel: z.string().min(1).max(100).optional(),
  baseUrl: baseUrlSchema.nullable().optional(),
  isDefault: z.boolean().optional(),
})

const aiProviderRoutes = new Hono<AppEnv>()

/** Strip the encrypted key from a provider row, replacing with a boolean flag. */
function sanitizeProvider(row: typeof providersTable.$inferSelect) {
  const { apiKeyEncrypted, ...rest } = row
  return { ...rest, apiKeySet: !!apiKeyEncrypted }
}

/** Sanitize upstream error messages to prevent information leakage. */
function sanitizeTestError(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message
    if (msg.includes('401') || msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('invalid api key')) {
      return 'Authentication failed - check your API key'
    }
    if (msg.includes('404')) {
      return 'API endpoint not found - check your model and configuration'
    }
    if (msg.includes('429')) {
      return 'Rate limited by provider - try again later'
    }
    if (msg.includes('abort') || msg.includes('timeout')) {
      return 'Connection timed out'
    }
  }
  return 'Connection test failed'
}

// GET /api/ai-providers — list user's providers
aiProviderRoutes.get('/', async (c) => {
  const userId = c.get('userId')

  const providers = await db
    .select()
    .from(providersTable)
    .where(eq(providersTable.userId, userId))
    .orderBy(providersTable.createdAt)

  return c.json(providers.map(sanitizeProvider))
})

// POST /api/ai-providers — add new provider (encrypts API key)
aiProviderRoutes.post('/', async (c) => {
  const userId = c.get('userId')
  const body = createProviderSchema.parse(await c.req.json())

  const apiKeyEncrypted = encrypt(body.apiKey)

  // Wrap in transaction for atomic default toggling
  const provider = await db.transaction(async (tx) => {
    if (body.isDefault) {
      await tx
        .update(providersTable)
        .set({ isDefault: false })
        .where(and(eq(providersTable.userId, userId), eq(providersTable.isDefault, true)))
    }

    const [created] = await tx
      .insert(providersTable)
      .values({
        userId,
        provider: body.provider,
        label: body.label,
        apiKeyEncrypted,
        defaultModel: body.defaultModel,
        baseUrl: body.baseUrl,
        isDefault: body.isDefault ?? false,
      })
      .returning()

    return created
  })

  return c.json(sanitizeProvider(provider), 201)
})

// PUT /api/ai-providers/:id — update provider config
aiProviderRoutes.put('/:id', async (c) => {
  const userId = c.get('userId')
  const providerId = c.req.param('id')

  if (!UUID_REGEX.test(providerId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid provider ID' } }, 400)
  }

  const body = updateProviderSchema.parse(await c.req.json())

  const updateSet: Record<string, unknown> = {}
  if (body.label !== undefined) updateSet.label = body.label
  if (body.defaultModel !== undefined) updateSet.defaultModel = body.defaultModel
  if (body.baseUrl !== undefined) updateSet.baseUrl = body.baseUrl
  if (body.apiKey !== undefined) updateSet.apiKeyEncrypted = encrypt(body.apiKey)

  if (body.isDefault === true) {
    const updated = await db.transaction(async (tx) => {
      await tx
        .update(providersTable)
        .set({ isDefault: false })
        .where(and(eq(providersTable.userId, userId), eq(providersTable.isDefault, true)))

      updateSet.isDefault = true

      const [result] = await tx
        .update(providersTable)
        .set(updateSet)
        .where(and(eq(providersTable.id, providerId), eq(providersTable.userId, userId)))
        .returning()

      return result
    })

    if (!updated) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Provider not found' } }, 404)
    }

    return c.json(sanitizeProvider(updated))
  }

  if (body.isDefault === false) {
    updateSet.isDefault = false
  }

  if (Object.keys(updateSet).length === 0) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'No fields to update' } }, 400)
  }

  const [updated] = await db
    .update(providersTable)
    .set(updateSet)
    .where(and(eq(providersTable.id, providerId), eq(providersTable.userId, userId)))
    .returning()

  if (!updated) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Provider not found' } }, 404)
  }

  return c.json(sanitizeProvider(updated))
})

// DELETE /api/ai-providers/:id — delete provider
aiProviderRoutes.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const providerId = c.req.param('id')

  if (!UUID_REGEX.test(providerId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid provider ID' } }, 400)
  }

  const [deleted] = await db
    .delete(providersTable)
    .where(and(eq(providersTable.id, providerId), eq(providersTable.userId, userId)))
    .returning({ id: providersTable.id })

  if (!deleted) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Provider not found' } }, 404)
  }

  return c.json({ success: true })
})

// POST /api/ai-providers/:id/test — test connection
aiProviderRoutes.post('/:id/test', async (c) => {
  const userId = c.get('userId')
  const providerId = c.req.param('id')

  if (!UUID_REGEX.test(providerId)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid provider ID' } }, 400)
  }

  // Rate limiting
  const now = Date.now()
  const limit = testRateLimits.get(userId)
  if (limit && limit.resetAt > now && limit.count >= TEST_RATE_LIMIT) {
    return c.json({ error: { code: 'RATE_LIMITED', message: 'Too many test requests, try again later' } }, 429)
  }
  if (!limit || limit.resetAt <= now) {
    testRateLimits.set(userId, { count: 1, resetAt: now + TEST_RATE_WINDOW_MS })
  } else {
    limit.count++
  }

  const [provider] = await db
    .select()
    .from(providersTable)
    .where(and(eq(providersTable.id, providerId), eq(providersTable.userId, userId)))
    .limit(1)

  if (!provider) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Provider not found' } }, 404)
  }

  const apiKey = decrypt(provider.apiKeyEncrypted)
  const startTime = Date.now()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TEST_TIMEOUT_MS)

  try {
    if (provider.provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: provider.defaultModel,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as Record<string, any>)?.error?.message || `HTTP ${res.status}`)
      }
    } else {
      // OpenAI, OpenRouter, DeepSeek, Kimi, and custom (all OpenAI-compatible)
      const baseUrl = provider.baseUrl
        || PROVIDER_DEFAULT_BASE_URLS[provider.provider]
        || 'https://api.openai.com/v1'

      // Re-validate stored baseUrl at request time (defense-in-depth)
      if (provider.baseUrl) {
        validateBaseUrl(provider.baseUrl)
      }

      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: provider.defaultModel,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as Record<string, any>)?.error?.message || `HTTP ${res.status}`)
      }
    }

    const latencyMs = Date.now() - startTime
    return c.json({ success: true, model: provider.defaultModel, latencyMs })
  } catch (err) {
    const latencyMs = Date.now() - startTime
    return c.json({
      success: false,
      model: provider.defaultModel,
      latencyMs,
      error: sanitizeTestError(err),
    })
  } finally {
    clearTimeout(timeout)
  }
})

export { aiProviderRoutes }
