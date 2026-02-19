import 'dotenv/config'
import { createServer as createHttpServer } from 'node:http'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { validateToken, type AuthContext } from './auth'
import { client } from './db'

// Import tools
import { getOverviewTool } from './tools/get-overview'
import { getDataModelTool } from './tools/get-data-model'
import { getDatabaseSchemaTool } from './tools/get-database-schema'
import { getApiSpecTool } from './tools/get-api-spec'
import { getStackTool } from './tools/get-stack'
import { getDesignTokensTool } from './tools/get-design-tokens'
import { getSectionTool } from './tools/get-section'
import { getInfrastructureTool } from './tools/get-infrastructure'
import { validateTool } from './tools/validate'

function createMcpServer(): McpServer {
  return new McpServer({
    name: 'sdos-mcp',
    version: '0.1.0',
  })
}

/** Register all tools on a server with a fixed auth context. */
function registerTools(server: McpServer, auth: AuthContext) {
  // Simple stage tools (no args)
  const simpleTools = [
    getOverviewTool,
    getDataModelTool,
    getDatabaseSchemaTool,
    getApiSpecTool,
    getStackTool,
    getDesignTokensTool,
    getInfrastructureTool,
  ]

  for (const tool of simpleTools) {
    server.tool(tool.name, tool.description, {}, async () => {
      return tool.handler(auth)
    })
  }

  // Section tool (has optional sectionName arg)
  server.tool(
    getSectionTool.name,
    getSectionTool.description,
    { sectionName: getSectionTool.schema.shape.sectionName },
    async (args) => getSectionTool.handler(auth, args as { sectionName?: string }),
  )

  // Validate tool (no args, different logic)
  server.tool(validateTool.name, validateTool.description, {}, async () => {
    return validateTool.handler(auth)
  })
}

// ── Stdio mode ──────────────────────────────────────────────────────────────

async function startStdio() {
  const token = process.env.MCP_TOKEN
  if (!token) {
    console.error('MCP_TOKEN environment variable is required for stdio mode')
    process.exit(1)
  }

  const auth = await validateToken(token)
  if (!auth) {
    console.error('Invalid or expired MCP_TOKEN')
    process.exit(1)
  }

  console.error(`Authenticated: project=${auth.projectId}`)

  const server = createMcpServer()
  registerTools(server, auth)

  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('MCP server running on stdio')
}

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

const isStdio = process.argv.includes('--stdio')

if (isStdio) {
  startStdio().catch((err) => {
    console.error('Failed to start stdio server:', err)
    process.exit(1)
  })
} else {
  startHttp().catch((err) => {
    console.error('Failed to start HTTP server:', err)
    process.exit(1)
  })
}
