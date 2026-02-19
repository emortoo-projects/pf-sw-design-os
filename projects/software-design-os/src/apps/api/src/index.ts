import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { projects } from './routes/projects'

const app = new Hono()

app.use('*', cors({ origin: 'http://localhost:5173' }))

app.route('/api/projects', projects)

app.get('/api/health', (c) => c.json({ status: 'ok' }))

const port = 3001
console.log(`API server running on http://localhost:${port}`)

serve({ fetch: app.fetch, port })
