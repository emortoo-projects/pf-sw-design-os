import { z } from "zod";
import { eq, desc, sql, gte } from "drizzle-orm";
import { router, protectedProcedure } from "../trpc";
import { activities, agents, jobs, costRecords, alerts, budgets } from "@/server/db/schema";

export const dashboardRouter = router({
  overview: protectedProcedure
    .input(z.object({
      period: z.enum(["day", "week", "month"]).default("week"),
    }).optional())
    .query(async ({ ctx, input }) => {
      const period = input?.period ?? "week";
      const now = new Date();
      const periodStart = new Date(now);

      if (period === "day") periodStart.setDate(now.getDate() - 1);
      else if (period === "week") periodStart.setDate(now.getDate() - 7);
      else periodStart.setMonth(now.getMonth() - 1);

      const [
        totalActivitiesResult,
        costSummary,
        activeAgentsResult,
        runningJobsResult,
        failedActivitiesResult,
        unreadAlertsResult,
        budgetStatusResult,
        recentActivitiesData,
        costTrendData,
      ] = await Promise.all([
        ctx.db.select({ count: sql<number>`count(*)` }).from(activities),
        ctx.db
          .select({
            totalCost: sql<string>`coalesce(sum(${costRecords.totalCost}), '0')`,
            totalTokens: sql<number>`coalesce(sum(${costRecords.totalTokens}), 0)`,
          })
          .from(costRecords),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(agents)
          .where(eq(agents.status, "active")),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(jobs)
          .where(eq(jobs.status, "running")),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(activities)
          .where(eq(activities.status, "failed")),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(alerts)
          .where(eq(alerts.status, "unread")),
        ctx.db
          .select({
            totalBudget: sql<string>`coalesce(sum(${budgets.limit}), '0')`,
            count: sql<number>`count(*)`,
          })
          .from(budgets),
        ctx.db
          .select()
          .from(activities)
          .orderBy(desc(activities.createdAt))
          .limit(10),
        ctx.db
          .select({
            date: sql<string>`date_trunc('day', ${costRecords.createdAt})::text`,
            totalCost: sql<string>`coalesce(sum(${costRecords.totalCost}), '0')`,
            totalTokens: sql<number>`coalesce(sum(${costRecords.totalTokens}), 0)`,
          })
          .from(costRecords)
          .where(gte(costRecords.createdAt, periodStart))
          .groupBy(sql`date_trunc('day', ${costRecords.createdAt})`)
          .orderBy(sql`date_trunc('day', ${costRecords.createdAt})`),
      ]);

      return {
        totalActivities: Number(totalActivitiesResult[0].count),
        totalCost: costSummary[0].totalCost,
        totalTokens: Number(costSummary[0].totalTokens),
        activeAgents: Number(activeAgentsResult[0].count),
        runningJobs: Number(runningJobsResult[0].count),
        failedActivities: Number(failedActivitiesResult[0].count),
        unreadAlerts: Number(unreadAlertsResult[0].count),
        budgetStatus: {
          totalBudget: budgetStatusResult[0].totalBudget,
          budgetCount: Number(budgetStatusResult[0].count),
          totalSpent: costSummary[0].totalCost,
        },
        recentActivities: recentActivitiesData,
        costTrend: costTrendData,
      };
    }),

  activityFeed: protectedProcedure
    .input(z.object({
      limit: z.number().int().positive().max(50).default(20),
    }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;

      const data = await ctx.db
        .select()
        .from(activities)
        .orderBy(desc(activities.createdAt))
        .limit(limit);

      return {
        activities: data,
        lastUpdated: new Date().toISOString(),
      };
    }),
});
