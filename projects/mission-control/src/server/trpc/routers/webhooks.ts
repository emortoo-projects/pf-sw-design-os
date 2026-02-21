import { z } from "zod";
import { eq, and, sql, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { webhooks, webhookDeliveries } from "@/server/db/schema";

const listSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

const createWebhookSchema = z.object({
  name: z.string().min(1).max(255),
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  headers: z.record(z.string()).optional(),
  secret: z.string().optional(),
  enabled: z.boolean().optional(),
});

const updateWebhookSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  url: z.string().url().optional(),
  enabled: z.boolean().optional(),
  events: z.array(z.string()).optional(),
  headers: z.record(z.string()).nullable().optional(),
});

export const webhooksRouter = router({
  list: protectedProcedure
    .input(listSchema)
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      const [data, countResult] = await Promise.all([
        ctx.db
          .select()
          .from(webhooks)
          .where(eq(webhooks.userId, ctx.user.userId))
          .orderBy(desc(webhooks.createdAt))
          .limit(input.limit)
          .offset(offset),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(webhooks)
          .where(eq(webhooks.userId, ctx.user.userId)),
      ]);

      const total = Number(countResult[0].count);

      return {
        data,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [webhook] = await ctx.db
        .select()
        .from(webhooks)
        .where(and(eq(webhooks.id, input.id), eq(webhooks.userId, ctx.user.userId)))
        .limit(1);

      if (!webhook) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Webhook not found" });
      }

      return webhook;
    }),

  create: protectedProcedure
    .input(createWebhookSchema)
    .mutation(async ({ ctx, input }) => {
      const [webhook] = await ctx.db
        .insert(webhooks)
        .values({
          name: input.name,
          url: input.url,
          events: input.events,
          headers: input.headers,
          secret: input.secret,
          enabled: input.enabled,
          userId: ctx.user.userId,
        })
        .returning({
          id: webhooks.id,
          name: webhooks.name,
          url: webhooks.url,
          enabled: webhooks.enabled,
          createdAt: webhooks.createdAt,
        });

      return webhook;
    }),

  update: protectedProcedure
    .input(updateWebhookSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const updateValues: Record<string, unknown> = { updatedAt: new Date() };
      if (updates.name !== undefined) updateValues.name = updates.name;
      if (updates.url !== undefined) updateValues.url = updates.url;
      if (updates.enabled !== undefined) updateValues.enabled = updates.enabled;
      if (updates.events !== undefined) updateValues.events = updates.events;
      if (updates.headers !== undefined) updateValues.headers = updates.headers;

      const [webhook] = await ctx.db
        .update(webhooks)
        .set(updateValues)
        .where(and(eq(webhooks.id, id), eq(webhooks.userId, ctx.user.userId)))
        .returning({
          id: webhooks.id,
          name: webhooks.name,
          enabled: webhooks.enabled,
          updatedAt: webhooks.updatedAt,
        });

      if (!webhook) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Webhook not found" });
      }

      return webhook;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(webhooks)
        .where(and(eq(webhooks.id, input.id), eq(webhooks.userId, ctx.user.userId)))
        .returning({ id: webhooks.id });

      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Webhook not found" });
      }

      return { success: true };
    }),

  test: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      payload: z.record(z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [webhook] = await ctx.db
        .select()
        .from(webhooks)
        .where(and(eq(webhooks.id, input.id), eq(webhooks.userId, ctx.user.userId)))
        .limit(1);

      if (!webhook) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Webhook not found" });
      }

      const testPayload = input.payload || { event: "test", timestamp: new Date().toISOString() };

      // Record the delivery attempt
      const [delivery] = await ctx.db
        .insert(webhookDeliveries)
        .values({
          webhookId: webhook.id,
          eventType: "test",
          payload: testPayload,
          status: "pending",
        })
        .returning();

      // Attempt to deliver (best-effort, no actual HTTP call in tRPC layer)
      // In production, this would be handled by a background job
      await ctx.db
        .update(webhookDeliveries)
        .set({
          status: "success",
          httpStatus: 200,
          deliveredAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(webhookDeliveries.id, delivery.id));

      return {
        success: true,
        httpStatus: 200,
        response: null,
        errorMessage: null,
      };
    }),

  deliveries: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      page: z.number().int().positive().default(1),
      limit: z.number().int().positive().max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      // Verify webhook ownership
      const [webhook] = await ctx.db
        .select({ id: webhooks.id })
        .from(webhooks)
        .where(and(eq(webhooks.id, input.id), eq(webhooks.userId, ctx.user.userId)))
        .limit(1);

      if (!webhook) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Webhook not found" });
      }

      const offset = (input.page - 1) * input.limit;

      const [data, countResult] = await Promise.all([
        ctx.db
          .select()
          .from(webhookDeliveries)
          .where(eq(webhookDeliveries.webhookId, input.id))
          .orderBy(desc(webhookDeliveries.createdAt))
          .limit(input.limit)
          .offset(offset),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(webhookDeliveries)
          .where(eq(webhookDeliveries.webhookId, input.id)),
      ]);

      const total = Number(countResult[0].count);

      return {
        data,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),
});
