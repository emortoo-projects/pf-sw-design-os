import { TRPCError } from "@trpc/server";
import { eq, gt, and, asc } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { organizations, organizationMembers } from "../../db/schema";
import { router, authedProcedure } from "../init";

const DEFAULT_PAGE_SIZE = 20;

const listSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const createSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  logoUrl: z.string().url().optional(),
});

const getByIdSchema = z.object({
  organizationId: z.string().uuid(),
});

const updateSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(1).optional(),
  logoUrl: z.string().url().nullable().optional(),
  settings: z.record(z.string(), z.unknown()).nullable().optional(),
});

const deleteSchema = z.object({
  organizationId: z.string().uuid(),
});

export const organizationsRouter = router({
  list: authedProcedure.input(listSchema).query(async ({ ctx, input }) => {
    const limit = input.limit ?? DEFAULT_PAGE_SIZE;

    const conditions = [
      eq(organizationMembers.userId, ctx.userId),
    ];
    if (input.cursor) {
      conditions.push(gt(organizations.id, input.cursor));
    }

    const rows = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
        ownerId: organizations.ownerId,
        logoUrl: organizations.logoUrl,
        createdAt: organizations.createdAt,
      })
      .from(organizations)
      .innerJoin(
        organizationMembers,
        eq(organizations.id, organizationMembers.organizationId)
      )
      .where(and(...conditions))
      .orderBy(asc(organizations.id))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? data[data.length - 1].id : undefined;

    return { data, nextCursor, hasMore };
  }),

  create: authedProcedure.input(createSchema).mutation(async ({ ctx, input }) => {
    const existing = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, input.slug))
      .limit(1);

    if (existing.length > 0) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Organization slug already taken",
      });
    }

    const [org] = await db
      .insert(organizations)
      .values({
        name: input.name,
        slug: input.slug,
        ownerId: ctx.userId,
        logoUrl: input.logoUrl,
      })
      .returning();

    // Add creator as owner member
    await db.insert(organizationMembers).values({
      organizationId: org.id,
      userId: ctx.userId,
      role: "owner",
    });

    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      ownerId: org.ownerId,
    };
  }),

  getById: authedProcedure.input(getByIdSchema).query(async ({ ctx, input }) => {
    // Verify membership
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, input.organizationId),
          eq(organizationMembers.userId, ctx.userId)
        )
      )
      .limit(1);

    if (!membership) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found",
      });
    }

    const [org] = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
        ownerId: organizations.ownerId,
        logoUrl: organizations.logoUrl,
        settings: organizations.settings,
        createdAt: organizations.createdAt,
        updatedAt: organizations.updatedAt,
      })
      .from(organizations)
      .where(eq(organizations.id, input.organizationId))
      .limit(1);

    if (!org) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found",
      });
    }

    return org;
  }),

  update: authedProcedure.input(updateSchema).mutation(async ({ ctx, input }) => {
    // Verify owner/admin
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, input.organizationId),
          eq(organizationMembers.userId, ctx.userId)
        )
      )
      .limit(1);

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only owners and admins can update organizations",
      });
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (input.name !== undefined) updates.name = input.name;
    if (input.logoUrl !== undefined) updates.logoUrl = input.logoUrl;
    if (input.settings !== undefined) updates.settings = input.settings;

    const [org] = await db
      .update(organizations)
      .set(updates)
      .where(eq(organizations.id, input.organizationId))
      .returning({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
      });

    if (!org) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found",
      });
    }

    return org;
  }),

  delete: authedProcedure.input(deleteSchema).mutation(async ({ ctx, input }) => {
    const [org] = await db
      .select({ ownerId: organizations.ownerId })
      .from(organizations)
      .where(eq(organizations.id, input.organizationId))
      .limit(1);

    if (!org) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found",
      });
    }

    if (org.ownerId !== ctx.userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only the owner can delete an organization",
      });
    }

    // Delete members first, then org
    await db
      .delete(organizationMembers)
      .where(eq(organizationMembers.organizationId, input.organizationId));

    await db
      .delete(organizations)
      .where(eq(organizations.id, input.organizationId));

    return { success: true };
  }),
});
