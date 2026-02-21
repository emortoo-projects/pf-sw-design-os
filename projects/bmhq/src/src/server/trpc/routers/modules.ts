import { TRPCError } from "@trpc/server";
import { eq, gt, asc, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { modules } from "../../db/schema";
import { router, authedProcedure, publicProcedure } from "../init";

const DEFAULT_PAGE_SIZE = 20;

const listSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  category: z.string().optional(),
});

const createSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string().min(1),
  version: z.string().min(1),
  category: z.string().min(1),
  iconUrl: z.string().url().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const getByIdSchema = z.object({
  moduleId: z.string().uuid(),
});

const updateSchema = z.object({
  moduleId: z.string().uuid(),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  version: z.string().min(1).optional(),
  isPublished: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

const deleteSchema = z.object({
  moduleId: z.string().uuid(),
});

export const modulesRouter = router({
  list: publicProcedure.input(listSchema).query(async ({ input }) => {
    const limit = input.limit ?? DEFAULT_PAGE_SIZE;

    const conditions = [];
    if (input.cursor) {
      conditions.push(gt(modules.id, input.cursor));
    }
    if (input.category) {
      conditions.push(eq(modules.category, input.category));
    }
    // Only show published modules in public listing
    conditions.push(eq(modules.isPublished, true));

    const rows = await db
      .select({
        id: modules.id,
        slug: modules.slug,
        name: modules.name,
        description: modules.description,
        version: modules.version,
        category: modules.category,
        iconUrl: modules.iconUrl,
        createdAt: modules.createdAt,
      })
      .from(modules)
      .where(and(...conditions))
      .orderBy(asc(modules.id))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? data[data.length - 1].id : undefined;

    return { data, nextCursor, hasMore };
  }),

  create: authedProcedure.input(createSchema).mutation(async ({ input }) => {
    const existing = await db
      .select({ id: modules.id })
      .from(modules)
      .where(eq(modules.slug, input.slug))
      .limit(1);

    if (existing.length > 0) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Module slug already taken",
      });
    }

    const [mod] = await db
      .insert(modules)
      .values({
        slug: input.slug,
        name: input.name,
        description: input.description,
        version: input.version,
        category: input.category,
        iconUrl: input.iconUrl,
        metadata: input.metadata,
      })
      .returning({
        id: modules.id,
        slug: modules.slug,
        name: modules.name,
      });

    return mod;
  }),

  getById: publicProcedure.input(getByIdSchema).query(async ({ input }) => {
    const [mod] = await db
      .select({
        id: modules.id,
        slug: modules.slug,
        name: modules.name,
        description: modules.description,
        version: modules.version,
        category: modules.category,
        iconUrl: modules.iconUrl,
        isPublished: modules.isPublished,
        metadata: modules.metadata,
        createdAt: modules.createdAt,
        updatedAt: modules.updatedAt,
      })
      .from(modules)
      .where(eq(modules.id, input.moduleId))
      .limit(1);

    if (!mod) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Module not found",
      });
    }

    return mod;
  }),

  update: authedProcedure
    .input(updateSchema)
    .mutation(async ({ input }) => {
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (input.name !== undefined) updates.name = input.name;
      if (input.description !== undefined) updates.description = input.description;
      if (input.version !== undefined) updates.version = input.version;
      if (input.isPublished !== undefined) updates.isPublished = input.isPublished;
      if (input.metadata !== undefined) updates.metadata = input.metadata;

      const [mod] = await db
        .update(modules)
        .set(updates)
        .where(eq(modules.id, input.moduleId))
        .returning({
          id: modules.id,
          name: modules.name,
          version: modules.version,
        });

      if (!mod) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Module not found",
        });
      }

      return mod;
    }),

  delete: authedProcedure
    .input(deleteSchema)
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

      await db.delete(modules).where(eq(modules.id, input.moduleId));

      return { success: true };
    }),
});
