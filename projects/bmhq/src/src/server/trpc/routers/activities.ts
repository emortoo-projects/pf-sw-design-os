import { eq, and, gt, desc, asc } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { activities, organizationMembers } from "../../db/schema";
import { router, authedProcedure } from "../init";

const DEFAULT_PAGE_SIZE = 50;

const listSchema = z.object({
  organizationId: z.string().uuid(),
  cursor: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const createSchema = z.object({
  organizationId: z.string().uuid(),
  moduleId: z.string().uuid().optional(),
  activityType: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const activitiesRouter = router({
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
      const { TRPCError } = await import("@trpc/server");
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found",
      });
    }

    const limit = input.limit ?? DEFAULT_PAGE_SIZE;

    const conditions = [
      eq(activities.organizationId, input.organizationId),
    ];
    if (input.cursor) {
      conditions.push(gt(activities.id, input.cursor));
    }

    const rows = await db
      .select({
        id: activities.id,
        userId: activities.userId,
        moduleId: activities.moduleId,
        activityType: activities.activityType,
        title: activities.title,
        description: activities.description,
        entityType: activities.entityType,
        entityId: activities.entityId,
        metadata: activities.metadata,
        occurredAt: activities.occurredAt,
        createdAt: activities.createdAt,
      })
      .from(activities)
      .where(and(...conditions))
      .orderBy(desc(activities.occurredAt), asc(activities.id))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? data[data.length - 1].id : undefined;

    return { data, nextCursor, hasMore };
  }),

  create: authedProcedure
    .input(createSchema)
    .mutation(async ({ ctx, input }) => {
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
        const { TRPCError } = await import("@trpc/server");
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      const [activity] = await db
        .insert(activities)
        .values({
          organizationId: input.organizationId,
          userId: ctx.userId,
          moduleId: input.moduleId,
          activityType: input.activityType,
          title: input.title,
          description: input.description,
          entityType: input.entityType,
          entityId: input.entityId,
          metadata: input.metadata,
        })
        .returning({
          id: activities.id,
          activityType: activities.activityType,
          title: activities.title,
        });

      return activity;
    }),
});
