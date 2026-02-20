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
import { stageRoutes } from './routes/stages'
import { aiProviderRoutes } from './routes/ai-providers'
import { usageRoutes } from './routes/usage'
import { mcpTokenRoutes, mcpTokenUserRoutes } from './routes/mcp-tokens'
import { adminRoutes } from './routes/admin'
import { setupRoutes } from './routes/setup'
import { contractRoutes } from './routes/contracts'
import { automationRoutes } from './routes/automation'
import { startDailyCronJob } from './lib/backup-manager'
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
app.route('/api/projects/:projectId/stages', stageRoutes)
app.route('/api/ai-providers', aiProviderRoutes)
app.route('/api/usage', usageRoutes)
app.route('/api/projects/:projectId/mcp-tokens', mcpTokenRoutes)
app.route('/api/mcp-tokens', mcpTokenUserRoutes)
app.route('/api/admin', adminRoutes)
app.route('/api/setup', setupRoutes)
app.route('/api/projects/:projectId/contracts', contractRoutes)
app.route('/api/projects/:projectId/automation', automationRoutes)

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
// Disable the default Node.js request timeout so long-running AI generations aren't killed
;(server as import('node:http').Server).timeout = 0
;(server as import('node:http').Server).requestTimeout = 0

// Start daily backup cron job
startDailyCronJob()

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down...')
  server.close()
  await client.end()
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
