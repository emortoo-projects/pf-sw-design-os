import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { requestLogger, errorHandler, authGuard } from './middleware'
import { db, client } from './db'
import { sql } from 'drizzle-orm'
import { auth } from './routes/auth'
import { userRoutes } from './routes/users'
import { projects } from './routes/projects'
import { templateRoutes } from './routes/templates'
import type { AppEnv } from './types'

const app = new Hono<AppEnv>()

// Middleware stack — error handler outermost so it catches errors from all layers
app.use('*', errorHandler)
app.use('*', requestLogger)
app.use('*', cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }))

// Auth middleware — protects all /api/* routes except /api/auth/* and /api/health
app.use('/api/*', authGuard)

// Routes
app.route('/api/auth', auth)
app.route('/api/users', userRoutes)
app.route('/api/projects', projects)
app.route('/api/templates', templateRoutes)

// Health check with DB ping
app.get('/api/health', async (c) => {
  let dbStatus = 'connected'
  try {
    await db.execute(sql`SELECT 1`)
  } catch {
    dbStatus = 'error'
  }
  return c.json({ status: 'ok', db: dbStatus })
})

const port = parseInt(process.env.PORT ?? '3001', 10)
console.log(`API server running on http://localhost:${port}`)

const server = serve({ fetch: app.fetch, port })

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down...')
  server.close()
  await client.end()
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
