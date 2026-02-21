import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import {
  subscriptions,
  billingPlans,
  organizationMembers,
} from "../../db/schema";
import { router, authedProcedure } from "../init";

const orgSchema = z.object({
  organizationId: z.string().uuid(),
});

const createSchema = z.object({
  organizationId: z.string().uuid(),
  planId: z.string().uuid(),
  billingInterval: z.enum(["monthly", "yearly"]),
  paymentMethodId: z.string().optional(),
});

const updateSchema = z.object({
  organizationId: z.string().uuid(),
  planId: z.string().uuid().optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
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
      message: "Only owners and admins can manage subscriptions",
    });
  }

  return membership;
}

export const subscriptionsRouter = router({
  get: authedProcedure.input(orgSchema).query(async ({ ctx, input }) => {
    await requireOrgAdmin(input.organizationId, ctx.userId);

    const [sub] = await db
      .select({
        id: subscriptions.id,
        planId: subscriptions.planId,
        status: subscriptions.status,
        billingInterval: subscriptions.billingInterval,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
        trialEnd: subscriptions.trialEnd,
        planName: billingPlans.name,
        planSlug: billingPlans.slug,
      })
      .from(subscriptions)
      .innerJoin(billingPlans, eq(subscriptions.planId, billingPlans.id))
      .where(eq(subscriptions.organizationId, input.organizationId))
      .limit(1);

    if (!sub) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No active subscription found",
      });
    }

    return sub;
  }),

  create: authedProcedure
    .input(createSchema)
    .mutation(async ({ ctx, input }) => {
      await requireOrgAdmin(input.organizationId, ctx.userId);

      // Check no existing subscription
      const [existing] = await db
        .select({ id: subscriptions.id })
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.organizationId, input.organizationId),
            eq(subscriptions.status, "active")
          )
        )
        .limit(1);

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Organization already has an active subscription",
        });
      }

      // Verify plan exists
      const [plan] = await db
        .select({ id: billingPlans.id })
        .from(billingPlans)
        .where(eq(billingPlans.id, input.planId))
        .limit(1);

      if (!plan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Billing plan not found",
        });
      }

      const now = new Date();
      const periodEnd = new Date(now);
      if (input.billingInterval === "monthly") {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }

      const [sub] = await db
        .insert(subscriptions)
        .values({
          organizationId: input.organizationId,
          planId: input.planId,
          status: "active",
          billingInterval: input.billingInterval,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        })
        .returning({
          id: subscriptions.id,
          status: subscriptions.status,
        });

      return sub;
    }),

  update: authedProcedure
    .input(updateSchema)
    .mutation(async ({ ctx, input }) => {
      await requireOrgAdmin(input.organizationId, ctx.userId);

      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (input.planId !== undefined) updates.planId = input.planId;
      if (input.cancelAtPeriodEnd !== undefined)
        updates.cancelAtPeriodEnd = input.cancelAtPeriodEnd;

      const [sub] = await db
        .update(subscriptions)
        .set(updates)
        .where(eq(subscriptions.organizationId, input.organizationId))
        .returning({
          id: subscriptions.id,
          status: subscriptions.status,
        });

      if (!sub) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      return sub;
    }),

  cancel: authedProcedure
    .input(orgSchema)
    .mutation(async ({ ctx, input }) => {
      await requireOrgAdmin(input.organizationId, ctx.userId);

      const [sub] = await db
        .update(subscriptions)
        .set({ status: "canceled", updatedAt: new Date() })
        .where(eq(subscriptions.organizationId, input.organizationId))
        .returning({ id: subscriptions.id });

      if (!sub) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      return { success: true };
    }),
});
