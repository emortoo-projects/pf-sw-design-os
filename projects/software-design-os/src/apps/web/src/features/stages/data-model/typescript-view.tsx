import type { DataModel, EntityField } from './types'

interface TypeScriptViewProps {
  model: DataModel
}

function fieldTypeToTs(type: string): string {
  if (type.startsWith('enum(')) {
    const values = type.slice(5, -1).split(',').map((v) => `'${v.trim()}'`)
    return values.join(' | ')
  }
  switch (type) {
    case 'string':
    case 'text':
      return 'string'
    case 'integer':
    case 'decimal':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'uuid':
      return 'string'
    case 'datetime':
      return 'string'
    case 'jsonb':
      return 'Record<string, unknown>'
    default:
      return 'unknown'
  }
}

function generateInterface(entity: { name: string; fields: EntityField[] }): string {
  const lines = [`export interface ${entity.name} {`]
  for (const field of entity.fields) {
    const optional = field.required ? '' : '?'
    const tsType = fieldTypeToTs(field.type)
    const comment = field.description ? ` // ${field.description}` : ''
    lines.push(`  ${field.name}${optional}: ${tsType}${comment}`)
  }
  lines.push('}')
  return lines.join('\n')
}

export function TypeScriptView({ model }: TypeScriptViewProps) {
  const code = model.entities.map(generateInterface).join('\n\n')

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-zinc-700">TypeScript Interfaces</h3>
      <pre className="overflow-auto rounded-lg border border-zinc-700 bg-zinc-950 p-4 font-mono text-xs text-emerald-400">
        {code || '// No entities defined yet'}
      </pre>
    </div>
  )
}
