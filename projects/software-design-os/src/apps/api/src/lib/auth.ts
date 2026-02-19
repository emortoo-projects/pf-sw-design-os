import bcryptjs from 'bcryptjs'
import { sign, verify } from 'hono/jwt'
import { createHash, randomBytes } from 'node:crypto'

const BCRYPT_ROUNDS = 12

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters for HS256 security')
  }
  return secret
}

function parseExpiry(envVar: string, defaultValue: string): number {
  const raw = process.env[envVar] ?? defaultValue
  const match = raw.match(/^(\d+)([dhms])$/)
  if (!match) throw new Error(`Invalid expiry format: ${raw}`)
  const value = parseInt(match[1], 10)
  const unit = match[2]
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 }
  return value * multipliers[unit]
}

export async function hashPassword(plain: string): Promise<string> {
  return bcryptjs.hash(plain, BCRYPT_ROUNDS)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(plain, hash)
}

export async function signAccessToken(payload: { sub: string; email: string }): Promise<string> {
  const expirySeconds = parseExpiry('JWT_EXPIRES_IN', '7d')
  const now = Math.floor(Date.now() / 1000)
  return sign(
    {
      sub: payload.sub,
      email: payload.email,
      iat: now,
      exp: now + expirySeconds,
    },
    getJwtSecret(),
  )
}

export async function verifyAccessToken(token: string): Promise<{ sub: string; email: string }> {
  const decoded = await verify(token, getJwtSecret(), 'HS256')
  return { sub: decoded.sub as string, email: decoded.email as string }
}

export function generateRefreshToken(): string {
  return randomBytes(32).toString('hex')
}

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function getRefreshTokenExpiresAt(): Date {
  const expirySeconds = parseExpiry('REFRESH_TOKEN_EXPIRES_IN', '30d')
  return new Date(Date.now() + expirySeconds * 1000)
}
