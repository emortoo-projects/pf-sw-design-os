import { TRPCError } from "@trpc/server";
import { eq, and, gt, asc } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { organizationMembers, users } from "../../db/schema";
import { router, authedProcedure } from "../init";

const DEFAULT_PAGE_SIZE = 20;

const roleEnum = z.enum(["owner", "admin", "member", "viewer"]);

const listSchema = z.object({
  organizationId: z.string().uuid(),
  cursor: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const addSchema = z.object({
  organizationId: z.string().uuid(),
  userId: z.string().uuid(),
  role: roleEnum,
});

const updateSchema = z.object({
  organizationId: z.string().uuid(),
  memberId: z.string().uuid(),
  role: roleEnum,
});

const removeSchema = z.object({
  organizationId: z.string().uuid(),
  memberId: z.string().uuid(),
});

async function requireAdminOrOwner(organizationId: string, userId: string) {
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
      message: "Only owners and admins can manage members",
    });
  }

  return membership;
}

export const organizationMembersRouter = router({
  list: authedProcedure.input(listSchema).query(async ({ ctx, input }) => {
    // Verify caller is a member
    const [callerMembership] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, input.organizationId),
          eq(organizationMembers.userId, ctx.userId)
        )
      )
      .limit(1);

    if (!callerMembership) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found",
      });
    }

    const limit = input.limit ?? DEFAULT_PAGE_SIZE;

    const conditions = [
      eq(organizationMembers.organizationId, input.organizationId),
    ];
    if (input.cursor) {
      conditions.push(gt(organizationMembers.id, input.cursor));
    }

    const rows = await db
      .select({
        id: organizationMembers.id,
        organizationId: organizationMembers.organizationId,
        userId: organizationMembers.userId,
        role: organizationMembers.role,
        joinedAt: organizationMembers.joinedAt,
        userName: users.name,
        userEmail: users.email,
        userAvatarUrl: users.avatarUrl,
      })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .where(and(...conditions))
      .orderBy(asc(organizationMembers.id))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? data[data.length - 1].id : undefined;

    return { data, nextCursor, hasMore };
  }),

  add: authedProcedure.input(addSchema).mutation(async ({ ctx, input }) => {
    await requireAdminOrOwner(input.organizationId, ctx.userId);

    // Check if user already a member
    const [existing] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, input.organizationId),
          eq(organizationMembers.userId, input.userId)
        )
      )
      .limit(1);

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "User is already a member of this organization",
      });
    }

    const [member] = await db
      .insert(organizationMembers)
      .values({
        organizationId: input.organizationId,
        userId: input.userId,
        role: input.role,
        invitedBy: ctx.userId,
      })
      .returning({
        id: organizationMembers.id,
        organizationId: organizationMembers.organizationId,
        userId: organizationMembers.userId,
        role: organizationMembers.role,
      });

    return member;
  }),

  updateRole: authedProcedure
    .input(updateSchema)
    .mutation(async ({ ctx, input }) => {
      await requireAdminOrOwner(input.organizationId, ctx.userId);

      const [member] = await db
        .update(organizationMembers)
        .set({ role: input.role, updatedAt: new Date() })
        .where(
          and(
            eq(organizationMembers.id, input.memberId),
            eq(organizationMembers.organizationId, input.organizationId)
          )
        )
        .returning({
          id: organizationMembers.id,
          role: organizationMembers.role,
        });

      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      return member;
    }),

  remove: authedProcedure
    .input(removeSchema)
    .mutation(async ({ ctx, input }) => {
      await requireAdminOrOwner(input.organizationId, ctx.userId);

      const [member] = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.id, input.memberId),
            eq(organizationMembers.organizationId, input.organizationId)
          )
        )
        .limit(1);

      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      if (member.role === "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot remove the organization owner",
        });
      }

      await db
        .delete(organizationMembers)
        .where(eq(organizationMembers.id, input.memberId));

      return { success: true };
    }),
});
