import { Router, Request, Response } from "express";
import { z } from "zod";
import { executions, executionSteps } from "@agent-os/database";
import { eq, and, gt, asc, desc } from "drizzle-orm";

const router = Router({ mergeParams: true });

const listSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().uuid().optional(),
});

const executeSchema = z.object({
  input: z.record(z.unknown()).optional(),
});

// POST /workspaces/:workspaceId/workflows/:workflowId/execute
router.post("/workflows/:workflowId/execute", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const workflowId = z.string().uuid().parse(req.params.workflowId);
    const input = executeSchema.parse(req.body);
    const { db } = req.app.locals;
    const userId = (req as any).userId;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [execution] = await db
      .insert(executions)
      .values({
        workflowId,
        workspaceId,
        triggeredBy: "api",
        triggeredByUserId: userId,
        input: input.input || {},
      })
      .returning({
        executionId: executions.id,
        status: executions.status,
        createdAt: executions.createdAt,
      });

    res.status(202).json(execution);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to start execution" });
  }
});

// GET /workspaces/:workspaceId/executions
router.get("/executions", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const input = listSchema.parse(req.query);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const conditions = [eq(executions.workspaceId, workspaceId)];
    if (input.cursor) {
      conditions.push(gt(executions.id, input.cursor));
    }

    const data = await db
      .select()
      .from(executions)
      .where(and(...conditions))
      .orderBy(asc(executions.id))
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
    res.status(500).json({ error: "Failed to list executions" });
  }
});

// GET /workspaces/:workspaceId/executions/:executionId
router.get("/executions/:executionId", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const executionId = z.string().uuid().parse(req.params.executionId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [execution] = await db
      .select()
      .from(executions)
      .where(and(eq(executions.id, executionId), eq(executions.workspaceId, workspaceId)))
      .limit(1);

    if (!execution) {
      res.status(404).json({ error: "Execution not found" });
      return;
    }

    res.json(execution);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to get execution" });
  }
});

// POST /workspaces/:workspaceId/executions/:executionId/cancel
router.post("/executions/:executionId/cancel", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const executionId = z.string().uuid().parse(req.params.executionId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [execution] = await db
      .update(executions)
      .set({
        status: "cancelled",
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(executions.id, executionId), eq(executions.workspaceId, workspaceId)))
      .returning({
        id: executions.id,
        status: executions.status,
      });

    if (!execution) {
      res.status(404).json({ error: "Execution not found" });
      return;
    }

    res.json(execution);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to cancel execution" });
  }
});

// GET /workspaces/:workspaceId/executions/:executionId/steps
router.get("/executions/:executionId/steps", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const executionId = z.string().uuid().parse(req.params.executionId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    // Verify execution belongs to workspace
    const [execution] = await db
      .select({ id: executions.id })
      .from(executions)
      .where(and(eq(executions.id, executionId), eq(executions.workspaceId, workspaceId)))
      .limit(1);

    if (!execution) {
      res.status(404).json({ error: "Execution not found" });
      return;
    }

    const steps = await db
      .select()
      .from(executionSteps)
      .where(eq(executionSteps.executionId, executionId))
      .orderBy(asc(executionSteps.stepNumber));

    res.json({ data: steps });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to get execution steps" });
  }
});

// GET /workspaces/:workspaceId/executions/:executionId/logs
// Note: Contract specifies status 101 (WebSocket upgrade), but for REST fallback we return JSON
router.get("/executions/:executionId/logs", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const executionId = z.string().uuid().parse(req.params.executionId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    // Verify execution belongs to workspace
    const [execution] = await db
      .select({ id: executions.id })
      .from(executions)
      .where(and(eq(executions.id, executionId), eq(executions.workspaceId, workspaceId)))
      .limit(1);

    if (!execution) {
      res.status(404).json({ error: "Execution not found" });
      return;
    }

    // Aggregate logs from execution steps
    const steps = await db
      .select({
        stepNumber: executionSteps.stepNumber,
        status: executionSteps.status,
        logs: executionSteps.logs,
        startedAt: executionSteps.startedAt,
        completedAt: executionSteps.completedAt,
      })
      .from(executionSteps)
      .where(eq(executionSteps.executionId, executionId))
      .orderBy(asc(executionSteps.stepNumber));

    const logs = steps.map((step) => ({
      type: step.logs ? "log" : "status",
      data: {
        stepNumber: step.stepNumber,
        status: step.status,
        message: step.logs,
      },
      timestamp: (step.startedAt || step.completedAt || new Date()).toISOString(),
    }));

    res.json(logs);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to get execution logs" });
  }
});

export default router;
