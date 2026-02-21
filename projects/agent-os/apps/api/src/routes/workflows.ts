import { Router, Request, Response } from "express";
import { z } from "zod";
import { workflows } from "@agent-os/database";
import { eq, and, gt, asc, sql } from "drizzle-orm";

const router = Router({ mergeParams: true });

const statusValues = ["draft", "active", "paused", "archived"] as const;

const listSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().uuid().optional(),
});

const createWorkflowSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  canvas: z.record(z.unknown()),
  tags: z.array(z.string()).optional(),
});

const updateWorkflowSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  canvas: z.record(z.unknown()).optional(),
  status: z.enum(statusValues).optional(),
  tags: z.array(z.string()).optional(),
});

// GET /workspaces/:workspaceId/workflows
router.get("/", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const input = listSchema.parse(req.query);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const conditions = [eq(workflows.workspaceId, workspaceId)];
    if (input.cursor) {
      conditions.push(gt(workflows.id, input.cursor));
    }

    const data = await db
      .select()
      .from(workflows)
      .where(and(...conditions))
      .orderBy(asc(workflows.id))
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
    res.status(500).json({ error: "Failed to list workflows" });
  }
});

// POST /workspaces/:workspaceId/workflows
router.post("/", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const input = createWorkflowSchema.parse(req.body);
    const { db } = req.app.locals;
    const userId = (req as any).userId;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [workflow] = await db
      .insert(workflows)
      .values({
        workspaceId,
        name: input.name,
        slug: input.slug,
        description: input.description,
        canvas: input.canvas,
        tags: input.tags || [],
        createdBy: userId,
      })
      .returning({
        id: workflows.id,
        name: workflows.name,
        slug: workflows.slug,
        status: workflows.status,
        version: workflows.version,
        createdAt: workflows.createdAt,
      });

    res.status(201).json(workflow);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to create workflow" });
  }
});

// GET /workspaces/:workspaceId/workflows/:workflowId
router.get("/:workflowId", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const workflowId = z.string().uuid().parse(req.params.workflowId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [workflow] = await db
      .select()
      .from(workflows)
      .where(and(eq(workflows.id, workflowId), eq(workflows.workspaceId, workspaceId)))
      .limit(1);

    if (!workflow) {
      res.status(404).json({ error: "Workflow not found" });
      return;
    }

    res.json(workflow);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to get workflow" });
  }
});

// PUT /workspaces/:workspaceId/workflows/:workflowId
router.put("/:workflowId", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const workflowId = z.string().uuid().parse(req.params.workflowId);
    const input = updateWorkflowSchema.parse(req.body);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const updateValues: Record<string, unknown> = {
      updatedAt: new Date(),
      version: sql`${workflows.version} + 1`,
    };
    if (input.name !== undefined) updateValues.name = input.name;
    if (input.description !== undefined) updateValues.description = input.description;
    if (input.canvas !== undefined) updateValues.canvas = input.canvas;
    if (input.status !== undefined) updateValues.status = input.status;
    if (input.tags !== undefined) updateValues.tags = input.tags;

    const [workflow] = await db
      .update(workflows)
      .set(updateValues)
      .where(and(eq(workflows.id, workflowId), eq(workflows.workspaceId, workspaceId)))
      .returning({
        id: workflows.id,
        version: workflows.version,
        updatedAt: workflows.updatedAt,
      });

    if (!workflow) {
      res.status(404).json({ error: "Workflow not found" });
      return;
    }

    res.json(workflow);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to update workflow" });
  }
});

// DELETE /workspaces/:workspaceId/workflows/:workflowId
router.delete("/:workflowId", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const workflowId = z.string().uuid().parse(req.params.workflowId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [deleted] = await db
      .delete(workflows)
      .where(and(eq(workflows.id, workflowId), eq(workflows.workspaceId, workspaceId)))
      .returning({ id: workflows.id });

    if (!deleted) {
      res.status(404).json({ error: "Workflow not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to delete workflow" });
  }
});

export default router;
