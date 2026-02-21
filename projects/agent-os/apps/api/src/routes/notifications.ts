import { Router, Request, Response } from "express";
import { z } from "zod";
import { notifications } from "@agent-os/database";
import { eq, and, gt, desc } from "drizzle-orm";

const router = Router({ mergeParams: true });

const listSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().uuid().optional(),
});

// GET /workspaces/:workspaceId/notifications
router.get("/", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const input = listSchema.parse(req.query);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const conditions = [eq(notifications.workspaceId, workspaceId)];
    if (input.cursor) {
      conditions.push(gt(notifications.id, input.cursor));
    }

    const data = await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
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
    res.status(500).json({ error: "Failed to list notifications" });
  }
});

// PUT /workspaces/:workspaceId/notifications/:notificationId/read
router.put("/:notificationId/read", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const notificationId = z.string().uuid().parse(req.params.notificationId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const now = new Date();
    const [notification] = await db
      .update(notifications)
      .set({
        read: true,
        readAt: now,
        updatedAt: now,
      })
      .where(and(eq(notifications.id, notificationId), eq(notifications.workspaceId, workspaceId)))
      .returning({
        id: notifications.id,
        read: notifications.read,
        readAt: notifications.readAt,
      });

    if (!notification) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }

    res.json(notification);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// DELETE /workspaces/:workspaceId/notifications/:notificationId
router.delete("/:notificationId", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const notificationId = z.string().uuid().parse(req.params.notificationId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [deleted] = await db
      .delete(notifications)
      .where(and(eq(notifications.id, notificationId), eq(notifications.workspaceId, workspaceId)))
      .returning({ id: notifications.id });

    if (!deleted) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

export default router;
