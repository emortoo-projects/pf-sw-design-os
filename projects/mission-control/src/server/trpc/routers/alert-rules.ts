import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { alertRules } from "@/server/db/schema";

const alertTypes = ["budget_threshold", "agent_error", "job_stuck", "performance_anomaly", "credential_expiry"] as const;
const scopes = ["global", "project", "agent"] as const;

const listSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  type: z.enum(alertTypes).optional(),
  scope: z.enum(scopes).optional(),
  enabled: z.boolean().optional(),
});

const createSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(alertTypes),
  conditions: z.record(z.unknown()),
  scope: z.enum(scopes),
  scopeId: z.string().uuid().optional(),
  notificationChannels: z.record(z.unknown()),
  enabled: z.boolean().default(true),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  enabled: z.boolean().optional(),
  conditions: z.record(z.unknown()).optional(),
  notificationChannels: z.record(z.unknown()).optional(),
});

export const alertRulesRouter = router({
  list: protectedProcedure
    .input(listSchema)
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      const conditions = [eq(alertRules.userId, ctx.user.userId)];

      if (input.type) {
        conditions.push(eq(alertRules.type, input.type));
      }
      if (input.scope) {
        conditions.push(eq(alertRules.scope, input.scope));
      }
      if (input.enabled !== undefined) {
        conditions.push(eq(alertRules.enabled, input.enabled));
      }

      const whereClause = and(...conditions);

      const [data, countResult] = await Promise.all([
        ctx.db
          .select()
          .from(alertRules)
          .where(whereClause)
          .orderBy(desc(alertRules.createdAt))
          .limit(input.limit)
          .offset(offset),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(alertRules)
          .where(whereClause),
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
      const [rule] = await ctx.db
        .select()
        .from(alertRules)
        .where(and(eq(alertRules.id, input.id), eq(alertRules.userId, ctx.user.userId)))
        .limit(1);

      if (!rule) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Alert rule not found" });
      }

      return rule;
    }),

  create: protectedProcedure
    .input(createSchema)
    .mutation(async ({ ctx, input }) => {
      const [rule] = await ctx.db
        .insert(alertRules)
        .values({
          name: input.name,
          type: input.type,
          conditions: input.conditions,
          scope: input.scope,
          scopeId: input.scopeId,
          notificationChannels: input.notificationChannels,
          enabled: input.enabled,
          userId: ctx.user.userId,
        })
        .returning({
          id: alertRules.id,
          name: alertRules.name,
          type: alertRules.type,
          enabled: alertRules.enabled,
          createdAt: alertRules.createdAt,
        });

      return rule;
    }),

  update: protectedProcedure
    .input(updateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const [existing] = await ctx.db
        .select({ id: alertRules.id })
        .from(alertRules)
        .where(and(eq(alertRules.id, id), eq(alertRules.userId, ctx.user.userId)))
        .limit(1);

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Alert rule not found" });
      }

      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.enabled !== undefined) updateData.enabled = updates.enabled;
      if (updates.conditions !== undefined) updateData.conditions = updates.conditions;
      if (updates.notificationChannels !== undefined) updateData.notificationChannels = updates.notificationChannels;

      const [rule] = await ctx.db
        .update(alertRules)
        .set(updateData)
        .where(eq(alertRules.id, id))
        .returning({
          id: alertRules.id,
          name: alertRules.name,
          enabled: alertRules.enabled,
          updatedAt: alertRules.updatedAt,
        });

      return rule;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: alertRules.id })
        .from(alertRules)
        .where(and(eq(alertRules.id, input.id), eq(alertRules.userId, ctx.user.userId)))
        .limit(1);

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Alert rule not found" });
      }

      await ctx.db.delete(alertRules).where(eq(alertRules.id, input.id));

      return { success: true };
    }),
});
