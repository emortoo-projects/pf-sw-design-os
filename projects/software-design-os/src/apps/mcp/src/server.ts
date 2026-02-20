import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { AuthContext } from './auth'

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
import { getContractsTool } from './tools/get-contracts'
import { getNextContractTool } from './tools/get-next-contract'
import { markContractDoneTool } from './tools/mark-contract-done'
import { startContractTool } from './tools/start-contract'
import { submitContractTool } from './tools/submit-contract'
import { getContractStatusTool } from './tools/get-contract-status'
import { startTaskTool } from './tools/start-task'
import { submitTaskTool } from './tools/submit-task'
import { getTaskStatusTool } from './tools/get-task-status'
import { runBatchTool } from './tools/run-batch'
import { getBatchStatusTool } from './tools/get-batch-status'
import { stopBatchTool } from './tools/stop-batch'

export function createMcpServer(): McpServer {
  return new McpServer({
    name: 'sdos-mcp',
    version: '0.1.0',
  })
}

/** Register all tools on a server with a fixed auth context. */
export function registerTools(server: McpServer, auth: AuthContext) {
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

  // Contract tools
  server.tool(
    getContractsTool.name,
    getContractsTool.description,
    { status: getContractsTool.schema.shape.status },
    async (args) => getContractsTool.handler(auth, args as { status?: string }),
  )

  server.tool(getNextContractTool.name, getNextContractTool.description, {}, async () => {
    return getNextContractTool.handler(auth)
  })

  server.tool(
    markContractDoneTool.name,
    markContractDoneTool.description,
    { contractId: markContractDoneTool.schema.shape.contractId },
    async (args) => markContractDoneTool.handler(auth, args as { contractId: string }),
  )

  server.tool(
    startContractTool.name,
    startContractTool.description,
    { contractId: startContractTool.schema.shape.contractId },
    async (args) => startContractTool.handler(auth, args as { contractId: string }),
  )

  server.tool(
    submitContractTool.name,
    submitContractTool.description,
    {
      contractId: submitContractTool.schema.shape.contractId,
      summary: submitContractTool.schema.shape.summary,
    },
    async (args) => submitContractTool.handler(auth, args as { contractId: string; summary: string }),
  )

  server.tool(
    getContractStatusTool.name,
    getContractStatusTool.description,
    { contractId: getContractStatusTool.schema.shape.contractId },
    async (args) => getContractStatusTool.handler(auth, args as { contractId: string }),
  )

  // Automation / batch tools
  server.tool(
    startTaskTool.name,
    startTaskTool.description,
    { contractId: startTaskTool.schema.shape.contractId },
    async (args) => startTaskTool.handler(auth, args as { contractId: string }),
  )

  server.tool(
    submitTaskTool.name,
    submitTaskTool.description,
    {
      contractId: submitTaskTool.schema.shape.contractId,
      summary: submitTaskTool.schema.shape.summary,
      filesChanged: submitTaskTool.schema.shape.filesChanged,
      checksOutput: submitTaskTool.schema.shape.checksOutput,
      failed: submitTaskTool.schema.shape.failed,
      error: submitTaskTool.schema.shape.error,
    },
    async (args) => submitTaskTool.handler(auth, args as {
      contractId: string
      summary: string
      filesChanged?: string[]
      checksOutput?: string
      failed?: boolean
      error?: string
    }),
  )

  server.tool(
    getTaskStatusTool.name,
    getTaskStatusTool.description,
    { contractId: getTaskStatusTool.schema.shape.contractId },
    async (args) => getTaskStatusTool.handler(auth, args as { contractId: string }),
  )

  server.tool(runBatchTool.name, runBatchTool.description, {}, async () => {
    return runBatchTool.handler(auth)
  })

  server.tool(
    getBatchStatusTool.name,
    getBatchStatusTool.description,
    { batchId: getBatchStatusTool.schema.shape.batchId },
    async (args) => getBatchStatusTool.handler(auth, args as { batchId?: string }),
  )

  server.tool(
    stopBatchTool.name,
    stopBatchTool.description,
    { batchId: stopBatchTool.schema.shape.batchId },
    async (args) => stopBatchTool.handler(auth, args as { batchId: string }),
  )
}
