import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { activities, agents } from "@/server/db/schema";

const activityTypes = ["chat", "completion", "embedding", "function_call", "workflow"] as const;

const listSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  agentId: z.string().uuid().optional(),
  status: z.enum(["pending", "running", "success", "failed", "cancelled"]).optional(),
  type: z.enum(activityTypes).optional(),
});

const createSchema = z.object({
  agentId: z.string().uuid(),
  type: z.enum(activityTypes),
  input: z.string().optional(),
  output: z.string().optional(),
  tokensUsed: z.number().int().optional(),
  inputTokens: z.number().int().optional(),
  outputTokens: z.number().int().optional(),
  cost: z.string().optional(),
  executionTime: z.number().int().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const activitiesRouter = router({
  list: protectedProcedure
    .input(listSchema)
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      const conditions = [];

      if (input.agentId) {
        conditions.push(eq(activities.agentId, input.agentId));
      }
      if (input.status) {
        conditions.push(eq(activities.status, input.status));
      }
      if (input.type) {
        conditions.push(eq(activities.type, input.type));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [data, countResult] = await Promise.all([
        ctx.db
          .select()
          .from(activities)
          .where(whereClause)
          .orderBy(desc(activities.createdAt))
          .limit(input.limit)
          .offset(offset),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(activities)
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
      const [activity] = await ctx.db
        .select()
        .from(activities)
        .where(eq(activities.id, input.id))
        .limit(1);

      if (!activity) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Activity not found" });
      }

      return activity;
    }),

  create: protectedProcedure
    .input(createSchema)
    .mutation(async ({ ctx, input }) => {
      const [agent] = await ctx.db
        .select({ id: agents.id })
        .from(agents)
        .where(eq(agents.id, input.agentId))
        .limit(1);

      if (!agent) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
      }

      const [activity] = await ctx.db
        .insert(activities)
        .values({
          agentId: input.agentId,
          type: input.type,
          status: "pending",
          input: input.input,
          output: input.output,
          tokensUsed: input.tokensUsed,
          inputTokens: input.inputTokens,
          outputTokens: input.outputTokens,
          cost: input.cost,
          executionTime: input.executionTime,
          metadata: input.metadata,
        })
        .returning({
          id: activities.id,
          agentId: activities.agentId,
          type: activities.type,
          status: activities.status,
          createdAt: activities.createdAt,
        });

      return activity;
    }),
});
