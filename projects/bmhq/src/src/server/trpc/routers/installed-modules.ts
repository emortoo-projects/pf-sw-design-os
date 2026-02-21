import { TRPCError } from "@trpc/server";
import { eq, and, gt, asc } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import {
  installedModules,
  modules,
  organizationMembers,
} from "../../db/schema";
import { router, authedProcedure } from "../init";

const DEFAULT_PAGE_SIZE = 20;

const listSchema = z.object({
  organizationId: z.string().uuid(),
  cursor: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const installSchema = z.object({
  organizationId: z.string().uuid(),
  moduleId: z.string().uuid(),
  version: z.string().optional(),
  configuration: z.record(z.string(), z.unknown()).optional(),
});

const getByIdSchema = z.object({
  organizationId: z.string().uuid(),
  installedModuleId: z.string().uuid(),
});

const updateSchema = z.object({
  organizationId: z.string().uuid(),
  installedModuleId: z.string().uuid(),
  isEnabled: z.boolean().optional(),
  configuration: z.record(z.string(), z.unknown()).nullable().optional(),
});

const deleteSchema = z.object({
  organizationId: z.string().uuid(),
  installedModuleId: z.string().uuid(),
});

async function requireOrgMember(organizationId: string, userId: string) {
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

  if (!membership) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Organization not found",
    });
  }

  return membership;
}

export const installedModulesRouter = router({
  list: authedProcedure.input(listSchema).query(async ({ ctx, input }) => {
    await requireOrgMember(input.organizationId, ctx.userId);

    const limit = input.limit ?? DEFAULT_PAGE_SIZE;
    const conditions = [
      eq(installedModules.organizationId, input.organizationId),
    ];
    if (input.cursor) {
      conditions.push(gt(installedModules.id, input.cursor));
    }

    const rows = await db
      .select({
        id: installedModules.id,
        organizationId: installedModules.organizationId,
        moduleId: installedModules.moduleId,
        version: installedModules.version,
        isEnabled: installedModules.isEnabled,
        installedAt: installedModules.installedAt,
        moduleName: modules.name,
        moduleSlug: modules.slug,
      })
      .from(installedModules)
      .innerJoin(modules, eq(installedModules.moduleId, modules.id))
      .where(and(...conditions))
      .orderBy(asc(installedModules.id))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? data[data.length - 1].id : undefined;

    return { data, nextCursor, hasMore };
  }),

  install: authedProcedure
    .input(installSchema)
    .mutation(async ({ ctx, input }) => {
      const membership = await requireOrgMember(
        input.organizationId,
        ctx.userId
      );
      if (!["owner", "admin"].includes(membership.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only owners and admins can install modules",
        });
      }

      // Get module to verify it exists and get version
      const [mod] = await db
        .select({ id: modules.id, version: modules.version })
        .from(modules)
        .where(eq(modules.id, input.moduleId))
        .limit(1);

      if (!mod) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Module not found",
        });
      }

      // Check if already installed
      const [existing] = await db
        .select()
        .from(installedModules)
        .where(
          and(
            eq(installedModules.organizationId, input.organizationId),
            eq(installedModules.moduleId, input.moduleId)
          )
        )
        .limit(1);

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Module is already installed",
        });
      }

      const [installed] = await db
        .insert(installedModules)
        .values({
          organizationId: input.organizationId,
          moduleId: input.moduleId,
          version: input.version ?? mod.version,
          installedBy: ctx.userId,
          configuration: input.configuration,
        })
        .returning({
          id: installedModules.id,
          organizationId: installedModules.organizationId,
          moduleId: installedModules.moduleId,
          version: installedModules.version,
          isEnabled: installedModules.isEnabled,
        });

      return installed;
    }),

  getById: authedProcedure
    .input(getByIdSchema)
    .query(async ({ ctx, input }) => {
      await requireOrgMember(input.organizationId, ctx.userId);

      const [installed] = await db
        .select({
          id: installedModules.id,
          moduleId: installedModules.moduleId,
          version: installedModules.version,
          isEnabled: installedModules.isEnabled,
          configuration: installedModules.configuration,
          installedAt: installedModules.installedAt,
          moduleName: modules.name,
          moduleSlug: modules.slug,
        })
        .from(installedModules)
        .innerJoin(modules, eq(installedModules.moduleId, modules.id))
        .where(
          and(
            eq(installedModules.id, input.installedModuleId),
            eq(installedModules.organizationId, input.organizationId)
          )
        )
        .limit(1);

      if (!installed) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Installed module not found",
        });
      }

      return installed;
    }),

  update: authedProcedure
    .input(updateSchema)
    .mutation(async ({ ctx, input }) => {
      const membership = await requireOrgMember(
        input.organizationId,
        ctx.userId
      );
      if (!["owner", "admin"].includes(membership.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only owners and admins can update installed modules",
        });
      }

      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (input.isEnabled !== undefined) updates.isEnabled = input.isEnabled;
      if (input.configuration !== undefined)
        updates.configuration = input.configuration;

      const [installed] = await db
        .update(installedModules)
        .set(updates)
        .where(
          and(
            eq(installedModules.id, input.installedModuleId),
            eq(installedModules.organizationId, input.organizationId)
          )
        )
        .returning({
          id: installedModules.id,
          isEnabled: installedModules.isEnabled,
          configuration: installedModules.configuration,
        });

      if (!installed) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Installed module not found",
        });
      }

      return installed;
    }),

  uninstall: authedProcedure
    .input(deleteSchema)
    .mutation(async ({ ctx, input }) => {
      const membership = await requireOrgMember(
        input.organizationId,
        ctx.userId
      );
      if (!["owner", "admin"].includes(membership.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only owners and admins can uninstall modules",
        });
      }

      const [installed] = await db
        .select({ id: installedModules.id })
        .from(installedModules)
        .where(
          and(
            eq(installedModules.id, input.installedModuleId),
            eq(installedModules.organizationId, input.organizationId)
          )
        )
        .limit(1);

      if (!installed) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Installed module not found",
        });
      }

      await db
        .delete(installedModules)
        .where(eq(installedModules.id, input.installedModuleId));

      return { success: true };
    }),
});
