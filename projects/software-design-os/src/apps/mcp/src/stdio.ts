import 'dotenv/config'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { validateToken } from './auth'
import { client } from './db'
import { createMcpServer, registerTools } from './server'

async function main() {
  const token = process.env.SDP_TOKEN
  if (!token) {
    console.error('SDP_TOKEN environment variable is required for stdio mode')
    process.exit(1)
  }

  const auth = await validateToken(token)
  if (!auth) {
    console.error('Invalid or expired SDP_TOKEN')
    process.exit(1)
  }

  console.error(`Authenticated: project=${auth.projectId}`)

  const server = createMcpServer()
  registerTools(server, auth)

  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('MCP server running on stdio')

  const shutdown = async () => {
    await server.close()
    await client.end()
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((err) => {
  console.error('Failed to start stdio server:', err)
  process.exit(1)
})
