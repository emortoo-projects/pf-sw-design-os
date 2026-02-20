import { spawn } from 'node:child_process'
import { createReadStream, createWriteStream } from 'node:fs'
import { readdir, stat, unlink, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { createGzip, createGunzip } from 'node:zlib'
import { pipeline } from 'node:stream/promises'
import cron from 'node-cron'

const BACKUP_DIR = process.env.BACKUP_DIR ?? '/tmp/sdos-backups'

interface BackupInfo {
  filename: string
  sizeBytes: number
  createdAt: string
}

interface DbConfig {
  host: string
  port: string
  user: string
  database: string
  password: string
}

export function parseDbUrl(): DbConfig {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is required')

  const parsed = new URL(url)
  return {
    host: parsed.hostname,
    port: parsed.port || '5432',
    user: parsed.username,
    database: parsed.pathname.slice(1),
    password: parsed.password,
  }
}

async function ensureBackupDir(): Promise<void> {
  await mkdir(BACKUP_DIR, { recursive: true })
}

export async function runPgDump(outputPath: string): Promise<void> {
  await ensureBackupDir()
  const config = parseDbUrl()

  return new Promise((resolve, reject) => {
    const pg = spawn('pg_dump', ['-h', config.host, '-p', config.port, '-U', config.user, config.database], {
      env: { ...process.env, PGPASSWORD: config.password },
    })

    const gzip = createGzip()
    const out = createWriteStream(outputPath)

    pg.stdout.pipe(gzip).pipe(out)

    let stderr = ''
    pg.stderr.on('data', (chunk) => { stderr += chunk.toString() })

    out.on('finish', () => resolve())
    pg.on('error', (err) => reject(new Error(`pg_dump spawn failed: ${err.message}`)))
    pg.on('close', (code) => {
      if (code !== 0) reject(new Error(`pg_dump exited with code ${code}: ${stderr}`))
    })
  })
}

export async function runPsqlRestore(inputPath: string): Promise<void> {
  const config = parseDbUrl()

  return new Promise((resolve, reject) => {
    const psql = spawn('psql', ['-h', config.host, '-p', config.port, '-U', config.user, config.database], {
      env: { ...process.env, PGPASSWORD: config.password },
    })

    const gunzip = createGunzip()
    const input = createReadStream(inputPath)

    pipeline(input, gunzip, psql.stdin).catch(reject)

    let stderr = ''
    psql.stderr.on('data', (chunk) => { stderr += chunk.toString() })

    psql.on('error', (err) => reject(new Error(`psql spawn failed: ${err.message}`)))
    psql.on('close', (code) => {
      if (code !== 0) reject(new Error(`psql exited with code ${code}: ${stderr}`))
      else resolve()
    })
  })
}

export async function listBackups(): Promise<BackupInfo[]> {
  await ensureBackupDir()
  const files = await readdir(BACKUP_DIR)
  const backups: BackupInfo[] = []

  for (const filename of files) {
    if (!filename.endsWith('.sql.gz')) continue
    const filePath = join(BACKUP_DIR, filename)
    const stats = await stat(filePath)
    backups.push({
      filename,
      sizeBytes: stats.size,
      createdAt: stats.birthtime.toISOString(),
    })
  }

  return backups.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function cleanOldBackups(keepCount: number): Promise<number> {
  const backups = await listBackups()
  let deleted = 0

  if (backups.length <= keepCount) return deleted

  const toDelete = backups.slice(keepCount)
  for (const backup of toDelete) {
    await unlink(join(BACKUP_DIR, backup.filename))
    deleted++
  }

  return deleted
}

export function startDailyCronJob(): void {
  // Run at 2:00 AM daily
  cron.schedule('0 2 * * *', async () => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const outputPath = join(BACKUP_DIR, `backup-${timestamp}.sql.gz`)
      await runPgDump(outputPath)
      const deleted = await cleanOldBackups(7)
      console.log(`[backup-cron] Backup created: ${outputPath}, cleaned ${deleted} old backups`)
    } catch (err) {
      console.error('[backup-cron] Backup failed:', err)
    }
  })
  console.log('[backup-cron] Daily backup scheduled at 02:00')
}

export function getBackupDir(): string {
  return BACKUP_DIR
}
