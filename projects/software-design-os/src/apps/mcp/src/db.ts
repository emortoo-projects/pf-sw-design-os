import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
// Shares the Drizzle schema from the API package (monorepo sibling).
// Both apps run against the same DB and schema must stay in sync.
import * as schema from '../../api/src/db/schema'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required')
}

export const client = postgres(connectionString)
export const db = drizzle(client, { schema })
export { schema }
