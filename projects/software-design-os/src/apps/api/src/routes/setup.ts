import { Hono } from 'hono'
import { z } from 'zod'
import { sql } from 'drizzle-orm'
import { db } from '../db'
import { users, aiProviderConfigs, refreshTokens } from '../db/schema'
import {
  hashPassword,
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  getRefreshTokenExpiresAt,
} from '../lib/auth'
import { encrypt } from '../lib/encryption'

const setupSchema = z.object({
  admin: z.object({
    email: z.string().email(),
    name: z.string().min(1).max(255),
    password: z.string().min(8).max(128),
  }),
  provider: z
    .object({
      provider: z.enum(['anthropic', 'openai', 'openrouter', 'deepseek', 'kimi', 'custom']),
      label: z.string().min(1).max(255),
      apiKey: z.string().min(1),
      defaultModel: z.string().min(1).max(100),
      baseUrl: z.string().url().optional(),
    })
    .optional(),
})

const setupRoutes = new Hono()

// GET /api/setup/status
setupRoutes.get('/status', async (c) => {
  const [result] = await db.execute(sql`SELECT COUNT(*) AS count FROM users`)
  const count = Number(result.count)
  return c.json({ needsSetup: count === 0 })
})

// POST /api/setup
setupRoutes.post('/', async (c) => {
  // Early check BEFORE parsing body / hashing password to avoid bcrypt DoS
  const [preCheck] = await db.execute(sql`SELECT COUNT(*) AS count FROM users`)
  if (Number(preCheck.count) !== 0) {
    return c.json(
      { error: { code: 'FORBIDDEN', message: 'Setup already completed. Users already exist.' } },
      403,
    )
  }

  const body = setupSchema.parse(await c.req.json())

  const result = await db.transaction(async (tx) => {
    // TOCTOU guard: re-check inside transaction
    const [check] = await tx.execute(sql`SELECT COUNT(*) AS count FROM users`)
    if (Number(check.count) !== 0) {
      return null // Users already exist (race condition guard)
    }

    // Create admin user
    const passwordHash = await hashPassword(body.admin.password)
    const [user] = await tx
      .insert(users)
      .values({
        email: body.admin.email,
        name: body.admin.name,
        passwordHash,
        preferences: {},
      })
      .returning()

    // Optionally create AI provider
    if (body.provider) {
      await tx.insert(aiProviderConfigs).values({
        userId: user.id,
        provider: body.provider.provider,
        label: body.provider.label,
        apiKeyEncrypted: encrypt(body.provider.apiKey),
        defaultModel: body.provider.defaultModel,
        baseUrl: body.provider.baseUrl ?? null,
        isDefault: true,
      })
    }

    // Issue tokens
    const accessToken = await signAccessToken({ sub: user.id, email: user.email })
    const rawRefreshToken = generateRefreshToken()

    await tx.insert(refreshTokens).values({
      userId: user.id,
      tokenHash: hashRefreshToken(rawRefreshToken),
      expiresAt: getRefreshTokenExpiresAt(),
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        preferences: user.preferences,
      },
      tokens: {
        accessToken,
        refreshToken: rawRefreshToken,
      },
    }
  })

  if (!result) {
    return c.json(
      { error: { code: 'FORBIDDEN', message: 'Setup already completed. Users already exist.' } },
      403,
    )
  }

  return c.json(result, 201)
})

export { setupRoutes }
