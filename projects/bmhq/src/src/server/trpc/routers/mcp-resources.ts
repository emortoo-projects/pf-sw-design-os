import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { mcpResources, modules } from "../../db/schema";
import { router, authedProcedure } from "../init";

const listSchema = z.object({
  moduleId: z.string().uuid().optional(),
});

const createSchema = z.object({
  moduleId: z.string().uuid(),
  resourceType: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  uri: z.string().min(1),
  schema: z.record(z.string(), z.unknown()).optional(),
  accessControl: z.record(z.string(), z.unknown()).optional(),
});

const getByIdSchema = z.object({
  resourceId: z.string().uuid(),
});

const deleteSchema = z.object({
  resourceId: z.string().uuid(),
});

export const mcpResourcesRouter = router({
  list: authedProcedure.input(listSchema).query(async ({ input }) => {
    const conditions = input.moduleId
      ? [eq(mcpResources.moduleId, input.moduleId)]
      : [];

    const rows = await db
      .select({
        id: mcpResources.id,
        moduleId: mcpResources.moduleId,
        resourceType: mcpResources.resourceType,
        name: mcpResources.name,
        description: mcpResources.description,
        uri: mcpResources.uri,
        schema: mcpResources.schema,
        isActive: mcpResources.isActive,
        accessControl: mcpResources.accessControl,
        createdAt: mcpResources.createdAt,
        moduleName: modules.name,
      })
      .from(mcpResources)
      .innerJoin(modules, eq(mcpResources.moduleId, modules.id))
      .where(conditions.length > 0 ? conditions[0] : undefined);

    return { data: rows };
  }),

  create: authedProcedure
    .input(createSchema)
    .mutation(async ({ input }) => {
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

      const [resource] = await db
        .insert(mcpResources)
        .values({
          moduleId: input.moduleId,
          resourceType: input.resourceType,
          name: input.name,
          description: input.description,
          uri: input.uri,
          schema: input.schema,
          accessControl: input.accessControl,
        })
        .returning({
          id: mcpResources.id,
          name: mcpResources.name,
          uri: mcpResources.uri,
        });

      return resource;
    }),

  getById: authedProcedure
    .input(getByIdSchema)
    .query(async ({ input }) => {
      const [resource] = await db
        .select({
          id: mcpResources.id,
          moduleId: mcpResources.moduleId,
          resourceType: mcpResources.resourceType,
          name: mcpResources.name,
          description: mcpResources.description,
          uri: mcpResources.uri,
          schema: mcpResources.schema,
          isActive: mcpResources.isActive,
          accessControl: mcpResources.accessControl,
          createdAt: mcpResources.createdAt,
          moduleName: modules.name,
        })
        .from(mcpResources)
        .innerJoin(modules, eq(mcpResources.moduleId, modules.id))
        .where(eq(mcpResources.id, input.resourceId))
        .limit(1);

      if (!resource) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "MCP resource not found",
        });
      }

      return resource;
    }),

  delete: authedProcedure
    .input(deleteSchema)
    .mutation(async ({ input }) => {
      const [resource] = await db
        .select({ id: mcpResources.id })
        .from(mcpResources)
        .where(eq(mcpResources.id, input.resourceId))
        .limit(1);

      if (!resource) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "MCP resource not found",
        });
      }

      await db.delete(mcpResources).where(eq(mcpResources.id, input.resourceId));

      return { success: true };
    }),
});
