import { Router, Request, Response } from "express";
import { z } from "zod";
import { workspaces } from "@agent-os/database";
import { eq, gt, asc } from "drizzle-orm";

const router = Router();

const listSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().uuid().optional(),
});

const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  settings: z.record(z.unknown()).optional(),
});

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  settings: z.record(z.unknown()).optional(),
});

// GET /workspaces - List workspaces with cursor pagination
router.get("/", async (req: Request, res: Response) => {
  try {
    const input = listSchema.parse(req.query);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const conditions = input.cursor ? gt(workspaces.id, input.cursor) : undefined;

    const data = await db
      .select()
      .from(workspaces)
      .where(conditions)
      .orderBy(asc(workspaces.id))
      .limit(input.limit + 1);

    const hasMore = data.length > input.limit;
    const results = hasMore ? data.slice(0, input.limit) : data;
    const nextCursor = hasMore ? results[results.length - 1].id : undefined;

    res.json({
      data: results,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to list workspaces" });
  }
});

// POST /workspaces - Create workspace
router.post("/", async (req: Request, res: Response) => {
  try {
    const input = createWorkspaceSchema.parse(req.body);
    const { db } = req.app.locals;
    const userId = (req as any).userId;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [workspace] = await db
      .insert(workspaces)
      .values({
        name: input.name,
        slug: input.slug,
        description: input.description,
        settings: input.settings || {},
        ownerId: userId,
      })
      .returning();

    res.status(201).json(workspace);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to create workspace" });
  }
});

// GET /workspaces/:id - Get workspace by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id))
      .limit(1);

    if (!workspace) {
      res.status(404).json({ error: "Workspace not found" });
      return;
    }

    res.json(workspace);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid workspace ID" });
      return;
    }
    res.status(500).json({ error: "Failed to get workspace" });
  }
});

// PUT /workspaces/:id - Update workspace
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const input = updateWorkspaceSchema.parse(req.body);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const updateValues: Record<string, unknown> = { updatedAt: new Date() };
    if (input.name !== undefined) updateValues.name = input.name;
    if (input.description !== undefined) updateValues.description = input.description;
    if (input.settings !== undefined) updateValues.settings = input.settings;

    const [workspace] = await db
      .update(workspaces)
      .set(updateValues)
      .where(eq(workspaces.id, id))
      .returning({
        id: workspaces.id,
        name: workspaces.name,
        updatedAt: workspaces.updatedAt,
      });

    if (!workspace) {
      res.status(404).json({ error: "Workspace not found" });
      return;
    }

    res.json(workspace);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to update workspace" });
  }
});

// DELETE /workspaces/:id - Delete workspace
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [deleted] = await db
      .delete(workspaces)
      .where(eq(workspaces.id, id))
      .returning({ id: workspaces.id });

    if (!deleted) {
      res.status(404).json({ error: "Workspace not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid workspace ID" });
      return;
    }
    res.status(500).json({ error: "Failed to delete workspace" });
  }
});

export default router;
