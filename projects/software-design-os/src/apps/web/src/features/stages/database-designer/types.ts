export type DbEngine = 'postgresql' | 'mysql' | 'sqlite' | 'mongodb' | 'supabase' | 'planetscale'

export interface DbEngineInfo {
  id: DbEngine
  name: string
  description: string
  schemaLanguage: 'sql' | 'json'
}

export const DB_ENGINES: DbEngineInfo[] = [
  { id: 'postgresql', name: 'PostgreSQL', description: 'Best all-around choice. JSON support, full-text search, rock solid.', schemaLanguage: 'sql' },
  { id: 'mysql', name: 'MySQL', description: 'Widely supported. Good for straightforward relational data.', schemaLanguage: 'sql' },
  { id: 'sqlite', name: 'SQLite', description: 'Zero-config, file-based. Great for local-first or embedded apps.', schemaLanguage: 'sql' },
  { id: 'mongodb', name: 'MongoDB', description: 'Document store. Good for flexible/nested data structures.', schemaLanguage: 'json' },
  { id: 'supabase', name: 'Supabase', description: 'Postgres with built-in auth, real-time, and REST API.', schemaLanguage: 'sql' },
  { id: 'planetscale', name: 'PlanetScale', description: 'MySQL-compatible, serverless, branching support.', schemaLanguage: 'sql' },
]

export type IndexType = 'btree' | 'hash' | 'gin' | 'gist' | 'unique'

export interface SchemaIndex {
  id: string
  table: string
  columns: string[]
  type: IndexType
  rationale: string
}

export interface Migration {
  id: string
  step: number
  name: string
  description: string
  sql: string
}

export interface SchemaColumn {
  name: string
  type: string
  nullable: boolean
  defaultValue?: string
  isPrimaryKey: boolean
  isForeignKey: boolean
  references?: string
}

export interface SchemaTable {
  name: string
  columns: SchemaColumn[]
}

export interface DatabaseSchema {
  engine: DbEngine
  schema: string
  tables: SchemaTable[]
  indexes: SchemaIndex[]
  migrations: Migration[]
}

export function createEmptyDatabaseSchema(): DatabaseSchema {
  return {
    engine: 'postgresql',
    schema: '',
    tables: [],
    indexes: [],
    migrations: [],
  }
}

let idCounter = 0
export function generateId(prefix = 'db'): string {
  return `${prefix}-${Date.now()}-${++idCounter}`
}
