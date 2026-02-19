export const FIELD_TYPES = [
  'string',
  'text',
  'integer',
  'decimal',
  'boolean',
  'uuid',
  'datetime',
  'jsonb',
] as const

export type FieldType = (typeof FIELD_TYPES)[number] | string // string covers enum(...)

export interface EntityField {
  id: string
  name: string
  type: FieldType
  required: boolean
  description: string
}

export interface Entity {
  id: string
  name: string
  description: string
  fields: EntityField[]
}

export type RelationshipType = 'one-to-one' | 'one-to-many' | 'many-to-many'

export interface Relationship {
  id: string
  fromEntityId: string
  toEntityId: string
  type: RelationshipType
  foreignKey: string
  description: string
}

export interface DataModel {
  entities: Entity[]
  relationships: Relationship[]
}

export function createEmptyDataModel(): DataModel {
  return { entities: [], relationships: [] }
}

let idCounter = 0
export function generateId(prefix = 'dm'): string {
  return `${prefix}-${Date.now()}-${++idCounter}`
}

export function createEmptyEntity(): Entity {
  const id = generateId('entity')
  return {
    id,
    name: '',
    description: '',
    fields: [
      { id: generateId('field'), name: 'id', type: 'uuid', required: true, description: 'Primary key' },
      { id: generateId('field'), name: 'createdAt', type: 'datetime', required: true, description: 'Creation timestamp' },
      { id: generateId('field'), name: 'updatedAt', type: 'datetime', required: true, description: 'Last update timestamp' },
    ],
  }
}

export function createEmptyField(): EntityField {
  return { id: generateId('field'), name: '', type: 'string', required: false, description: '' }
}
