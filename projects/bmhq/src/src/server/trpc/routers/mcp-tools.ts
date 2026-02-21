import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { mcpTools, modules } from "../../db/schema";
import { router, authedProcedure } from "../init";

const listSchema = z.object({
  moduleId: z.string().uuid().optional(),
});

const createSchema = z.object({
  moduleId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().min(1),
  inputSchema: z.record(z.string(), z.unknown()),
  outputSchema: z.record(z.string(), z.unknown()).optional(),
  endpoint: z.string().min(1),
  requiresAuth: z.boolean().optional(),
});

const getByIdSchema = z.object({
  toolId: z.string().uuid(),
});

const updateSchema = z.object({
  toolId: z.string().uuid(),
  description: z.string().min(1).optional(),
  inputSchema: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional(),
});

const deleteSchema = z.object({
  toolId: z.string().uuid(),
});

export const mcpToolsRouter = router({
  list: authedProcedure.input(listSchema).query(async ({ input }) => {
    const conditions = input.moduleId
      ? [eq(mcpTools.moduleId, input.moduleId)]
      : [];

    const rows = await db
      .select({
        id: mcpTools.id,
        moduleId: mcpTools.moduleId,
        name: mcpTools.name,
        description: mcpTools.description,
        inputSchema: mcpTools.inputSchema,
        outputSchema: mcpTools.outputSchema,
        endpoint: mcpTools.endpoint,
        isActive: mcpTools.isActive,
        requiresAuth: mcpTools.requiresAuth,
        createdAt: mcpTools.createdAt,
        moduleName: modules.name,
      })
      .from(mcpTools)
      .innerJoin(modules, eq(mcpTools.moduleId, modules.id))
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

      const [tool] = await db
        .insert(mcpTools)
        .values({
          moduleId: input.moduleId,
          name: input.name,
          description: input.description,
          inputSchema: input.inputSchema,
          outputSchema: input.outputSchema,
          endpoint: input.endpoint,
          requiresAuth: input.requiresAuth,
        })
        .returning({
          id: mcpTools.id,
          name: mcpTools.name,
        });

      return tool;
    }),

  getById: authedProcedure
    .input(getByIdSchema)
    .query(async ({ input }) => {
      const [tool] = await db
        .select({
          id: mcpTools.id,
          moduleId: mcpTools.moduleId,
          name: mcpTools.name,
          description: mcpTools.description,
          inputSchema: mcpTools.inputSchema,
          outputSchema: mcpTools.outputSchema,
          endpoint: mcpTools.endpoint,
          isActive: mcpTools.isActive,
          requiresAuth: mcpTools.requiresAuth,
          createdAt: mcpTools.createdAt,
          moduleName: modules.name,
        })
        .from(mcpTools)
        .innerJoin(modules, eq(mcpTools.moduleId, modules.id))
        .where(eq(mcpTools.id, input.toolId))
        .limit(1);

      if (!tool) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "MCP tool not found",
        });
      }

      return tool;
    }),

  update: authedProcedure
    .input(updateSchema)
    .mutation(async ({ input }) => {
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (input.description !== undefined) updates.description = input.description;
      if (input.inputSchema !== undefined) updates.inputSchema = input.inputSchema;
      if (input.isActive !== undefined) updates.isActive = input.isActive;

      const [tool] = await db
        .update(mcpTools)
        .set(updates)
        .where(eq(mcpTools.id, input.toolId))
        .returning({
          id: mcpTools.id,
          isActive: mcpTools.isActive,
        });

      if (!tool) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "MCP tool not found",
        });
      }

      return tool;
    }),

  delete: authedProcedure
    .input(deleteSchema)
    .mutation(async ({ input }) => {
      const [tool] = await db
        .select({ id: mcpTools.id })
        .from(mcpTools)
        .where(eq(mcpTools.id, input.toolId))
        .limit(1);

      if (!tool) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "MCP tool not found",
        });
      }

      await db.delete(mcpTools).where(eq(mcpTools.id, input.toolId));

      return { success: true };
    }),
});
