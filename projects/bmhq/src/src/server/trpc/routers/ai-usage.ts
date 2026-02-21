import { TRPCError } from "@trpc/server";
import { eq, and, gt, asc, sum, count, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { aiUsage, organizationMembers, users } from "../../db/schema";
import { router, authedProcedure } from "../init";

const DEFAULT_PAGE_SIZE = 50;

const listSchema = z.object({
  organizationId: z.string().uuid(),
  cursor: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const aiUsageRouter = router({
  list: authedProcedure.input(listSchema).query(async ({ ctx, input }) => {
    // Verify membership
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

    if (!membership) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found",
      });
    }

    const limit = input.limit ?? DEFAULT_PAGE_SIZE;

    const conditions = [
      eq(aiUsage.organizationId, input.organizationId),
    ];
    if (input.cursor) {
      conditions.push(gt(aiUsage.id, input.cursor));
    }

    const rows = await db
      .select({
        id: aiUsage.id,
        userId: aiUsage.userId,
        model: aiUsage.model,
        tokensUsed: aiUsage.tokensUsed,
        cost: aiUsage.cost,
        requestType: aiUsage.requestType,
        createdAt: aiUsage.createdAt,
        userName: users.name,
      })
      .from(aiUsage)
      .innerJoin(users, eq(aiUsage.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(aiUsage.createdAt), asc(aiUsage.id))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? data[data.length - 1].id : undefined;

    // Get summary stats
    const [summary] = await db
      .select({
        totalTokens: sum(aiUsage.tokensUsed),
        totalCost: sum(aiUsage.cost),
        totalRequests: count(),
      })
      .from(aiUsage)
      .where(eq(aiUsage.organizationId, input.organizationId));

    return {
      data,
      summary: {
        totalTokens: Number(summary.totalTokens ?? 0),
        totalCost: Number(summary.totalCost ?? 0),
        totalRequests: Number(summary.totalRequests),
      },
      nextCursor,
      hasMore,
    };
  }),
});
