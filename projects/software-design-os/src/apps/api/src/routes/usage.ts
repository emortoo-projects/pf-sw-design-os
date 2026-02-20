import { Hono } from 'hono'
import { z } from 'zod'
import { eq, sql, gte, and } from 'drizzle-orm'
import { db } from '../db'
import { aiGenerations, stages, projects } from '../db/schema'
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

export { usageRoutes }
