import { Hono } from 'hono'
import { z } from 'zod'
import { eq, ne, sql } from 'drizzle-orm'
import { join, resolve } from 'node:path'
import { unlink } from 'node:fs/promises'
import { db } from '../db'
import { users } from '../db/schema'
import * as schema from '../db/schema'
import {
  runPgDump,
  runPsqlRestore,
  listBackups,
  getBackupDir,
} from '../lib/backup-manager'
import type { AppEnv } from '../types'
import type { MiddlewareHandler } from 'hono'

// Admin guard: only the first registered user (admin) can access these routes.
// This is a simple check that can be replaced with a proper role system later.
const requireFirstUser: MiddlewareHandler<AppEnv> = async (c, next) => {
  const userId = c.get('userId')

  // First user in the system is the admin (lowest createdAt)
  const [firstUser] = await db
    .select({ id: users.id })
    .from(users)
    .orderBy(users.createdAt)
    .limit(1)

  if (!firstUser || firstUser.id !== userId) {
    return c.json({ error: { code: 'FORBIDDEN', message: 'Admin access required' } }, 403)
  }

  return next()
}

const adminRoutes = new Hono<AppEnv>()

// Apply admin guard to all routes
adminRoutes.use('*', requireFirstUser)

// GET /api/admin/export?format=json|sql
adminRoutes.get('/export', async (c) => {
  const format = c.req.query('format') ?? 'json'

  if (format === 'json') {
    // Explicitly exclude sensitive columns (passwordHash, apiKeyEncrypted)
    const [
      exportedUsers,
      projects,
      stages,
      aiProviders,
      stageOutputs,
      aiGenerations,
      templates,
      exportPackages,
    ] = await Promise.all([
      db.select({
        id: schema.users.id,
        email: schema.users.email,
        name: schema.users.name,
        avatarUrl: schema.users.avatarUrl,
        preferences: schema.users.preferences,
        createdAt: schema.users.createdAt,
        updatedAt: schema.users.updatedAt,
      }).from(schema.users),
      db.select().from(schema.projects),
      db.select().from(schema.stages),
      db.select({
        id: schema.aiProviderConfigs.id,
        userId: schema.aiProviderConfigs.userId,
        provider: schema.aiProviderConfigs.provider,
        label: schema.aiProviderConfigs.label,
        defaultModel: schema.aiProviderConfigs.defaultModel,
        baseUrl: schema.aiProviderConfigs.baseUrl,
        isDefault: schema.aiProviderConfigs.isDefault,
        createdAt: schema.aiProviderConfigs.createdAt,
      }).from(schema.aiProviderConfigs),
      db.select().from(schema.stageOutputs),
      db.select().from(schema.aiGenerations),
      db.select().from(schema.templates),
      db.select().from(schema.exportPackages),
    ])

    const data = {
      exportedAt: new Date().toISOString(),
      tables: {
        users: exportedUsers,
        projects,
        stages,
        aiProviders,
        stageOutputs,
        aiGenerations,
        templates,
        exportPackages,
      },
    }

    c.header('Content-Disposition', 'attachment; filename="sdos-export.json"')
    return c.json(data)
  }

  if (format === 'sql') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const outputPath = join(getBackupDir(), `export-${timestamp}.sql.gz`)
    await runPgDump(outputPath)

    const { createReadStream } = await import('node:fs')
    const stream = createReadStream(outputPath)

    // Clean up temp file after streaming
    stream.on('close', () => { unlink(outputPath).catch(() => {}) })

    return new Response(stream as unknown as ReadableStream, {
      headers: {
        'Content-Disposition': 'attachment; filename="sdos-export.sql.gz"',
        'Content-Type': 'application/gzip',
      },
    })
  }

  return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid format. Use json or sql.' } }, 400)
})

// POST /api/admin/import — JSON import (transaction wipe+insert)
adminRoutes.post('/import', async (c) => {
  const body = await c.req.json()
  const tables = body.tables

  if (!tables || typeof tables !== 'object') {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Body must include { tables: {...} }' } }, 400)
  }

  let tablesImported = 0

  await db.transaction(async (tx) => {
    // Delete in reverse dependency order
    await tx.delete(schema.stageOutputs)
    await tx.delete(schema.aiGenerations)
    await tx.delete(schema.exportPackages)
    await tx.delete(schema.mcpTokens)
    await tx.delete(schema.refreshTokens)
    await tx.delete(schema.stages)
    await tx.delete(schema.projects)
    await tx.delete(schema.aiProviderConfigs)
    await tx.delete(schema.templates)
    await tx.delete(schema.users)

    // Insert in dependency order
    if (tables.users?.length) { await tx.insert(schema.users).values(tables.users); tablesImported++ }
    if (tables.templates?.length) { await tx.insert(schema.templates).values(tables.templates); tablesImported++ }
    if (tables.aiProviders?.length) { await tx.insert(schema.aiProviderConfigs).values(tables.aiProviders); tablesImported++ }
    if (tables.projects?.length) { await tx.insert(schema.projects).values(tables.projects); tablesImported++ }
    if (tables.stages?.length) { await tx.insert(schema.stages).values(tables.stages); tablesImported++ }
    if (tables.stageOutputs?.length) { await tx.insert(schema.stageOutputs).values(tables.stageOutputs); tablesImported++ }
    if (tables.aiGenerations?.length) { await tx.insert(schema.aiGenerations).values(tables.aiGenerations); tablesImported++ }
    if (tables.exportPackages?.length) { await tx.insert(schema.exportPackages).values(tables.exportPackages); tablesImported++ }
  })

  return c.json({ success: true, tablesImported })
})

// POST /api/admin/backup — on-demand backup
adminRoutes.post('/backup', async (c) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `backup-${timestamp}.sql.gz`
  const outputPath = join(getBackupDir(), filename)
  await runPgDump(outputPath)
  return c.json({ success: true, filename })
})

// GET /api/admin/backups — list available backups
adminRoutes.get('/backups', async (c) => {
  const backups = await listBackups()
  return c.json({ backups })
})

// POST /api/admin/restore — restore from backup file
const BACKUP_FILENAME_RE = /^backup-[\w\-]+\.sql\.gz$/

adminRoutes.post('/restore', async (c) => {
  const body = z.object({
    filename: z.string().min(1).regex(BACKUP_FILENAME_RE, 'Invalid backup filename'),
  }).parse(await c.req.json())

  const filePath = join(getBackupDir(), body.filename)

  // Belt-and-suspenders: verify resolved path is inside backup dir
  const resolvedDir = resolve(getBackupDir())
  const resolvedPath = resolve(filePath)
  if (!resolvedPath.startsWith(resolvedDir + '/')) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'Invalid filename' } }, 400)
  }

  await runPsqlRestore(filePath)
  return c.json({ success: true })
})

// GET /api/admin/db-status — database size and table counts
adminRoutes.get('/db-status', async (c) => {
  const [sizeResult] = await db.execute(
    sql`SELECT pg_database_size(current_database()) AS size_bytes`,
  )

  const tableStats = await db.execute(
    sql`SELECT relname AS table_name, n_live_tup AS row_count
        FROM pg_stat_user_tables
        ORDER BY relname`,
  )

  const backups = await listBackups()
  const lastBackup = backups.length > 0 ? backups[0].createdAt : null

  return c.json({
    sizeBytes: Number(sizeResult.size_bytes),
    tables: tableStats.map((row) => ({
      name: row.table_name,
      rowCount: Number(row.row_count),
    })),
    lastBackup,
  })
})

// POST /api/admin/db-test — connection test with latency
adminRoutes.post('/db-test', async (c) => {
  const start = Date.now()
  await db.execute(sql`SELECT 1`)
  const latencyMs = Date.now() - start
  return c.json({ success: true, latencyMs })
})

// POST /api/admin/db-reset — truncate all user tables EXCEPT the current admin
adminRoutes.post('/db-reset', async (c) => {
  z.object({ confirm: z.literal('RESET') }).parse(await c.req.json())
  const adminId = c.get('userId')

  await db.transaction(async (tx) => {
    await tx.delete(schema.stageOutputs)
    await tx.delete(schema.aiGenerations)
    await tx.delete(schema.exportPackages)
    await tx.delete(schema.mcpTokens)
    await tx.delete(schema.refreshTokens)
    await tx.delete(schema.stages)
    await tx.delete(schema.projects)
    await tx.delete(schema.aiProviderConfigs)
    await tx.delete(schema.templates)
    // Delete all users EXCEPT the current admin to prevent re-setup takeover
    await tx.delete(schema.users).where(ne(schema.users.id, adminId))
  })

  return c.json({ success: true })
})

export { adminRoutes }
