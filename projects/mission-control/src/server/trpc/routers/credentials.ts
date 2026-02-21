import { z } from "zod";
import { eq, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { apiCredentials } from "@/server/db/schema";

const providerValues = ["claude", "openai", "deepseek", "openrouter", "custom"] as const;

const createCredentialSchema = z.object({
  provider: z.enum(providerValues),
  apiKey: z.string().min(1, "API key is required"),
  name: z.string().min(1, "Name is required").max(255),
  agentId: z.string().uuid().optional(),
});

const updateCredentialSchema = z.object({
  id: z.string().uuid(),
  apiKey: z.string().min(1).optional(),
  name: z.string().min(1).max(255).optional(),
});

const listSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const credentialsRouter = router({
  list: protectedProcedure
    .input(listSchema)
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      const [data, countResult] = await Promise.all([
        ctx.db
          .select({
            id: apiCredentials.id,
            provider: apiCredentials.provider,
            name: apiCredentials.name,
            agentId: apiCredentials.agentId,
            createdAt: apiCredentials.createdAt,
          })
          .from(apiCredentials)
          .where(eq(apiCredentials.userId, ctx.user.userId))
          .limit(input.limit)
          .offset(offset),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(apiCredentials)
          .where(eq(apiCredentials.userId, ctx.user.userId)),
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
      const [credential] = await ctx.db
        .select({
          id: apiCredentials.id,
          provider: apiCredentials.provider,
          name: apiCredentials.name,
          agentId: apiCredentials.agentId,
          createdAt: apiCredentials.createdAt,
        })
        .from(apiCredentials)
        .where(
          and(
            eq(apiCredentials.id, input.id),
            eq(apiCredentials.userId, ctx.user.userId)
          )
        )
        .limit(1);

      if (!credential) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Credential not found" });
      }

      return credential;
    }),

  create: protectedProcedure
    .input(createCredentialSchema)
    .mutation(async ({ ctx, input }) => {
      const [credential] = await ctx.db
        .insert(apiCredentials)
        .values({
          provider: input.provider,
          apiKey: input.apiKey,
          name: input.name,
          agentId: input.agentId,
          userId: ctx.user.userId,
        })
        .returning({
          id: apiCredentials.id,
          provider: apiCredentials.provider,
          name: apiCredentials.name,
          createdAt: apiCredentials.createdAt,
        });

      return credential;
    }),

  update: protectedProcedure
    .input(updateCredentialSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const updateValues: Record<string, unknown> = {};
      if (updates.name) updateValues.name = updates.name;
      if (updates.apiKey) updateValues.apiKey = updates.apiKey;

      if (Object.keys(updateValues).length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No fields to update" });
      }

      const [credential] = await ctx.db
        .update(apiCredentials)
        .set(updateValues)
        .where(
          and(
            eq(apiCredentials.id, id),
            eq(apiCredentials.userId, ctx.user.userId)
          )
        )
        .returning({
          id: apiCredentials.id,
          name: apiCredentials.name,
          updatedAt: apiCredentials.updatedAt,
        });

      if (!credential) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Credential not found" });
      }

      return credential;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(apiCredentials)
        .where(
          and(
            eq(apiCredentials.id, input.id),
            eq(apiCredentials.userId, ctx.user.userId)
          )
        )
        .returning({ id: apiCredentials.id });

      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Credential not found" });
      }

      return { success: true };
    }),
});
