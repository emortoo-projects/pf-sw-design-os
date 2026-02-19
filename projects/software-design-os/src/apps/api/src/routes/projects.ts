import { Hono } from 'hono'
import { z } from 'zod'
import { eq, and, isNull, ne } from 'drizzle-orm'
import { db } from '../db'
import { projects as projectsTable, stages as stagesTable, templates as templatesTable } from '../db/schema'
import { STAGE_CONFIGS } from '@sdos/shared'
import type { AppEnv } from '../types'

const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  templateId: z.string().uuid().optional(),
  aiProviderId: z.string().uuid().optional(),
})

const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).nullable().optional(),
  aiProviderId: z.string().uuid().nullable().optional(),
})

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200)
}

async function generateUniqueSlug(userId: string, name: string): Promise<string> {
  const base = slugify(name)
  let slug = base
  let suffix = 1

  while (true) {
    const existing = await db
      .select({ id: projectsTable.id })
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.userId, userId),
          eq(projectsTable.slug, slug),
        ),
      )
      .limit(1)

    if (existing.length === 0) return slug
    slug = `${base}-${suffix++}`
  }
}

const projects = new Hono<AppEnv>()

// GET /api/projects — list user's projects with stage summaries
projects.get('/', async (c) => {
  const userId = c.get('userId')

  const userProjects = await db.query.projects.findMany({
    where: and(
      eq(projectsTable.userId, userId),
      ne(projectsTable.status, 'deleted'),
    ),
    with: {
      stages: {
        orderBy: (stages, { asc }) => [asc(stages.stageNumber)],
      },
    },
    orderBy: (projects, { desc }) => [desc(projects.updatedAt)],
  })

  return c.json(userProjects)
})

// POST /api/projects — create project + 9 stages
projects.post('/', async (c) => {
  const userId = c.get('userId')
  const body = createProjectSchema.parse(await c.req.json())

  const slug = await generateUniqueSlug(userId, body.name)

  // If templateId provided, load template defaults
  let templateDefaults: Record<string, unknown> | null = null
  if (body.templateId) {
    const [template] = await db
      .select({ stageDefaults: templatesTable.stageDefaults })
      .from(templatesTable)
      .where(eq(templatesTable.id, body.templateId))
      .limit(1)

    if (!template) {
      return c.json({ error: { code: 'BAD_REQUEST', message: 'Template not found' } }, 400)
    }
    templateDefaults = template.stageDefaults as Record<string, unknown>
  }

  // Create project
  const [project] = await db
    .insert(projectsTable)
    .values({
      userId,
      name: body.name,
      slug,
      description: body.description,
      templateId: body.templateId,
      aiProviderId: body.aiProviderId,
    })
    .returning()

  // Create 9 stages — stage 1 is active, rest are locked
  const stageValues = STAGE_CONFIGS.map((config) => ({
    projectId: project.id,
    stageNumber: config.number,
    stageName: config.name,
    stageLabel: config.label,
    status: config.number === 1 ? ('active' as const) : ('locked' as const),
    data: templateDefaults?.[config.name] ?? null,
  }))

  const createdStages = await db
    .insert(stagesTable)
    .values(stageValues)
    .returning()

  const sortedStages = createdStages.sort((a, b) => a.stageNumber - b.stageNumber)

  return c.json({ ...project, stages: sortedStages }, 201)
})

// GET /api/projects/:id — project with all stages
projects.get('/:id', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('id')

  const project = await db.query.projects.findFirst({
    where: and(
      eq(projectsTable.id, projectId),
      eq(projectsTable.userId, userId),
      ne(projectsTable.status, 'deleted'),
    ),
    with: {
      stages: {
        orderBy: (stages, { asc }) => [asc(stages.stageNumber)],
      },
    },
  })

  if (!project) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  return c.json(project)
})

// PUT /api/projects/:id — update project metadata
projects.put('/:id', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('id')
  const body = updateProjectSchema.parse(await c.req.json())

  const [updated] = await db
    .update(projectsTable)
    .set(body)
    .where(
      and(
        eq(projectsTable.id, projectId),
        eq(projectsTable.userId, userId),
        ne(projectsTable.status, 'deleted'),
      ),
    )
    .returning()

  if (!updated) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  return c.json(updated)
})

// DELETE /api/projects/:id — soft delete
projects.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.param('id')

  const [deleted] = await db
    .update(projectsTable)
    .set({ status: 'deleted', deletedAt: new Date() })
    .where(
      and(
        eq(projectsTable.id, projectId),
        eq(projectsTable.userId, userId),
        ne(projectsTable.status, 'deleted'),
      ),
    )
    .returning({ id: projectsTable.id })

  if (!deleted) {
    return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
  }

  return c.json({ success: true })
})

export { projects }
