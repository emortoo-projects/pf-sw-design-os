import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { permissions, modules } from "../../db/schema";
import { router, authedProcedure } from "../init";

const listSchema = z.object({
  role: z.enum(["owner", "admin", "member", "viewer"]).optional(),
  moduleId: z.string().uuid().optional(),
});

const createSchema = z.object({
  role: z.enum(["owner", "admin", "member", "viewer"]),
  moduleId: z.string().uuid().optional(),
  resource: z.string().min(1),
  action: z.enum(["read", "write", "delete", "execute"]),
  conditions: z.record(z.string(), z.unknown()).optional(),
});

const deleteSchema = z.object({
  permissionId: z.string().uuid(),
});

export const permissionsRouter = router({
  list: authedProcedure.input(listSchema).query(async ({ input }) => {
    const conditions = [];
    if (input.role) {
      conditions.push(eq(permissions.role, input.role));
    }
    if (input.moduleId) {
      conditions.push(eq(permissions.moduleId, input.moduleId));
    }

    const rows = await db
      .select({
        id: permissions.id,
        role: permissions.role,
        moduleId: permissions.moduleId,
        resource: permissions.resource,
        action: permissions.action,
        conditions: permissions.conditions,
        createdAt: permissions.createdAt,
        moduleName: modules.name,
      })
      .from(permissions)
      .leftJoin(modules, eq(permissions.moduleId, modules.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return { data: rows };
  }),

  create: authedProcedure
    .input(createSchema)
    .mutation(async ({ input }) => {
      // Check for duplicate (unique constraint: role + moduleId + resource + action)
      const existingConditions = [
        eq(permissions.role, input.role),
        eq(permissions.resource, input.resource),
        eq(permissions.action, input.action),
      ];

      const [existing] = await db
        .select({ id: permissions.id })
        .from(permissions)
        .where(and(...existingConditions))
        .limit(1);

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Permission already exists for this role/resource/action combination",
        });
      }

      const [permission] = await db
        .insert(permissions)
        .values({
          role: input.role,
          moduleId: input.moduleId,
          resource: input.resource,
          action: input.action,
          conditions: input.conditions,
        })
        .returning({
          id: permissions.id,
          role: permissions.role,
          resource: permissions.resource,
          action: permissions.action,
        });

      return permission;
    }),

  delete: authedProcedure
    .input(deleteSchema)
    .mutation(async ({ input }) => {
      const [permission] = await db
        .select({ id: permissions.id })
        .from(permissions)
        .where(eq(permissions.id, input.permissionId))
        .limit(1);

      if (!permission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Permission not found",
        });
      }

      await db
        .delete(permissions)
        .where(eq(permissions.id, input.permissionId));

      return { success: true };
    }),
});
