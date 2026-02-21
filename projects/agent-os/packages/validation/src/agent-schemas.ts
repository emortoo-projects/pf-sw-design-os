import { z } from "zod";

export const frameworkTypes = ["crewai", "langgraph", "n8n", "custom", "native"] as const;
export const agentStatuses = ["active", "paused", "archived"] as const;

export const createAgentSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  framework: z.enum(frameworkTypes),
  endpointUrl: z.string().url().optional(),
  capabilities: z.array(z.object({
    name: z.string(),
    description: z.string(),
    inputSchema: z.record(z.unknown()).optional(),
    outputSchema: z.record(z.unknown()).optional(),
  })).optional(),
  configuration: z.record(z.unknown()).optional(),
  workspaceId: z.string().uuid().optional(),
});

export const updateAgentSchema = createAgentSchema.partial();

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
