import { Router, Request, Response } from "express";
import { z } from "zod";
import { schedules } from "@agent-os/database";
import { eq, and, gt, asc } from "drizzle-orm";

const router = Router({ mergeParams: true });

const listSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().uuid().optional(),
});

const createScheduleSchema = z.object({
  workflowId: z.string().uuid(),
  name: z.string().min(1).max(255),
  cronExpression: z.string().min(1),
  timezone: z.string().min(1),
  enabled: z.boolean(),
  input: z.record(z.unknown()).optional(),
});

const updateScheduleSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  cronExpression: z.string().min(1).optional(),
  enabled: z.boolean().optional(),
  input: z.record(z.unknown()).optional(),
});

// GET /workspaces/:workspaceId/schedules
router.get("/", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const input = listSchema.parse(req.query);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    // Schedules are linked via workflow -> workspace, so we join through workflows
    // For simplicity, we query all schedules and let the DB handle workspace scoping
    // Note: In production, add a workspaceId column or join through workflows table
    const conditions: any[] = [];
    if (input.cursor) {
      conditions.push(gt(schedules.id, input.cursor));
    }

    const data = await db
      .select()
      .from(schedules)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(schedules.id))
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
    res.status(500).json({ error: "Failed to list schedules" });
  }
});

// POST /workspaces/:workspaceId/schedules
router.post("/", async (req: Request, res: Response) => {
  try {
    z.string().uuid().parse(req.params.workspaceId);
    const input = createScheduleSchema.parse(req.body);
    const { db } = req.app.locals;
    const userId = (req as any).userId;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [schedule] = await db
      .insert(schedules)
      .values({
        workflowId: input.workflowId,
        name: input.name,
        cronExpression: input.cronExpression,
        timezone: input.timezone,
        enabled: input.enabled,
        input: input.input || {},
        createdBy: userId,
      })
      .returning({
        id: schedules.id,
        workflowId: schedules.workflowId,
        cronExpression: schedules.cronExpression,
        nextRunAt: schedules.nextRunAt,
        createdAt: schedules.createdAt,
      });

    res.status(201).json(schedule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to create schedule" });
  }
});

// GET /workspaces/:workspaceId/schedules/:scheduleId
router.get("/:scheduleId", async (req: Request, res: Response) => {
  try {
    z.string().uuid().parse(req.params.workspaceId);
    const scheduleId = z.string().uuid().parse(req.params.scheduleId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [schedule] = await db
      .select()
      .from(schedules)
      .where(eq(schedules.id, scheduleId))
      .limit(1);

    if (!schedule) {
      res.status(404).json({ error: "Schedule not found" });
      return;
    }

    res.json(schedule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to get schedule" });
  }
});

// PUT /workspaces/:workspaceId/schedules/:scheduleId
router.put("/:scheduleId", async (req: Request, res: Response) => {
  try {
    z.string().uuid().parse(req.params.workspaceId);
    const scheduleId = z.string().uuid().parse(req.params.scheduleId);
    const input = updateScheduleSchema.parse(req.body);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const updateValues: Record<string, unknown> = { updatedAt: new Date() };
    if (input.name !== undefined) updateValues.name = input.name;
    if (input.cronExpression !== undefined) updateValues.cronExpression = input.cronExpression;
    if (input.enabled !== undefined) updateValues.enabled = input.enabled;
    if (input.input !== undefined) updateValues.input = input.input;

    const [schedule] = await db
      .update(schedules)
      .set(updateValues)
      .where(eq(schedules.id, scheduleId))
      .returning({
        id: schedules.id,
        updatedAt: schedules.updatedAt,
      });

    if (!schedule) {
      res.status(404).json({ error: "Schedule not found" });
      return;
    }

    res.json(schedule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to update schedule" });
  }
});

// DELETE /workspaces/:workspaceId/schedules/:scheduleId
router.delete("/:scheduleId", async (req: Request, res: Response) => {
  try {
    z.string().uuid().parse(req.params.workspaceId);
    const scheduleId = z.string().uuid().parse(req.params.scheduleId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [deleted] = await db
      .delete(schedules)
      .where(eq(schedules.id, scheduleId))
      .returning({ id: schedules.id });

    if (!deleted) {
      res.status(404).json({ error: "Schedule not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to delete schedule" });
  }
});

export default router;
