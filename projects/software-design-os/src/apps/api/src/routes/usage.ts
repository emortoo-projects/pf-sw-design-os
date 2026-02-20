import { Hono } from 'hono'
import { z } from 'zod'
import { eq, sql, gte, and, desc } from 'drizzle-orm'
import { db } from '../db'
import { aiGenerations, stages, projects, stageOutputs } from '../db/schema'
import type { AppEnv } from '../types'

const periodSchema = z.enum(['7d', '30d', '90d', 'all']).default('30d')

function getPeriodStart(period: z.infer<typeof periodSchema>): Date | null {
  if (period === 'all') return null
  const days = { '7d': 7, '30d': 30, '90d': 90 } as const
  const start = new Date()
  start.setDate(start.getDate() - days[period])
  start.setHours(0, 0, 0, 0)
  return start
}

const usageRoutes = new Hono<AppEnv>()

// GET /api/usage?period=30d
usageRoutes.get('/', async (c) => {
  const userId = c.get('userId')

  const parsed = periodSchema.safeParse(c.req.query('period'))
  if (!parsed.success) {
    return c.json(
      { error: { code: 'BAD_REQUEST', message: 'Invalid period. Must be one of: 7d, 30d, 90d, all' } },
      400,
    )
  }
  const period = parsed.data
  const periodStart = getPeriodStart(period)

  // Shared WHERE conditions
  const baseConditions = eq(projects.userId, userId)
  const dateFilter = periodStart
    ? and(baseConditions, gte(aiGenerations.createdAt, periodStart))
    : baseConditions

  // Run all three aggregation queries in parallel
  const [byProject, byModel, trend] = await Promise.all([
    // Query 1 — By Project
    db
      .select({
        projectId: projects.id,
        projectName: projects.name,
        tokens: sql<string>`COALESCE(SUM(${aiGenerations.totalTokens}), 0)`,
        cost: sql<string>`COALESCE(SUM(${aiGenerations.estimatedCost}), 0)`,
      })
      .from(aiGenerations)
      .innerJoin(stages, eq(aiGenerations.stageId, stages.id))
      .innerJoin(projects, eq(stages.projectId, projects.id))
      .where(dateFilter)
      .groupBy(projects.id, projects.name)
      .orderBy(sql`SUM(${aiGenerations.estimatedCost}) DESC`),

    // Query 2 — By Model
    db
      .select({
        model: aiGenerations.model,
        tokens: sql<string>`COALESCE(SUM(${aiGenerations.totalTokens}), 0)`,
        cost: sql<string>`COALESCE(SUM(${aiGenerations.estimatedCost}), 0)`,
      })
      .from(aiGenerations)
      .innerJoin(stages, eq(aiGenerations.stageId, stages.id))
      .innerJoin(projects, eq(stages.projectId, projects.id))
      .where(dateFilter)
      .groupBy(aiGenerations.model)
      .orderBy(sql`SUM(${aiGenerations.estimatedCost}) DESC`),

    // Query 3 — Daily Trend
    db
      .select({
        date: sql<string>`DATE(${aiGenerations.createdAt})`,
        tokens: sql<string>`COALESCE(SUM(${aiGenerations.totalTokens}), 0)`,
        cost: sql<string>`COALESCE(SUM(${aiGenerations.estimatedCost}), 0)`,
      })
      .from(aiGenerations)
      .innerJoin(stages, eq(aiGenerations.stageId, stages.id))
      .innerJoin(projects, eq(stages.projectId, projects.id))
      .where(dateFilter)
      .groupBy(sql`DATE(${aiGenerations.createdAt})`)
      .orderBy(sql`DATE(${aiGenerations.createdAt}) ASC`),
  ])

  // Compute totals from byProject to avoid a 4th query
  const totalTokens = byProject.reduce((sum, row) => sum + Number(row.tokens), 0)
  const totalCost = byProject.reduce((sum, row) => sum + Number(row.cost), 0)

  return c.json({
    totalTokens,
    totalCost: Math.round(totalCost * 1_000_000) / 1_000_000,
    byProject: byProject.map((row) => ({
      projectId: row.projectId,
      projectName: row.projectName,
      tokens: Number(row.tokens),
      cost: Number(row.cost),
    })),
    byModel: byModel.map((row) => ({
      model: row.model,
      tokens: Number(row.tokens),
      cost: Number(row.cost),
    })),
    trend: trend.map((row) => ({
      date: String(row.date),
      tokens: Number(row.tokens),
      cost: Number(row.cost),
    })),
  })
})

// GET /api/usage/summary — lightweight dashboard endpoint (always last 30 days)
usageRoutes.get('/summary', async (c) => {
  const userId = c.get('userId')

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  thirtyDaysAgo.setHours(0, 0, 0, 0)

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const baseConditions = eq(projects.userId, userId)
  const monthFilter = and(baseConditions, gte(aiGenerations.createdAt, thirtyDaysAgo))
  const weekFilter = and(baseConditions, gte(aiGenerations.createdAt, sevenDaysAgo))

  const [totals, byModel, dailySpending, recentGens] = await Promise.all([
    // Totals for last 30 days
    db
      .select({
        totalTokens: sql<string>`COALESCE(SUM(${aiGenerations.totalTokens}), 0)`,
        totalCost: sql<string>`COALESCE(SUM(${aiGenerations.estimatedCost}), 0)`,
        generationCount: sql<string>`COUNT(*)`,
      })
      .from(aiGenerations)
      .innerJoin(stages, eq(aiGenerations.stageId, stages.id))
      .innerJoin(projects, eq(stages.projectId, projects.id))
      .where(monthFilter),

    // Model breakdown for last 30 days
    db
      .select({
        model: aiGenerations.model,
        tokens: sql<string>`COALESCE(SUM(${aiGenerations.totalTokens}), 0)`,
        cost: sql<string>`COALESCE(SUM(${aiGenerations.estimatedCost}), 0)`,
        count: sql<string>`COUNT(*)`,
      })
      .from(aiGenerations)
      .innerJoin(stages, eq(aiGenerations.stageId, stages.id))
      .innerJoin(projects, eq(stages.projectId, projects.id))
      .where(monthFilter)
      .groupBy(aiGenerations.model)
      .orderBy(sql`COUNT(*) DESC`),

    // Daily spending for last 7 days
    db
      .select({
        date: sql<string>`DATE(${aiGenerations.createdAt})`,
        cost: sql<string>`COALESCE(SUM(${aiGenerations.estimatedCost}), 0)`,
      })
      .from(aiGenerations)
      .innerJoin(stages, eq(aiGenerations.stageId, stages.id))
      .innerJoin(projects, eq(stages.projectId, projects.id))
      .where(weekFilter)
      .groupBy(sql`DATE(${aiGenerations.createdAt})`)
      .orderBy(sql`DATE(${aiGenerations.createdAt}) ASC`),

    // Last 5 generation events
    db
      .select({
        id: aiGenerations.id,
        model: aiGenerations.model,
        estimatedCost: aiGenerations.estimatedCost,
        totalTokens: aiGenerations.totalTokens,
        durationMs: aiGenerations.durationMs,
        createdAt: aiGenerations.createdAt,
        stageNumber: stages.stageNumber,
        stageName: stages.stageName,
        stageLabel: stages.stageLabel,
        projectId: projects.id,
        projectName: projects.name,
      })
      .from(aiGenerations)
      .innerJoin(stages, eq(aiGenerations.stageId, stages.id))
      .innerJoin(projects, eq(stages.projectId, projects.id))
      .where(baseConditions)
      .orderBy(desc(aiGenerations.createdAt))
      .limit(5),
  ])

  const totalTokens = Number(totals[0]?.totalTokens ?? 0)
  const totalCost = Number(totals[0]?.totalCost ?? 0)
  const generationCount = Number(totals[0]?.generationCount ?? 0)
  const avgCostPerGeneration = generationCount > 0 ? totalCost / generationCount : 0

  // Top model
  const totalModelCount = byModel.reduce((s, r) => s + Number(r.count), 0)
  const topModelRow = byModel[0]
  const topModel = topModelRow
    ? {
        model: topModelRow.model,
        percentage: totalModelCount > 0
          ? Math.round((Number(topModelRow.count) / totalModelCount) * 100)
          : 0,
      }
    : null

  // Model usage percentages
  const modelUsage = byModel.map((row) => ({
    model: row.model,
    tokens: Number(row.tokens),
    cost: Number(row.cost),
    count: Number(row.count),
    percentage: totalModelCount > 0 ? Math.round((Number(row.count) / totalModelCount) * 100) : 0,
  }))

  return c.json({
    totalTokens,
    totalCost: Math.round(totalCost * 1_000_000) / 1_000_000,
    generationCount,
    avgCostPerGeneration: Math.round(avgCostPerGeneration * 1_000_000) / 1_000_000,
    topModel,
    modelUsage,
    dailySpending: dailySpending.map((row) => ({
      date: String(row.date),
      cost: Number(row.cost),
    })),
    recentGenerations: recentGens.map((row) => ({
      id: row.id,
      model: row.model,
      cost: Number(row.estimatedCost),
      tokens: row.totalTokens,
      durationMs: row.durationMs,
      createdAt: row.createdAt?.toISOString() ?? '',
      stageNumber: row.stageNumber,
      stageName: row.stageName,
      stageLabel: row.stageLabel,
      projectId: row.projectId,
      projectName: row.projectName,
    })),
  })
})

export { usageRoutes }
