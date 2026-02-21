import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { jobExecutions, jobs } from "@/server/db/schema";

const listSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  jobId: z.string().uuid().optional(),
  status: z.enum(["pending", "running", "success", "failed", "cancelled"]).optional(),
});

export const jobExecutionsRouter = router({
  list: protectedProcedure
    .input(listSchema)
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      const conditions = [];

      if (input.jobId) {
        conditions.push(eq(jobExecutions.jobId, input.jobId));
      }
      if (input.status) {
        conditions.push(eq(jobExecutions.status, input.status));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [data, countResult] = await Promise.all([
        ctx.db
          .select()
          .from(jobExecutions)
          .where(whereClause)
          .orderBy(desc(jobExecutions.createdAt))
          .limit(input.limit)
          .offset(offset),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(jobExecutions)
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
      const [execution] = await ctx.db
        .select()
        .from(jobExecutions)
        .where(eq(jobExecutions.id, input.id))
        .limit(1);

      if (!execution) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job execution not found" });
      }

      return execution;
    }),
});
