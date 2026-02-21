import { TRPCError } from "@trpc/server";
import { eq, and, desc, count, sum } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import {
  organizationMembers,
  activities,
  notifications,
  installedModules,
  modules,
  aiUsage,
} from "../../db/schema";
import { router, authedProcedure } from "../init";

const dashboardSchema = z.object({
  organizationId: z.string().uuid(),
});

export const dashboardRouter = router({
  get: authedProcedure.input(dashboardSchema).query(async ({ ctx, input }) => {
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

    // Run all queries in parallel
    const [
      recentActivityRows,
      unreadNotifications,
      enabledModules,
      memberCount,
      usageStats,
    ] = await Promise.all([
      // Recent activity (last 10)
      db
        .select({
          id: activities.id,
          activityType: activities.activityType,
          title: activities.title,
          description: activities.description,
          occurredAt: activities.occurredAt,
        })
        .from(activities)
        .where(eq(activities.organizationId, input.organizationId))
        .orderBy(desc(activities.occurredAt))
        .limit(10),

      // Unread notifications for current user
      db
        .select({
          id: notifications.id,
          type: notifications.type,
          title: notifications.title,
          message: notifications.message,
          actionUrl: notifications.actionUrl,
          createdAt: notifications.createdAt,
        })
        .from(notifications)
        .where(
          and(
            eq(notifications.organizationId, input.organizationId),
            eq(notifications.userId, ctx.userId),
            eq(notifications.isRead, false)
          )
        )
        .orderBy(desc(notifications.createdAt))
        .limit(10),

      // Enabled installed modules
      db
        .select({
          id: installedModules.id,
          moduleId: installedModules.moduleId,
          version: installedModules.version,
          isEnabled: installedModules.isEnabled,
          moduleName: modules.name,
          moduleSlug: modules.slug,
          moduleIconUrl: modules.iconUrl,
        })
        .from(installedModules)
        .innerJoin(modules, eq(installedModules.moduleId, modules.id))
        .where(
          and(
            eq(installedModules.organizationId, input.organizationId),
            eq(installedModules.isEnabled, true)
          )
        ),

      // Member count
      db
        .select({ total: count() })
        .from(organizationMembers)
        .where(eq(organizationMembers.organizationId, input.organizationId)),

      // AI usage summary
      db
        .select({
          totalTokens: sum(aiUsage.tokensUsed),
          totalCost: sum(aiUsage.cost),
          totalRequests: count(),
        })
        .from(aiUsage)
        .where(eq(aiUsage.organizationId, input.organizationId)),
    ]);

    return {
      metrics: {
        memberCount: memberCount[0]?.total ?? 0,
        installedModuleCount: enabledModules.length,
        aiUsage: {
          totalTokens: Number(usageStats[0]?.totalTokens ?? 0),
          totalCost: Number(usageStats[0]?.totalCost ?? 0),
          totalRequests: Number(usageStats[0]?.totalRequests ?? 0),
        },
      },
      recentActivity: recentActivityRows,
      notifications: unreadNotifications,
      installedModules: enabledModules,
    };
  }),
});
