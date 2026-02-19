import type { MiddlewareHandler } from 'hono'
import { verifyAccessToken } from '../lib/auth'

const PUBLIC_PATHS = new Set([
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/logout',
  '/api/health',
])

function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.has(path)
}

export const authGuard: MiddlewareHandler = async (c, next) => {
  if (isPublicPath(c.req.path)) {
    return next()
  }

  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Missing or invalid token' } }, 401)
  }

  const token = authHeader.slice(7)
  try {
    const payload = await verifyAccessToken(token)
    c.set('userId', payload.sub)
    c.set('userEmail', payload.email)
  } catch {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } }, 401)
  }

  return next()
}
