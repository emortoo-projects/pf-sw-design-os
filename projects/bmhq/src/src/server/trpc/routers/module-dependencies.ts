import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { moduleDependencies, modules } from "../../db/schema";
import { router, authedProcedure, publicProcedure } from "../init";

const listSchema = z.object({
  moduleId: z.string().uuid(),
});

const createSchema = z.object({
  moduleId: z.string().uuid(),
  dependsOnModuleId: z.string().uuid(),
  minVersion: z.string().optional(),
  isOptional: z.boolean().optional(),
});

const deleteSchema = z.object({
  moduleId: z.string().uuid(),
  dependencyId: z.string().uuid(),
});

export const moduleDependenciesRouter = router({
  list: publicProcedure.input(listSchema).query(async ({ input }) => {
    const rows = await db
      .select({
        id: moduleDependencies.id,
        moduleId: moduleDependencies.moduleId,
        dependsOnModuleId: moduleDependencies.dependsOnModuleId,
        minVersion: moduleDependencies.minVersion,
        isOptional: moduleDependencies.isOptional,
        dependsOnName: modules.name,
        dependsOnSlug: modules.slug,
      })
      .from(moduleDependencies)
      .innerJoin(modules, eq(moduleDependencies.dependsOnModuleId, modules.id))
      .where(eq(moduleDependencies.moduleId, input.moduleId));

    return { data: rows };
  }),

  create: authedProcedure.input(createSchema).mutation(async ({ input }) => {
    if (input.moduleId === input.dependsOnModuleId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "A module cannot depend on itself",
      });
    }

    // Verify both modules exist
    const [mod] = await db
      .select({ id: modules.id })
      .from(modules)
      .where(eq(modules.id, input.moduleId))
      .limit(1);

    if (!mod) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Module not found",
      });
    }

    const [depMod] = await db
      .select({ id: modules.id })
      .from(modules)
      .where(eq(modules.id, input.dependsOnModuleId))
      .limit(1);

    if (!depMod) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Dependency module not found",
      });
    }

    // Check for existing dependency
    const [existing] = await db
      .select()
      .from(moduleDependencies)
      .where(
        and(
          eq(moduleDependencies.moduleId, input.moduleId),
          eq(moduleDependencies.dependsOnModuleId, input.dependsOnModuleId)
        )
      )
      .limit(1);

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Dependency already exists",
      });
    }

    const [dep] = await db
      .insert(moduleDependencies)
      .values({
        moduleId: input.moduleId,
        dependsOnModuleId: input.dependsOnModuleId,
        minVersion: input.minVersion,
        isOptional: input.isOptional,
      })
      .returning({
        id: moduleDependencies.id,
        moduleId: moduleDependencies.moduleId,
        dependsOnModuleId: moduleDependencies.dependsOnModuleId,
      });

    return dep;
  }),

  delete: authedProcedure.input(deleteSchema).mutation(async ({ input }) => {
    const [dep] = await db
      .select()
      .from(moduleDependencies)
      .where(
        and(
          eq(moduleDependencies.id, input.dependencyId),
          eq(moduleDependencies.moduleId, input.moduleId)
        )
      )
      .limit(1);

    if (!dep) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Dependency not found",
      });
    }

    await db
      .delete(moduleDependencies)
      .where(eq(moduleDependencies.id, input.dependencyId));

    return { success: true };
  }),
});
