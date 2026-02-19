import { Hono } from 'hono'
import { db } from '../db'
import { templates as templatesTable } from '../db/schema'
import type { AppEnv } from '../types'

const templateRoutes = new Hono<AppEnv>()

// GET /api/templates — list all available templates
templateRoutes.get('/', async (c) => {
  const allTemplates = await db
    .select({
      id: templatesTable.id,
      name: templatesTable.name,
      description: templatesTable.description,
      category: templatesTable.category,
      icon: templatesTable.icon,
      isBuiltIn: templatesTable.isBuiltIn,
      createdAt: templatesTable.createdAt,
    })
    .from(templatesTable)
    .orderBy(templatesTable.name)

  return c.json(allTemplates)
})

export { templateRoutes }
