import { Router, Request, Response } from "express";
import { z } from "zod";
import { abTests } from "@agent-os/database";
import { eq, and, gt, asc } from "drizzle-orm";

const router = Router({ mergeParams: true });

const abTestStatusValues = ["draft", "running", "paused", "completed"] as const;

const listSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().uuid().optional(),
});

const createAbTestSchema = z.object({
  name: z.string().min(1).max(255),
  agentId: z.string().uuid().optional(),
  workflowId: z.string().uuid().optional(),
  variants: z.record(z.unknown()),
  trafficSplit: z.record(z.unknown()),
});

const updateAbTestSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  trafficSplit: z.record(z.unknown()).optional(),
  status: z.enum(abTestStatusValues).optional(),
});

// GET /workspaces/:workspaceId/ab-tests
router.get("/", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const input = listSchema.parse(req.query);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const conditions = [eq(abTests.workspaceId, workspaceId)];
    if (input.cursor) {
      conditions.push(gt(abTests.id, input.cursor));
    }

    const data = await db
      .select()
      .from(abTests)
      .where(and(...conditions))
      .orderBy(asc(abTests.id))
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
    res.status(500).json({ error: "Failed to list A/B tests" });
  }
});

// POST /workspaces/:workspaceId/ab-tests
router.post("/", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const input = createAbTestSchema.parse(req.body);
    const { db } = req.app.locals;
    const userId = (req as any).userId;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [test] = await db
      .insert(abTests)
      .values({
        workspaceId,
        name: input.name,
        agentId: input.agentId,
        workflowId: input.workflowId,
        variants: input.variants,
        trafficSplit: input.trafficSplit,
        createdBy: userId,
      })
      .returning({
        id: abTests.id,
        name: abTests.name,
        status: abTests.status,
        createdAt: abTests.createdAt,
      });

    res.status(201).json(test);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to create A/B test" });
  }
});

// GET /workspaces/:workspaceId/ab-tests/:testId
router.get("/:testId", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const testId = z.string().uuid().parse(req.params.testId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [test] = await db
      .select()
      .from(abTests)
      .where(and(eq(abTests.id, testId), eq(abTests.workspaceId, workspaceId)))
      .limit(1);

    if (!test) {
      res.status(404).json({ error: "A/B test not found" });
      return;
    }

    res.json(test);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to get A/B test" });
  }
});

// PUT /workspaces/:workspaceId/ab-tests/:testId
router.put("/:testId", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const testId = z.string().uuid().parse(req.params.testId);
    const input = updateAbTestSchema.parse(req.body);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const updateValues: Record<string, unknown> = { updatedAt: new Date() };
    if (input.name !== undefined) updateValues.name = input.name;
    if (input.trafficSplit !== undefined) updateValues.trafficSplit = input.trafficSplit;
    if (input.status !== undefined) updateValues.status = input.status;

    const [test] = await db
      .update(abTests)
      .set(updateValues)
      .where(and(eq(abTests.id, testId), eq(abTests.workspaceId, workspaceId)))
      .returning({
        id: abTests.id,
        updatedAt: abTests.updatedAt,
      });

    if (!test) {
      res.status(404).json({ error: "A/B test not found" });
      return;
    }

    res.json(test);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to update A/B test" });
  }
});

// DELETE /workspaces/:workspaceId/ab-tests/:testId
router.delete("/:testId", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const testId = z.string().uuid().parse(req.params.testId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [deleted] = await db
      .delete(abTests)
      .where(and(eq(abTests.id, testId), eq(abTests.workspaceId, workspaceId)))
      .returning({ id: abTests.id });

    if (!deleted) {
      res.status(404).json({ error: "A/B test not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to delete A/B test" });
  }
});

// POST /workspaces/:workspaceId/ab-tests/:testId/start
router.post("/:testId/start", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const testId = z.string().uuid().parse(req.params.testId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const now = new Date();
    const [test] = await db
      .update(abTests)
      .set({
        status: "running",
        startedAt: now,
        updatedAt: now,
      })
      .where(and(eq(abTests.id, testId), eq(abTests.workspaceId, workspaceId)))
      .returning({
        id: abTests.id,
        status: abTests.status,
        startedAt: abTests.startedAt,
      });

    if (!test) {
      res.status(404).json({ error: "A/B test not found" });
      return;
    }

    res.json(test);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to start A/B test" });
  }
});

// POST /workspaces/:workspaceId/ab-tests/:testId/stop
router.post("/:testId/stop", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const testId = z.string().uuid().parse(req.params.testId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const now = new Date();
    const [test] = await db
      .update(abTests)
      .set({
        status: "completed",
        endedAt: now,
        updatedAt: now,
      })
      .where(and(eq(abTests.id, testId), eq(abTests.workspaceId, workspaceId)))
      .returning({
        id: abTests.id,
        status: abTests.status,
        endedAt: abTests.endedAt,
        results: abTests.results,
      });

    if (!test) {
      res.status(404).json({ error: "A/B test not found" });
      return;
    }

    res.json(test);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to stop A/B test" });
  }
});

export default router;
