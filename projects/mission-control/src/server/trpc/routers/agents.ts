import { z } from "zod";
import { eq, and, sql, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { agents, agentVersions } from "@/server/db/schema";

const providerValues = ["claude", "openai", "deepseek", "openrouter", "custom"] as const;
const statusValues = ["active", "paused", "archived"] as const;

const listSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

const createAgentSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  provider: z.enum(providerValues),
  model: z.string().min(1),
  systemPrompt: z.string().optional(),
  configuration: z.record(z.unknown()).optional(),
  projectId: z.string().uuid().optional(),
});

const updateAgentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  systemPrompt: z.string().optional(),
  configuration: z.record(z.unknown()).optional(),
  status: z.enum(statusValues).optional(),
  projectId: z.string().uuid().nullable().optional(),
  changeNotes: z.string().optional(),
});

export const agentsRouter = router({
  list: protectedProcedure
    .input(listSchema)
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      const [data, countResult] = await Promise.all([
        ctx.db
          .select()
          .from(agents)
          .where(eq(agents.userId, ctx.user.userId))
          .orderBy(desc(agents.createdAt))
          .limit(input.limit)
          .offset(offset),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(agents)
          .where(eq(agents.userId, ctx.user.userId)),
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
      const [agent] = await ctx.db
        .select()
        .from(agents)
        .where(
          and(eq(agents.id, input.id), eq(agents.userId, ctx.user.userId))
        )
        .limit(1);

      if (!agent) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
      }

      return agent;
    }),

  create: protectedProcedure
    .input(createAgentSchema)
    .mutation(async ({ ctx, input }) => {
      const [agent] = await ctx.db
        .insert(agents)
        .values({
          name: input.name,
          description: input.description,
          provider: input.provider,
          model: input.model,
          systemPrompt: input.systemPrompt,
          configuration: input.configuration,
          projectId: input.projectId,
          userId: ctx.user.userId,
        })
        .returning();

      return agent;
    }),

  update: protectedProcedure
    .input(updateAgentSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, changeNotes, ...updates } = input;

      const [existing] = await ctx.db
        .select()
        .from(agents)
        .where(and(eq(agents.id, id), eq(agents.userId, ctx.user.userId)))
        .limit(1);

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
      }

      const newVersion = existing.version + 1;

      // Save version snapshot
      await ctx.db.insert(agentVersions).values({
        agentId: id,
        version: existing.version,
        systemPrompt: existing.systemPrompt,
        configuration: existing.configuration,
        changeNotes: changeNotes,
        createdBy: ctx.user.userId,
      });

      const updateValues: Record<string, unknown> = { version: newVersion, updatedAt: new Date() };
      if (updates.name !== undefined) updateValues.name = updates.name;
      if (updates.description !== undefined) updateValues.description = updates.description;
      if (updates.systemPrompt !== undefined) updateValues.systemPrompt = updates.systemPrompt;
      if (updates.configuration !== undefined) updateValues.configuration = updates.configuration;
      if (updates.status !== undefined) updateValues.status = updates.status;
      if (updates.projectId !== undefined) updateValues.projectId = updates.projectId;

      const [agent] = await ctx.db
        .update(agents)
        .set(updateValues)
        .where(and(eq(agents.id, id), eq(agents.userId, ctx.user.userId)))
        .returning({
          id: agents.id,
          name: agents.name,
          version: agents.version,
          status: agents.status,
          updatedAt: agents.updatedAt,
        });

      return agent;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(agents)
        .where(
          and(eq(agents.id, input.id), eq(agents.userId, ctx.user.userId))
        )
        .returning({ id: agents.id });

      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
      }

      return { success: true };
    }),

  clone: protectedProcedure
    .input(z.object({ id: z.string().uuid(), name: z.string().min(1).max(255) }))
    .mutation(async ({ ctx, input }) => {
      const [source] = await ctx.db
        .select()
        .from(agents)
        .where(
          and(eq(agents.id, input.id), eq(agents.userId, ctx.user.userId))
        )
        .limit(1);

      if (!source) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
      }

      const [cloned] = await ctx.db
        .insert(agents)
        .values({
          name: input.name,
          description: source.description,
          provider: source.provider,
          model: source.model,
          systemPrompt: source.systemPrompt,
          configuration: source.configuration,
          projectId: source.projectId,
          userId: ctx.user.userId,
        })
        .returning({
          id: agents.id,
          name: agents.name,
          provider: agents.provider,
          model: agents.model,
          createdAt: agents.createdAt,
        });

      return cloned;
    }),

  versions: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      page: z.number().int().positive().default(1),
      limit: z.number().int().positive().max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      // Verify agent ownership
      const [agent] = await ctx.db
        .select({ id: agents.id })
        .from(agents)
        .where(
          and(eq(agents.id, input.id), eq(agents.userId, ctx.user.userId))
        )
        .limit(1);

      if (!agent) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
      }

      const offset = (input.page - 1) * input.limit;

      const [data, countResult] = await Promise.all([
        ctx.db
          .select()
          .from(agentVersions)
          .where(eq(agentVersions.agentId, input.id))
          .orderBy(desc(agentVersions.version))
          .limit(input.limit)
          .offset(offset),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(agentVersions)
          .where(eq(agentVersions.agentId, input.id)),
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
