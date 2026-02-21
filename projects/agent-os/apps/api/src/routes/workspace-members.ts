import { Router, Request, Response } from "express";
import { z } from "zod";
import { workspaceMembers } from "@agent-os/database";
import { eq, and, gt, asc } from "drizzle-orm";

const router = Router({ mergeParams: true });

const memberRoleValues = ["owner", "admin", "member", "viewer"] as const;

const listSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().uuid().optional(),
});

const addMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(memberRoleValues),
});

const updateMemberSchema = z.object({
  role: z.enum(memberRoleValues),
});

// GET /workspaces/:workspaceId/members - List workspace members
router.get("/", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const input = listSchema.parse(req.query);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const conditions = [eq(workspaceMembers.workspaceId, workspaceId)];
    if (input.cursor) {
      conditions.push(gt(workspaceMembers.id, input.cursor));
    }

    const data = await db
      .select()
      .from(workspaceMembers)
      .where(and(...conditions))
      .orderBy(asc(workspaceMembers.id))
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
    res.status(500).json({ error: "Failed to list members" });
  }
});

// POST /workspaces/:workspaceId/members - Add member
router.post("/", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const input = addMemberSchema.parse(req.body);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [member] = await db
      .insert(workspaceMembers)
      .values({
        workspaceId,
        userId: input.userId,
        role: input.role,
      })
      .returning();

    res.status(201).json(member);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to add member" });
  }
});

// PUT /workspaces/:workspaceId/members/:memberId - Update member role
router.put("/:memberId", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const memberId = z.string().uuid().parse(req.params.memberId);
    const input = updateMemberSchema.parse(req.body);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [member] = await db
      .update(workspaceMembers)
      .set({ role: input.role, updatedAt: new Date() })
      .where(
        and(
          eq(workspaceMembers.id, memberId),
          eq(workspaceMembers.workspaceId, workspaceId)
        )
      )
      .returning({
        id: workspaceMembers.id,
        role: workspaceMembers.role,
        updatedAt: workspaceMembers.updatedAt,
      });

    if (!member) {
      res.status(404).json({ error: "Member not found" });
      return;
    }

    res.json(member);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to update member" });
  }
});

// DELETE /workspaces/:workspaceId/members/:memberId - Remove member
router.delete("/:memberId", async (req: Request, res: Response) => {
  try {
    const workspaceId = z.string().uuid().parse(req.params.workspaceId);
    const memberId = z.string().uuid().parse(req.params.memberId);
    const { db } = req.app.locals;

    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const [deleted] = await db
      .delete(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.id, memberId),
          eq(workspaceMembers.workspaceId, workspaceId)
        )
      )
      .returning({ id: workspaceMembers.id });

    if (!deleted) {
      res.status(404).json({ error: "Member not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    res.status(500).json({ error: "Failed to remove member" });
  }
});

export default router;
