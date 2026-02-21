import { z } from "zod";

export const workflowNodeSchema = z.object({
  id: z.string(),
  type: z.enum(["agent", "condition", "parallel", "merge", "input", "output"]),
  agentId: z.string().uuid().optional(),
  config: z.record(z.unknown()).optional(),
  position: z.object({ x: z.number(), y: z.number() }),
});

export const workflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  condition: z.string().optional(),
});

export const createWorkflowSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  definition: z.object({
    nodes: z.array(workflowNodeSchema),
    edges: z.array(workflowEdgeSchema),
  }).optional(),
  cronExpression: z.string().optional(),
  workspaceId: z.string().uuid().optional(),
});

export const updateWorkflowSchema = createWorkflowSchema.partial();

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>;
