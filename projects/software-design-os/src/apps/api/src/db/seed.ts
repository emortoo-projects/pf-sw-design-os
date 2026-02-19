import 'dotenv/config'
import bcryptjs from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { users, templates } from './schema'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL environment variable is required')
  process.exit(1)
}

const client = postgres(connectionString, { max: 1 })
const db = drizzle(client)

async function seed() {
  console.log('Seeding database...')

  // Demo user
  const demoPassword = await bcryptjs.hash('password123', 12)

  const [demoUser] = await db
    .insert(users)
    .values({
      email: 'demo@sdos.dev',
      name: 'Demo User',
      passwordHash: demoPassword,
      preferences: { theme: 'light', defaultEngine: 'postgresql' },
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { passwordHash: demoPassword },
    })
    .returning({ id: users.id, email: users.email })

  console.log(`  Upserted demo user: ${demoUser.email} (${demoUser.id})`)

  // Built-in templates
  const builtInTemplates = [
    {
      name: 'SaaS Starter',
      description:
        'Full-stack SaaS boilerplate with auth, billing, dashboard, and settings. Optimized for subscription-based products.',
      category: 'saas' as const,
      icon: 'Rocket',
      stageDefaults: {
        product: { type: 'saas', features: ['auth', 'billing', 'dashboard', 'settings'] },
      },
      isBuiltIn: true,
    },
    {
      name: 'REST API Service',
      description:
        'Backend-only API with authentication, CRUD endpoints, and OpenAPI documentation. No frontend.',
      category: 'api' as const,
      icon: 'Globe',
      stageDefaults: {
        product: { type: 'api', features: ['auth', 'crud', 'docs'] },
      },
      isBuiltIn: true,
    },
    {
      name: 'Landing Page',
      description:
        'Marketing landing page with hero section, features, pricing, and contact form. Static-first with optional CMS.',
      category: 'landing' as const,
      icon: 'Layout',
      stageDefaults: {
        product: { type: 'landing', features: ['hero', 'features', 'pricing', 'contact'] },
      },
      isBuiltIn: true,
    },
    {
      name: 'Mobile App',
      description:
        'Cross-platform mobile application with native navigation, offline support, and push notifications.',
      category: 'mobile' as const,
      icon: 'Smartphone',
      stageDefaults: {
        product: { type: 'mobile', features: ['navigation', 'offline', 'push'] },
      },
      isBuiltIn: true,
    },
    {
      name: 'CLI Tool',
      description:
        'Command-line tool with argument parsing, config files, and interactive prompts. Publishable to npm.',
      category: 'cli' as const,
      icon: 'Terminal',
      stageDefaults: {
        product: { type: 'cli', features: ['args', 'config', 'prompts'] },
      },
      isBuiltIn: true,
    },
    {
      name: 'Fullstack App',
      description:
        'Complete web application with frontend, backend, database, and deployment. Blank canvas for any idea.',
      category: 'fullstack' as const,
      icon: 'Layers',
      stageDefaults: {
        product: { type: 'fullstack', features: [] },
      },
      isBuiltIn: true,
    },
  ]

  // Check if built-in templates already exist
  const existingBuiltIn = await db
    .select({ id: templates.id })
    .from(templates)
    .where(eq(templates.isBuiltIn, true))
    .limit(1)

  if (existingBuiltIn.length > 0) {
    console.log('  Built-in templates already exist, skipped.')
  } else {
    const inserted = await db
      .insert(templates)
      .values(builtInTemplates)
      .returning({ id: templates.id, name: templates.name })

    console.log(`  Created ${inserted.length} built-in templates:`)
    for (const t of inserted) {
      console.log(`    - ${t.name} (${t.id})`)
    }
  }

  console.log('Seed complete.')
}

seed()
  .then(() => client.end())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
