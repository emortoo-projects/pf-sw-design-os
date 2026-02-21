import { z } from "zod";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { costRecords } from "@/server/db/schema";

const listSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  agentId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  provider: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

const summarySchema = z.object({
  groupBy: z.enum(["provider", "model", "agent", "project"]).default("provider"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const costsRouter = router({
  list: protectedProcedure
    .input(listSchema)
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      const conditions = [];

      if (input.agentId) {
        conditions.push(eq(costRecords.agentId, input.agentId));
      }
      if (input.projectId) {
        conditions.push(eq(costRecords.projectId, input.projectId));
      }
      if (input.provider) {
        conditions.push(eq(costRecords.provider, input.provider as "claude" | "openai" | "deepseek" | "openrouter" | "custom"));
      }
      if (input.startDate) {
        conditions.push(gte(costRecords.createdAt, new Date(input.startDate)));
      }
      if (input.endDate) {
        conditions.push(lte(costRecords.createdAt, new Date(input.endDate)));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [data, countResult, summaryResult] = await Promise.all([
        ctx.db
          .select()
          .from(costRecords)
          .where(whereClause)
          .orderBy(desc(costRecords.createdAt))
          .limit(input.limit)
          .offset(offset),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(costRecords)
          .where(whereClause),
        ctx.db
          .select({
            totalCost: sql<string>`coalesce(sum(${costRecords.totalCost}), '0')`,
            totalTokens: sql<number>`coalesce(sum(${costRecords.totalTokens}), 0)`,
          })
          .from(costRecords)
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
        summary: {
          totalCost: summaryResult[0].totalCost,
          totalTokens: Number(summaryResult[0].totalTokens),
        },
      };
    }),

  summary: protectedProcedure
    .input(summarySchema)
    .query(async ({ ctx, input }) => {
      const conditions = [];

      if (input.startDate) {
        conditions.push(gte(costRecords.createdAt, new Date(input.startDate)));
      }
      if (input.endDate) {
        conditions.push(lte(costRecords.createdAt, new Date(input.endDate)));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [totals] = await ctx.db
        .select({
          totalCost: sql<string>`coalesce(sum(${costRecords.totalCost}), '0')`,
          totalTokens: sql<number>`coalesce(sum(${costRecords.totalTokens}), 0)`,
          totalActivities: sql<number>`count(*)`,
        })
        .from(costRecords)
        .where(whereClause);

      const totalActivities = Number(totals.totalActivities);
      const totalCost = Number(totals.totalCost);

      const groupByColumn =
        input.groupBy === "provider" ? costRecords.provider :
        input.groupBy === "model" ? costRecords.model :
        input.groupBy === "agent" ? costRecords.agentId :
        costRecords.projectId;

      const breakdown = await ctx.db
        .select({
          group: groupByColumn,
          totalCost: sql<string>`coalesce(sum(${costRecords.totalCost}), '0')`,
          totalTokens: sql<number>`coalesce(sum(${costRecords.totalTokens}), 0)`,
          count: sql<number>`count(*)`,
        })
        .from(costRecords)
        .where(whereClause)
        .groupBy(groupByColumn);

      return {
        totalCost: totals.totalCost,
        totalTokens: Number(totals.totalTokens),
        totalActivities,
        averageCostPerActivity: totalActivities > 0
          ? (totalCost / totalActivities).toFixed(6)
          : "0",
        breakdown,
        period: {
          start: input.startDate ?? null,
          end: input.endDate ?? null,
        },
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [cost] = await ctx.db
        .select()
        .from(costRecords)
        .where(eq(costRecords.id, input.id))
        .limit(1);

      if (!cost) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Cost record not found" });
      }

      return cost;
    }),
});
