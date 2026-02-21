import { TRPCError } from "@trpc/server";
import { eq, and, gt, desc, asc, count } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { notifications } from "../../db/schema";
import { router, authedProcedure } from "../init";

const DEFAULT_PAGE_SIZE = 50;

const listSchema = z.object({
  organizationId: z.string().uuid().optional(),
  cursor: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const createSchema = z.object({
  userId: z.string().uuid(),
  organizationId: z.string().uuid(),
  moduleId: z.string().uuid().optional(),
  type: z.enum(["info", "success", "warning", "error"]),
  title: z.string().min(1),
  message: z.string().min(1),
  actionUrl: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const updateSchema = z.object({
  notificationId: z.string().uuid(),
  isRead: z.boolean(),
});

const markAllReadSchema = z.object({
  organizationId: z.string().uuid().optional(),
});

const deleteSchema = z.object({
  notificationId: z.string().uuid(),
});

export const notificationsRouter = router({
  list: authedProcedure.input(listSchema).query(async ({ ctx, input }) => {
    const limit = input.limit ?? DEFAULT_PAGE_SIZE;

    const conditions = [eq(notifications.userId, ctx.userId)];
    if (input.organizationId) {
      conditions.push(eq(notifications.organizationId, input.organizationId));
    }
    if (input.cursor) {
      conditions.push(gt(notifications.id, input.cursor));
    }

    const [rows, unreadResult] = await Promise.all([
      db
        .select({
          id: notifications.id,
          organizationId: notifications.organizationId,
          moduleId: notifications.moduleId,
          type: notifications.type,
          title: notifications.title,
          message: notifications.message,
          actionUrl: notifications.actionUrl,
          isRead: notifications.isRead,
          readAt: notifications.readAt,
          metadata: notifications.metadata,
          createdAt: notifications.createdAt,
        })
        .from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt), asc(notifications.id))
        .limit(limit + 1),

      db
        .select({ total: count() })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, ctx.userId),
            eq(notifications.isRead, false),
            ...(input.organizationId
              ? [eq(notifications.organizationId, input.organizationId)]
              : [])
          )
        ),
    ]);

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? data[data.length - 1].id : undefined;

    return {
      data,
      unreadCount: unreadResult[0]?.total ?? 0,
      nextCursor,
      hasMore,
    };
  }),

  create: authedProcedure
    .input(createSchema)
    .mutation(async ({ input }) => {
      const [notification] = await db
        .insert(notifications)
        .values({
          userId: input.userId,
          organizationId: input.organizationId,
          moduleId: input.moduleId,
          type: input.type,
          title: input.title,
          message: input.message,
          actionUrl: input.actionUrl,
          metadata: input.metadata,
        })
        .returning({
          id: notifications.id,
          type: notifications.type,
          title: notifications.title,
        });

      return notification;
    }),

  update: authedProcedure
    .input(updateSchema)
    .mutation(async ({ ctx, input }) => {
      const updates: Record<string, unknown> = {
        isRead: input.isRead,
        updatedAt: new Date(),
      };
      if (input.isRead) {
        updates.readAt = new Date();
      }

      const [notification] = await db
        .update(notifications)
        .set(updates)
        .where(
          and(
            eq(notifications.id, input.notificationId),
            eq(notifications.userId, ctx.userId)
          )
        )
        .returning({
          id: notifications.id,
          isRead: notifications.isRead,
        });

      if (!notification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        });
      }

      return notification;
    }),

  markAllRead: authedProcedure
    .input(markAllReadSchema)
    .mutation(async ({ ctx, input }) => {
      const conditions = [
        eq(notifications.userId, ctx.userId),
        eq(notifications.isRead, false),
      ];
      if (input.organizationId) {
        conditions.push(eq(notifications.organizationId, input.organizationId));
      }

      const result = await db
        .update(notifications)
        .set({ isRead: true, readAt: new Date(), updatedAt: new Date() })
        .where(and(...conditions))
        .returning({ id: notifications.id });

      return { success: true, count: result.length };
    }),

  delete: authedProcedure
    .input(deleteSchema)
    .mutation(async ({ ctx, input }) => {
      const [notification] = await db
        .select({ id: notifications.id })
        .from(notifications)
        .where(
          and(
            eq(notifications.id, input.notificationId),
            eq(notifications.userId, ctx.userId)
          )
        )
        .limit(1);

      if (!notification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        });
      }

      await db
        .delete(notifications)
        .where(eq(notifications.id, input.notificationId));

      return { success: true };
    }),
});
