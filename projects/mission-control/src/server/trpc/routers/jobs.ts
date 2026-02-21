import { z } from "zod";
import { eq, and, sql, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { jobs, jobExecutions } from "@/server/db/schema";

const jobTypeValues = ["scheduled", "manual", "triggered"] as const;
const jobStatusValues = ["pending", "queued", "running", "completed", "failed", "cancelled", "paused"] as const;

const listSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

const createJobSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  agentId: z.string().uuid(),
  type: z.enum(jobTypeValues),
  cronExpression: z.string().optional(),
  priority: z.number().int().default(0),
  payload: z.record(z.unknown()).optional(),
  retryPolicy: z.record(z.unknown()).optional(),
});

const updateJobSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  cronExpression: z.string().optional(),
  status: z.enum(jobStatusValues).optional(),
  priority: z.number().int().optional(),
  payload: z.record(z.unknown()).optional(),
  retryPolicy: z.record(z.unknown()).optional(),
});

export const jobsRouter = router({
  list: protectedProcedure
    .input(listSchema)
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      const [data, countResult] = await Promise.all([
        ctx.db
          .select()
          .from(jobs)
          .where(eq(jobs.userId, ctx.user.userId))
          .orderBy(desc(jobs.createdAt))
          .limit(input.limit)
          .offset(offset),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(jobs)
          .where(eq(jobs.userId, ctx.user.userId)),
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
      const [job] = await ctx.db
        .select()
        .from(jobs)
        .where(and(eq(jobs.id, input.id), eq(jobs.userId, ctx.user.userId)))
        .limit(1);

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      return job;
    }),

  create: protectedProcedure
    .input(createJobSchema)
    .mutation(async ({ ctx, input }) => {
      const [job] = await ctx.db
        .insert(jobs)
        .values({
          name: input.name,
          description: input.description,
          agentId: input.agentId,
          type: input.type,
          cronExpression: input.cronExpression,
          priority: input.priority,
          payload: input.payload,
          retryPolicy: input.retryPolicy,
          userId: ctx.user.userId,
        })
        .returning({
          id: jobs.id,
          name: jobs.name,
          type: jobs.type,
          status: jobs.status,
          nextRunAt: jobs.nextRunAt,
          createdAt: jobs.createdAt,
        });

      return job;
    }),

  update: protectedProcedure
    .input(updateJobSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const updateValues: Record<string, unknown> = { updatedAt: new Date() };
      if (updates.name !== undefined) updateValues.name = updates.name;
      if (updates.description !== undefined) updateValues.description = updates.description;
      if (updates.cronExpression !== undefined) updateValues.cronExpression = updates.cronExpression;
      if (updates.status !== undefined) updateValues.status = updates.status;
      if (updates.priority !== undefined) updateValues.priority = updates.priority;
      if (updates.payload !== undefined) updateValues.payload = updates.payload;
      if (updates.retryPolicy !== undefined) updateValues.retryPolicy = updates.retryPolicy;

      const [job] = await ctx.db
        .update(jobs)
        .set(updateValues)
        .where(and(eq(jobs.id, id), eq(jobs.userId, ctx.user.userId)))
        .returning({
          id: jobs.id,
          name: jobs.name,
          status: jobs.status,
          updatedAt: jobs.updatedAt,
        });

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      return job;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(jobs)
        .where(and(eq(jobs.id, input.id), eq(jobs.userId, ctx.user.userId)))
        .returning({ id: jobs.id });

      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      return { success: true };
    }),

  pause: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [job] = await ctx.db
        .update(jobs)
        .set({ status: "paused", updatedAt: new Date() })
        .where(and(eq(jobs.id, input.id), eq(jobs.userId, ctx.user.userId)))
        .returning({
          id: jobs.id,
          status: jobs.status,
          updatedAt: jobs.updatedAt,
        });

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      return job;
    }),

  resume: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [job] = await ctx.db
        .update(jobs)
        .set({ status: "pending", updatedAt: new Date() })
        .where(and(eq(jobs.id, input.id), eq(jobs.userId, ctx.user.userId)))
        .returning({
          id: jobs.id,
          status: jobs.status,
          updatedAt: jobs.updatedAt,
        });

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      return job;
    }),

  cancel: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [job] = await ctx.db
        .update(jobs)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(and(eq(jobs.id, input.id), eq(jobs.userId, ctx.user.userId)))
        .returning({
          id: jobs.id,
          status: jobs.status,
          updatedAt: jobs.updatedAt,
        });

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      return job;
    }),

  run: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [job] = await ctx.db
        .select()
        .from(jobs)
        .where(and(eq(jobs.id, input.id), eq(jobs.userId, ctx.user.userId)))
        .limit(1);

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      const [execution] = await ctx.db
        .insert(jobExecutions)
        .values({
          jobId: input.id,
          status: "running",
          startedAt: new Date(),
        })
        .returning();

      await ctx.db
        .update(jobs)
        .set({ status: "running", lastRunAt: new Date(), updatedAt: new Date() })
        .where(eq(jobs.id, input.id));

      return {
        jobId: input.id,
        executionId: execution.id,
        status: execution.status,
        startedAt: execution.startedAt,
      };
    }),

  executions: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      page: z.number().int().positive().default(1),
      limit: z.number().int().positive().max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      // Verify job ownership
      const [job] = await ctx.db
        .select({ id: jobs.id })
        .from(jobs)
        .where(and(eq(jobs.id, input.id), eq(jobs.userId, ctx.user.userId)))
        .limit(1);

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      const offset = (input.page - 1) * input.limit;

      const [data, countResult] = await Promise.all([
        ctx.db
          .select()
          .from(jobExecutions)
          .where(eq(jobExecutions.jobId, input.id))
          .orderBy(desc(jobExecutions.createdAt))
          .limit(input.limit)
          .offset(offset),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(jobExecutions)
          .where(eq(jobExecutions.jobId, input.id)),
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
