import { Router, Request, Response } from "express";
import { z } from "zod";
import { users } from "@agent-os/database";
import { eq, gt, asc } from "drizzle-orm";

const router = Router();

const userRoleValues = ["admin", "member", "viewer"] as const;

const listSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().uuid().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(userRoleValues).optional(),
});

// GET /users - List users with cursor pagination
router.get("/", async (req: Request, res: Response) => {
  try {
    const input = listSchema.parse(req.query);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const conditions = input.cursor ? gt(users.id, input.cursor) : undefined;

    const data = await db
      .select()
      .from(users)
      .where(conditions)
      .orderBy(asc(users.id))
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
    res.status(500).json({ error: "Failed to list users" });
  }
});

// GET /users/:id - Get user by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }
    res.status(500).json({ error: "Failed to get user" });
  }
});

// PUT /users/:id - Update user
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const input = updateUserSchema.parse(req.body);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const updateValues: Record<string, unknown> = { updatedAt: new Date() };
    if (input.name !== undefined) updateValues.name = input.name;
    if (input.role !== undefined) updateValues.role = input.role;

    const [user] = await db
      .update(users)
      .set(updateValues)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        updatedAt: users.updatedAt,
      });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to update user" });
  }
});

// DELETE /users/:id - Delete user
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (!deleted) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
