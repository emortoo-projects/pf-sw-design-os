import 'dotenv/config'
import { createServer as createHttpServer } from 'node:http'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { validateToken } from './auth'
import { client } from './db'
import { createMcpServer, registerTools } from './server'

// ── HTTP mode ───────────────────────────────────────────────────────────────

async function startHttp() {
  const port = parseInt(process.env.MCP_PORT ?? '3100', 10)

  const httpServer = createHttpServer(async (req, res) => {
    // Health check
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ status: 'ok' }))
      return
    }

    // Only handle POST for MCP
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Method not allowed' }))
      return
    }

    // Extract Bearer token
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      res.writeHead(401, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Missing or invalid Authorization header' }))
      return
    }

    const plaintext = authHeader.slice(7)
    const auth = await validateToken(plaintext)
    if (!auth) {
      res.writeHead(401, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Invalid or expired token' }))
      return
    }

    // Create per-request MCP server (stateless — no session tracking)
    const server = createMcpServer()
    registerTools(server, auth)

    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
    try {
      await server.connect(transport)
      await transport.handleRequest(req, res)
    } finally {
      await transport.close()
      await server.close()
    }
  })

  httpServer.listen(port, () => {
    console.log(`MCP HTTP server running on http://localhost:${port}`)
  })

  // Graceful shutdown
  const shutdown = async () => {
    console.log('Shutting down MCP server...')
    httpServer.close()
    await client.end()
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

// ── Entry point ─────────────────────────────────────────────────────────────

startHttp().catch((err) => {
  console.error('Failed to start HTTP server:', err)
  process.exit(1)
})
