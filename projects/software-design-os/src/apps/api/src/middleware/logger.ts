import type { MiddlewareHandler } from 'hono'

export const requestLogger: MiddlewareHandler = async (c, next) => {
  const start = Date.now()
  const method = c.req.method
  const path = c.req.path

  console.log(`${new Date().toISOString()} → ${method} ${path}`)

  await next()

  const duration = Date.now() - start
  const status = c.res.status

  console.log(`${new Date().toISOString()} ← ${status} ${method} ${path} (${duration}ms)`)
}
