import { z } from "zod";
import { eq, and, sql, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { projects } from "@/server/db/schema";

const listSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
});

const updateProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
});

export const projectsRouter = router({
  list: protectedProcedure
    .input(listSchema)
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      const [data, countResult] = await Promise.all([
        ctx.db
          .select()
          .from(projects)
          .where(eq(projects.userId, ctx.user.userId))
          .orderBy(desc(projects.createdAt))
          .limit(input.limit)
          .offset(offset),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(projects)
          .where(eq(projects.userId, ctx.user.userId)),
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
      const [project] = await ctx.db
        .select()
        .from(projects)
        .where(
          and(eq(projects.id, input.id), eq(projects.userId, ctx.user.userId))
        )
        .limit(1);

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      return project;
    }),

  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const [project] = await ctx.db
        .insert(projects)
        .values({
          name: input.name,
          description: input.description,
          userId: ctx.user.userId,
        })
        .returning();

      return project;
    }),

  update: protectedProcedure
    .input(updateProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const updateValues: Record<string, unknown> = { updatedAt: new Date() };
      if (updates.name !== undefined) updateValues.name = updates.name;
      if (updates.description !== undefined) updateValues.description = updates.description;

      const [project] = await ctx.db
        .update(projects)
        .set(updateValues)
        .where(
          and(eq(projects.id, id), eq(projects.userId, ctx.user.userId))
        )
        .returning({
          id: projects.id,
          name: projects.name,
          description: projects.description,
          updatedAt: projects.updatedAt,
        });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      return project;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(projects)
        .where(
          and(eq(projects.id, input.id), eq(projects.userId, ctx.user.userId))
        )
        .returning({ id: projects.id });

      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      return { success: true };
    }),
});
