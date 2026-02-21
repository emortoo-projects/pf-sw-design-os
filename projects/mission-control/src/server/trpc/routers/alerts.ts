import { z } from "zod";
import { eq, and, sql, desc, isNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { alerts } from "@/server/db/schema";

const alertStatusValues = ["read", "dismissed", "resolved"] as const;

const listSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const alertsRouter = router({
  list: protectedProcedure
    .input(listSchema)
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      const [data, countResult, unreadResult] = await Promise.all([
        ctx.db
          .select()
          .from(alerts)
          .where(eq(alerts.userId, ctx.user.userId))
          .orderBy(desc(alerts.createdAt))
          .limit(input.limit)
          .offset(offset),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(alerts)
          .where(eq(alerts.userId, ctx.user.userId)),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(alerts)
          .where(
            and(
              eq(alerts.userId, ctx.user.userId),
              eq(alerts.status, "unread")
            )
          ),
      ]);

      const total = Number(countResult[0].count);
      const unreadCount = Number(unreadResult[0].count);

      return {
        data,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
        },
        unreadCount,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [alert] = await ctx.db
        .select()
        .from(alerts)
        .where(and(eq(alerts.id, input.id), eq(alerts.userId, ctx.user.userId)))
        .limit(1);

      if (!alert) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Alert not found" });
      }

      return alert;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.enum(alertStatusValues),
    }))
    .mutation(async ({ ctx, input }) => {
      const readAt = input.status === "read" ? new Date() : undefined;

      const updateValues: Record<string, unknown> = {
        status: input.status,
        updatedAt: new Date(),
      };
      if (readAt) updateValues.readAt = readAt;

      const [alert] = await ctx.db
        .update(alerts)
        .set(updateValues)
        .where(and(eq(alerts.id, input.id), eq(alerts.userId, ctx.user.userId)))
        .returning({
          id: alerts.id,
          status: alerts.status,
          readAt: alerts.readAt,
          updatedAt: alerts.updatedAt,
        });

      if (!alert) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Alert not found" });
      }

      return alert;
    }),

  markAllRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      const now = new Date();

      const result = await ctx.db
        .update(alerts)
        .set({ status: "read", readAt: now, updatedAt: now })
        .where(
          and(
            eq(alerts.userId, ctx.user.userId),
            eq(alerts.status, "unread")
          )
        )
        .returning({ id: alerts.id });

      return { updatedCount: result.length };
    }),
});
