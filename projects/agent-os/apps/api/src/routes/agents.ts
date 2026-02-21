import { Router, Request, Response } from "express";
import { z } from "zod";
import { agents } from "@agent-os/database";
import { eq, and, gt, asc } from "drizzle-orm";

const router = Router({ mergeParams: true });

const frameworkValues = ["crewai", "langgraph", "n8n", "custom", "native"] as const;
const statusValues = ["active", "inactive", "error", "archived"] as const;

const listSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().uuid().optional(),
});

const createAgentSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  framework: z.enum(frameworkValues),
  connectorId: z.string().uuid().optional(),
  mcpTools: z.unknown(),
  metadata: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
});

const updateAgentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(statusValues).optional(),
  mcpTools: z.unknown().optional(),
  metadata: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
});

// GET /workspaces/:workspaceId/agents
router.get("/", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const input = listSchema.parse(req.query);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const conditions = [eq(agents.workspaceId, workspaceId)];
    if (input.cursor) {
      conditions.push(gt(agents.id, input.cursor));
    }

    const data = await db
      .select()
      .from(agents)
      .where(and(...conditions))
      .orderBy(asc(agents.id))
      .limit(input.limit + 1);

    const hasMore = data.length > input.limit;
    const results = hasMore ? data.slice(0, input.limit) : data;
    const nextCursor = hasMore ? results[results.length - 1].id : undefined;

    res.json({ data: results, nextCursor, hasMore });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to list agents" });
  }
});

// POST /workspaces/:workspaceId/agents
router.post("/", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const input = createAgentSchema.parse(req.body);
    const { db } = req.app.locals;
    const userId = (req as any).userId;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [agent] = await db
      .insert(agents)
      .values({
        workspaceId,
        name: input.name,
        slug: input.slug,
        description: input.description,
        framework: input.framework,
        connectorId: input.connectorId,
        mcpTools: input.mcpTools,
        metadata: input.metadata || {},
        tags: input.tags || [],
        createdBy: userId,
      })
      .returning({
        id: agents.id,
        name: agents.name,
        framework: agents.framework,
        status: agents.status,
        createdAt: agents.createdAt,
      });

    res.status(201).json(agent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to create agent" });
  }
});

// GET /workspaces/:workspaceId/agents/:agentId
router.get("/:agentId", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const agentId = z.string().uuid().parse(req.params.agentId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [agent] = await db
      .select()
      .from(agents)
      .where(and(eq(agents.id, agentId), eq(agents.workspaceId, workspaceId)))
      .limit(1);

    if (!agent) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }

    res.json(agent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to get agent" });
  }
});

// PUT /workspaces/:workspaceId/agents/:agentId
router.put("/:agentId", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const agentId = z.string().uuid().parse(req.params.agentId);
    const input = updateAgentSchema.parse(req.body);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const updateValues: Record<string, unknown> = { updatedAt: new Date() };
    if (input.name !== undefined) updateValues.name = input.name;
    if (input.description !== undefined) updateValues.description = input.description;
    if (input.status !== undefined) updateValues.status = input.status;
    if (input.mcpTools !== undefined) updateValues.mcpTools = input.mcpTools;
    if (input.metadata !== undefined) updateValues.metadata = input.metadata;
    if (input.tags !== undefined) updateValues.tags = input.tags;

    const [agent] = await db
      .update(agents)
      .set(updateValues)
      .where(and(eq(agents.id, agentId), eq(agents.workspaceId, workspaceId)))
      .returning({
        id: agents.id,
        name: agents.name,
        updatedAt: agents.updatedAt,
      });

    if (!agent) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }

    res.json(agent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to update agent" });
  }
});

// DELETE /workspaces/:workspaceId/agents/:agentId
router.delete("/:agentId", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const agentId = z.string().uuid().parse(req.params.agentId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [deleted] = await db
      .delete(agents)
      .where(and(eq(agents.id, agentId), eq(agents.workspaceId, workspaceId)))
      .returning({ id: agents.id });

    if (!deleted) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to delete agent" });
  }
});

export default router;
