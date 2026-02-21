import { Router, Request, Response } from "express";
import { z } from "zod";
import { routerRules } from "@agent-os/database";
import { eq, and, gt, asc } from "drizzle-orm";

const router = Router({ mergeParams: true });

const routerStrategyValues = ["cost_optimized", "quality_optimized", "fallback_chain", "load_balance", "ab_test"] as const;

const listSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().uuid().optional(),
});

const createRuleSchema = z.object({
  name: z.string().min(1).max(255),
  priority: z.number().int(),
  condition: z.record(z.unknown()),
  strategy: z.enum(routerStrategyValues),
  config: z.record(z.unknown()),
  enabled: z.boolean(),
});

const updateRuleSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  priority: z.number().int().optional(),
  condition: z.record(z.unknown()).optional(),
  config: z.record(z.unknown()).optional(),
  enabled: z.boolean().optional(),
});

// GET /workspaces/:workspaceId/router-rules
router.get("/", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const input = listSchema.parse(req.query);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const conditions = [eq(routerRules.workspaceId, workspaceId)];
    if (input.cursor) {
      conditions.push(gt(routerRules.id, input.cursor));
    }

    const data = await db
      .select()
      .from(routerRules)
      .where(and(...conditions))
      .orderBy(asc(routerRules.priority), asc(routerRules.id))
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
    res.status(500).json({ error: "Failed to list router rules" });
  }
});

// POST /workspaces/:workspaceId/router-rules
router.post("/", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const input = createRuleSchema.parse(req.body);
    const { db } = req.app.locals;
    const userId = (req as any).userId;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [rule] = await db
      .insert(routerRules)
      .values({
        workspaceId,
        name: input.name,
        priority: input.priority,
        condition: input.condition,
        strategy: input.strategy,
        config: input.config,
        enabled: input.enabled,
        createdBy: userId,
      })
      .returning({
        id: routerRules.id,
        name: routerRules.name,
        priority: routerRules.priority,
        strategy: routerRules.strategy,
        createdAt: routerRules.createdAt,
      });

    res.status(201).json(rule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to create router rule" });
  }
});

// GET /workspaces/:workspaceId/router-rules/:ruleId
router.get("/:ruleId", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const ruleId = z.string().uuid().parse(req.params.ruleId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [rule] = await db
      .select()
      .from(routerRules)
      .where(and(eq(routerRules.id, ruleId), eq(routerRules.workspaceId, workspaceId)))
      .limit(1);

    if (!rule) {
      res.status(404).json({ error: "Router rule not found" });
      return;
    }

    res.json(rule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to get router rule" });
  }
});

// PUT /workspaces/:workspaceId/router-rules/:ruleId
router.put("/:ruleId", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const ruleId = z.string().uuid().parse(req.params.ruleId);
    const input = updateRuleSchema.parse(req.body);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const updateValues: Record<string, unknown> = { updatedAt: new Date() };
    if (input.name !== undefined) updateValues.name = input.name;
    if (input.priority !== undefined) updateValues.priority = input.priority;
    if (input.condition !== undefined) updateValues.condition = input.condition;
    if (input.config !== undefined) updateValues.config = input.config;
    if (input.enabled !== undefined) updateValues.enabled = input.enabled;

    const [rule] = await db
      .update(routerRules)
      .set(updateValues)
      .where(and(eq(routerRules.id, ruleId), eq(routerRules.workspaceId, workspaceId)))
      .returning({
        id: routerRules.id,
        updatedAt: routerRules.updatedAt,
      });

    if (!rule) {
      res.status(404).json({ error: "Router rule not found" });
      return;
    }

    res.json(rule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to update router rule" });
  }
});

// DELETE /workspaces/:workspaceId/router-rules/:ruleId
router.delete("/:ruleId", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const ruleId = z.string().uuid().parse(req.params.ruleId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [deleted] = await db
      .delete(routerRules)
      .where(and(eq(routerRules.id, ruleId), eq(routerRules.workspaceId, workspaceId)))
      .returning({ id: routerRules.id });

    if (!deleted) {
      res.status(404).json({ error: "Router rule not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to delete router rule" });
  }
});

export default router;
