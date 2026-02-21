import { TRPCError } from "@trpc/server";
import { eq, and, gt, desc, asc } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { auditLogs, organizationMembers, users } from "../../db/schema";
import { router, authedProcedure } from "../init";

const DEFAULT_PAGE_SIZE = 50;

const listSchema = z.object({
  organizationId: z.string().uuid(),
  cursor: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const auditLogsRouter = router({
  list: authedProcedure.input(listSchema).query(async ({ ctx, input }) => {
    // Verify admin membership
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, input.organizationId),
          eq(organizationMembers.userId, ctx.userId)
        )
      )
      .limit(1);

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only owners and admins can view audit logs",
      });
    }

    const limit = input.limit ?? DEFAULT_PAGE_SIZE;

    const conditions = [
      eq(auditLogs.organizationId, input.organizationId),
    ];
    if (input.cursor) {
      conditions.push(gt(auditLogs.id, input.cursor));
    }

    const rows = await db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        changes: auditLogs.changes,
        ipAddress: auditLogs.ipAddress,
        metadata: auditLogs.metadata,
        createdAt: auditLogs.createdAt,
        userName: users.name,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(auditLogs.createdAt), asc(auditLogs.id))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? data[data.length - 1].id : undefined;

    return { data, nextCursor, hasMore };
  }),
});
