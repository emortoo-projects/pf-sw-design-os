import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import {
  aiConfigurations,
  aiProviders,
  organizationMembers,
} from "../../db/schema";
import { router, authedProcedure } from "../init";

const listSchema = z.object({
  organizationId: z.string().uuid(),
});

const createSchema = z.object({
  organizationId: z.string().uuid(),
  providerId: z.string().uuid(),
  apiKey: z.string().min(1),
  defaultModel: z.string().optional(),
  usageLimit: z.record(z.string(), z.unknown()).optional(),
  additionalConfig: z.record(z.string(), z.unknown()).optional(),
});

const getByIdSchema = z.object({
  organizationId: z.string().uuid(),
  configurationId: z.string().uuid(),
});

const updateSchema = z.object({
  organizationId: z.string().uuid(),
  configurationId: z.string().uuid(),
  apiKey: z.string().min(1).optional(),
  defaultModel: z.string().nullable().optional(),
  isEnabled: z.boolean().optional(),
  usageLimit: z.record(z.string(), z.unknown()).nullable().optional(),
});

const deleteSchema = z.object({
  organizationId: z.string().uuid(),
  configurationId: z.string().uuid(),
});

async function requireOrgAdmin(organizationId: string, userId: string) {
  const [membership] = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, userId)
      )
    )
    .limit(1);

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only owners and admins can manage AI configurations",
    });
  }

  return membership;
}

export const aiConfigurationsRouter = router({
  list: authedProcedure.input(listSchema).query(async ({ ctx, input }) => {
    await requireOrgAdmin(input.organizationId, ctx.userId);

    const rows = await db
      .select({
        id: aiConfigurations.id,
        organizationId: aiConfigurations.organizationId,
        providerId: aiConfigurations.providerId,
        defaultModel: aiConfigurations.defaultModel,
        isEnabled: aiConfigurations.isEnabled,
        usageLimit: aiConfigurations.usageLimit,
        providerName: aiProviders.name,
        providerSlug: aiProviders.slug,
      })
      .from(aiConfigurations)
      .innerJoin(aiProviders, eq(aiConfigurations.providerId, aiProviders.id))
      .where(eq(aiConfigurations.organizationId, input.organizationId));

    return { data: rows };
  }),

  create: authedProcedure
    .input(createSchema)
    .mutation(async ({ ctx, input }) => {
      await requireOrgAdmin(input.organizationId, ctx.userId);

      // Check for existing config for this provider
      const [existing] = await db
        .select()
        .from(aiConfigurations)
        .where(
          and(
            eq(aiConfigurations.organizationId, input.organizationId),
            eq(aiConfigurations.providerId, input.providerId)
          )
        )
        .limit(1);

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Configuration for this provider already exists",
        });
      }

      const [config] = await db
        .insert(aiConfigurations)
        .values({
          organizationId: input.organizationId,
          providerId: input.providerId,
          apiKey: input.apiKey,
          defaultModel: input.defaultModel,
          usageLimit: input.usageLimit,
          additionalConfig: input.additionalConfig,
        })
        .returning({
          id: aiConfigurations.id,
          providerId: aiConfigurations.providerId,
          isEnabled: aiConfigurations.isEnabled,
        });

      return config;
    }),

  getById: authedProcedure
    .input(getByIdSchema)
    .query(async ({ ctx, input }) => {
      await requireOrgAdmin(input.organizationId, ctx.userId);

      const [config] = await db
        .select({
          id: aiConfigurations.id,
          providerId: aiConfigurations.providerId,
          defaultModel: aiConfigurations.defaultModel,
          isEnabled: aiConfigurations.isEnabled,
          usageLimit: aiConfigurations.usageLimit,
          additionalConfig: aiConfigurations.additionalConfig,
          createdAt: aiConfigurations.createdAt,
          providerName: aiProviders.name,
        })
        .from(aiConfigurations)
        .innerJoin(aiProviders, eq(aiConfigurations.providerId, aiProviders.id))
        .where(
          and(
            eq(aiConfigurations.id, input.configurationId),
            eq(aiConfigurations.organizationId, input.organizationId)
          )
        )
        .limit(1);

      if (!config) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "AI configuration not found",
        });
      }

      return config;
    }),

  update: authedProcedure
    .input(updateSchema)
    .mutation(async ({ ctx, input }) => {
      await requireOrgAdmin(input.organizationId, ctx.userId);

      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (input.apiKey !== undefined) updates.apiKey = input.apiKey;
      if (input.defaultModel !== undefined)
        updates.defaultModel = input.defaultModel;
      if (input.isEnabled !== undefined) updates.isEnabled = input.isEnabled;
      if (input.usageLimit !== undefined) updates.usageLimit = input.usageLimit;

      const [config] = await db
        .update(aiConfigurations)
        .set(updates)
        .where(
          and(
            eq(aiConfigurations.id, input.configurationId),
            eq(aiConfigurations.organizationId, input.organizationId)
          )
        )
        .returning({
          id: aiConfigurations.id,
          isEnabled: aiConfigurations.isEnabled,
        });

      if (!config) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "AI configuration not found",
        });
      }

      return config;
    }),

  delete: authedProcedure
    .input(deleteSchema)
    .mutation(async ({ ctx, input }) => {
      await requireOrgAdmin(input.organizationId, ctx.userId);

      const [config] = await db
        .select({ id: aiConfigurations.id })
        .from(aiConfigurations)
        .where(
          and(
            eq(aiConfigurations.id, input.configurationId),
            eq(aiConfigurations.organizationId, input.organizationId)
          )
        )
        .limit(1);

      if (!config) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "AI configuration not found",
        });
      }

      await db
        .delete(aiConfigurations)
        .where(eq(aiConfigurations.id, input.configurationId));

      return { success: true };
    }),
});
