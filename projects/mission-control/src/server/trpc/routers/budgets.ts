import { z } from "zod";
import { eq, and, sql, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { budgets } from "@/server/db/schema";

const budgetPeriodValues = ["daily", "weekly", "monthly", "yearly", "total"] as const;
const budgetScopeValues = ["global", "project", "agent", "user"] as const;

const listSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

const createBudgetSchema = z.object({
  name: z.string().min(1).max(255),
  limit: z.string(),
  period: z.enum(budgetPeriodValues),
  scope: z.enum(budgetScopeValues),
  scopeId: z.string().uuid().optional(),
  alertThresholds: z.array(z.number()).optional(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
});

const updateBudgetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  limit: z.string().optional(),
  period: z.enum(budgetPeriodValues).optional(),
  scope: z.enum(budgetScopeValues).optional(),
  scopeId: z.string().uuid().nullable().optional(),
  alertThresholds: z.array(z.number()).nullable().optional(),
  periodStart: z.string().datetime().optional(),
  periodEnd: z.string().datetime().optional(),
});

export const budgetsRouter = router({
  list: protectedProcedure
    .input(listSchema)
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      const [data, countResult] = await Promise.all([
        ctx.db
          .select()
          .from(budgets)
          .where(eq(budgets.userId, ctx.user.userId))
          .orderBy(desc(budgets.createdAt))
          .limit(input.limit)
          .offset(offset),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(budgets)
          .where(eq(budgets.userId, ctx.user.userId)),
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
      const [budget] = await ctx.db
        .select()
        .from(budgets)
        .where(and(eq(budgets.id, input.id), eq(budgets.userId, ctx.user.userId)))
        .limit(1);

      if (!budget) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Budget not found" });
      }

      return budget;
    }),

  create: protectedProcedure
    .input(createBudgetSchema)
    .mutation(async ({ ctx, input }) => {
      const [budget] = await ctx.db
        .insert(budgets)
        .values({
          name: input.name,
          limit: input.limit,
          period: input.period,
          scope: input.scope,
          scopeId: input.scopeId,
          alertThresholds: input.alertThresholds,
          periodStart: new Date(input.periodStart),
          periodEnd: new Date(input.periodEnd),
          userId: ctx.user.userId,
        })
        .returning();

      return budget;
    }),

  update: protectedProcedure
    .input(updateBudgetSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const updateValues: Record<string, unknown> = { updatedAt: new Date() };
      if (updates.name !== undefined) updateValues.name = updates.name;
      if (updates.limit !== undefined) updateValues.limit = updates.limit;
      if (updates.period !== undefined) updateValues.period = updates.period;
      if (updates.scope !== undefined) updateValues.scope = updates.scope;
      if (updates.scopeId !== undefined) updateValues.scopeId = updates.scopeId;
      if (updates.alertThresholds !== undefined) updateValues.alertThresholds = updates.alertThresholds;
      if (updates.periodStart !== undefined) updateValues.periodStart = new Date(updates.periodStart);
      if (updates.periodEnd !== undefined) updateValues.periodEnd = new Date(updates.periodEnd);

      const [budget] = await ctx.db
        .update(budgets)
        .set(updateValues)
        .where(and(eq(budgets.id, id), eq(budgets.userId, ctx.user.userId)))
        .returning();

      if (!budget) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Budget not found" });
      }

      return budget;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(budgets)
        .where(and(eq(budgets.id, input.id), eq(budgets.userId, ctx.user.userId)))
        .returning({ id: budgets.id });

      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Budget not found" });
      }

      return { success: true };
    }),

  reset: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [budget] = await ctx.db
        .update(budgets)
        .set({ currentSpend: "0", updatedAt: new Date() })
        .where(and(eq(budgets.id, input.id), eq(budgets.userId, ctx.user.userId)))
        .returning();

      if (!budget) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Budget not found" });
      }

      return budget;
    }),
});
