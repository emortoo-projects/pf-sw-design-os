import { Hono } from 'hono'
import { z } from 'zod'
import { eq, and, isNull } from 'drizzle-orm'
import { db } from '../db'
import { users, refreshTokens } from '../db/schema'
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  getRefreshTokenExpiresAt,
} from '../lib/auth'

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  password: z.string().min(8).max(128),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})

const auth = new Hono()

// POST /api/auth/register
auth.post('/register', async (c) => {
  const body = registerSchema.parse(await c.req.json())

  const passwordHash = await hashPassword(body.password)

  const [user] = await db
    .insert(users)
    .values({
      email: body.email,
      name: body.name,
      passwordHash,
      preferences: {},
    })
    .onConflictDoNothing({ target: users.email })
    .returning()

  if (!user) {
    return c.json(
      { error: { code: 'CONFLICT', message: 'Email already registered' } },
      409,
    )
  }

  const accessToken = await signAccessToken({ sub: user.id, email: user.email })
  const rawRefreshToken = generateRefreshToken()

  await db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash: hashRefreshToken(rawRefreshToken),
    expiresAt: getRefreshTokenExpiresAt(),
  })

  return c.json({
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
  }, 201)
})

// POST /api/auth/login
auth.post('/login', async (c) => {
  const body = loginSchema.parse(await c.req.json())

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, body.email))
    .limit(1)

  if (!user || !user.passwordHash) {
    return c.json(
      { error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' } },
      401,
    )
  }

  const valid = await verifyPassword(body.password, user.passwordHash)
  if (!valid) {
    return c.json(
      { error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' } },
      401,
    )
  }

  const accessToken = await signAccessToken({ sub: user.id, email: user.email })
  const rawRefreshToken = generateRefreshToken()

  await db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash: hashRefreshToken(rawRefreshToken),
    expiresAt: getRefreshTokenExpiresAt(),
  })

  return c.json({
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
  })
})

// POST /api/auth/refresh
auth.post('/refresh', async (c) => {
  const body = refreshSchema.parse(await c.req.json())

  const tokenHash = hashRefreshToken(body.refreshToken)

  const [stored] = await db
    .select()
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.tokenHash, tokenHash),
        isNull(refreshTokens.revokedAt),
      ),
    )
    .limit(1)

  if (!stored || stored.expiresAt < new Date()) {
    return c.json(
      { error: { code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token' } },
      401,
    )
  }

  // Revoke the old token
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.id, stored.id))

  // Get the user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, stored.userId))
    .limit(1)

  if (!user) {
    return c.json(
      { error: { code: 'UNAUTHORIZED', message: 'User not found' } },
      401,
    )
  }

  // Issue new tokens
  const accessToken = await signAccessToken({ sub: user.id, email: user.email })
  const newRawRefreshToken = generateRefreshToken()

  await db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash: hashRefreshToken(newRawRefreshToken),
    expiresAt: getRefreshTokenExpiresAt(),
  })

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      preferences: user.preferences,
    },
    tokens: {
      accessToken,
      refreshToken: newRawRefreshToken,
    },
  })
})

// POST /api/auth/logout
auth.post('/logout', async (c) => {
  const body = refreshSchema.parse(await c.req.json())

  const tokenHash = hashRefreshToken(body.refreshToken)

  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.tokenHash, tokenHash))

  return c.json({ success: true })
})

export { auth }
