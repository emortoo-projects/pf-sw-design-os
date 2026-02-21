import { Router, Request, Response } from "express";
import { z } from "zod";
import { guardrails, guardrailEvents } from "@agent-os/database";
import { eq, and, gt, asc, desc } from "drizzle-orm";

const router = Router({ mergeParams: true });

const guardrailTypeValues = ["cost_cap", "token_limit", "rate_limit", "approval_required", "timeout"] as const;
const guardrailScopeValues = ["workspace", "workflow", "agent"] as const;
const guardrailActionValues = ["block", "warn", "notify", "kill"] as const;

const listSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().uuid().optional(),
});

const createGuardrailSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(guardrailTypeValues),
  scope: z.enum(guardrailScopeValues),
  targetId: z.string().uuid().optional(),
  config: z.record(z.unknown()),
  enabled: z.boolean(),
  action: z.enum(guardrailActionValues),
});

const updateGuardrailSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  config: z.record(z.unknown()).optional(),
  enabled: z.boolean().optional(),
  action: z.enum(guardrailActionValues).optional(),
});

// GET /workspaces/:workspaceId/guardrails
router.get("/", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const input = listSchema.parse(req.query);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const conditions = [eq(guardrails.workspaceId, workspaceId)];
    if (input.cursor) {
      conditions.push(gt(guardrails.id, input.cursor));
    }

    const data = await db
      .select()
      .from(guardrails)
      .where(and(...conditions))
      .orderBy(asc(guardrails.id))
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
    res.status(500).json({ error: "Failed to list guardrails" });
  }
});

// POST /workspaces/:workspaceId/guardrails
router.post("/", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const input = createGuardrailSchema.parse(req.body);
    const { db } = req.app.locals;
    const userId = (req as any).userId;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [guardrail] = await db
      .insert(guardrails)
      .values({
        workspaceId,
        name: input.name,
        type: input.type,
        scope: input.scope,
        targetId: input.targetId,
        config: input.config,
        enabled: input.enabled,
        action: input.action,
        createdBy: userId,
      })
      .returning({
        id: guardrails.id,
        name: guardrails.name,
        type: guardrails.type,
        scope: guardrails.scope,
        enabled: guardrails.enabled,
        createdAt: guardrails.createdAt,
      });

    res.status(201).json(guardrail);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to create guardrail" });
  }
});

// GET /workspaces/:workspaceId/guardrails/:guardrailId
router.get("/:guardrailId", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const guardrailId = z.string().uuid().parse(req.params.guardrailId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [guardrail] = await db
      .select()
      .from(guardrails)
      .where(and(eq(guardrails.id, guardrailId), eq(guardrails.workspaceId, workspaceId)))
      .limit(1);

    if (!guardrail) {
      res.status(404).json({ error: "Guardrail not found" });
      return;
    }

    res.json(guardrail);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to get guardrail" });
  }
});

// PUT /workspaces/:workspaceId/guardrails/:guardrailId
router.put("/:guardrailId", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const guardrailId = z.string().uuid().parse(req.params.guardrailId);
    const input = updateGuardrailSchema.parse(req.body);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const updateValues: Record<string, unknown> = { updatedAt: new Date() };
    if (input.name !== undefined) updateValues.name = input.name;
    if (input.config !== undefined) updateValues.config = input.config;
    if (input.enabled !== undefined) updateValues.enabled = input.enabled;
    if (input.action !== undefined) updateValues.action = input.action;

    const [guardrail] = await db
      .update(guardrails)
      .set(updateValues)
      .where(and(eq(guardrails.id, guardrailId), eq(guardrails.workspaceId, workspaceId)))
      .returning({
        id: guardrails.id,
        updatedAt: guardrails.updatedAt,
      });

    if (!guardrail) {
      res.status(404).json({ error: "Guardrail not found" });
      return;
    }

    res.json(guardrail);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to update guardrail" });
  }
});

// DELETE /workspaces/:workspaceId/guardrails/:guardrailId
router.delete("/:guardrailId", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const guardrailId = z.string().uuid().parse(req.params.guardrailId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [deleted] = await db
      .delete(guardrails)
      .where(and(eq(guardrails.id, guardrailId), eq(guardrails.workspaceId, workspaceId)))
      .returning({ id: guardrails.id });

    if (!deleted) {
      res.status(404).json({ error: "Guardrail not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to delete guardrail" });
  }
});

// GET /workspaces/:workspaceId/guardrails/:guardrailId/events
router.get("/:guardrailId/events", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const guardrailId = z.string().uuid().parse(req.params.guardrailId);
    const input = listSchema.parse(req.query);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    // Verify guardrail belongs to workspace
    const [guardrail] = await db
      .select({ id: guardrails.id })
      .from(guardrails)
      .where(and(eq(guardrails.id, guardrailId), eq(guardrails.workspaceId, workspaceId)))
      .limit(1);

    if (!guardrail) {
      res.status(404).json({ error: "Guardrail not found" });
      return;
    }

    const conditions = [eq(guardrailEvents.guardrailId, guardrailId)];
    if (input.cursor) {
      conditions.push(gt(guardrailEvents.id, input.cursor));
    }

    const data = await db
      .select()
      .from(guardrailEvents)
      .where(and(...conditions))
      .orderBy(desc(guardrailEvents.createdAt))
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
    res.status(500).json({ error: "Failed to list guardrail events" });
  }
});

export default router;
