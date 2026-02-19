import { useState, useEffect, useCallback } from 'react'
import type { Stage } from '@sdos/shared'
import { usePipelineStore } from '@/stores/pipeline-store'
import { EngineSelector } from './engine-selector'
import { SchemaPreview } from './schema-preview'
import { SchemaTableView } from './schema-table-view'
import { IndexingStrategy } from './indexing-strategy'
import { AddIndexDialog } from './add-index-dialog'
import { MigrationPlan } from './migration-plan'
import { DatabaseViewToggle, type DatabaseViewMode } from './database-view-toggle'
import type { DatabaseSchema, DbEngine, SchemaIndex } from './types'
import { DB_ENGINES, createEmptyDatabaseSchema } from './types'

interface DatabaseDesignerEditorProps {
  stage: Stage
}

function parseSchema(data: Record<string, unknown> | undefined): DatabaseSchema {
  if (!data || !data.engine) return createEmptyDatabaseSchema()
  return {
    engine: (data.engine as DbEngine) ?? 'postgresql',
    schema: (data.schema as string) ?? '',
    tables: Array.isArray(data.tables) ? data.tables : [],
    indexes: Array.isArray(data.indexes) ? data.indexes : [],
    migrations: Array.isArray(data.migrations) ? data.migrations : [],
  } as DatabaseSchema
}

export function DatabaseDesignerEditor({ stage }: DatabaseDesignerEditorProps) {
  const { setEditorDirty, setEditorData } = usePipelineStore()
  const [viewMode, setViewMode] = useState<DatabaseViewMode>('visual')
  const [dbSchema, setDbSchema] = useState<DatabaseSchema>(() => parseSchema(stage.data))
  const [showAddIndex, setShowAddIndex] = useState(false)

  const hasSchema = dbSchema.tables.length > 0

  useEffect(() => {
    const parsed = parseSchema(stage.data)
    if (parsed.tables.length > 0) {
      setDbSchema(parsed)
    }
  }, [stage.data])

  const updateSchema = useCallback(
    (updates: Partial<DatabaseSchema>) => {
      setDbSchema((prev) => {
        const next = { ...prev, ...updates }
        setEditorData(next as unknown as Record<string, unknown>)
        setEditorDirty(true)
        return next
      })
    },
    [setEditorData, setEditorDirty],
  )

  function handleEngineChange(engine: DbEngine) {
    updateSchema({ engine })
  }

  function handleIndexesChange(indexes: SchemaIndex[]) {
    updateSchema({ indexes })
  }

  function handleAddIndex(index: SchemaIndex) {
    updateSchema({ indexes: [...dbSchema.indexes, index] })
  }

  const engineInfo = DB_ENGINES.find((e) => e.id === dbSchema.engine)
  const schemaLanguage = engineInfo?.schemaLanguage ?? 'sql'

  return (
    <div className="space-y-6">
      {/* Engine selector — always visible */}
      <EngineSelector selected={dbSchema.engine} onChange={handleEngineChange} />

      {/* View toggle and content */}
      {hasSchema && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">Database Schema</h3>
            <DatabaseViewToggle mode={viewMode} onToggle={setViewMode} />
          </div>

          {viewMode === 'visual' && (
            <div className="space-y-6">
              <SchemaTableView tables={dbSchema.tables} />
              <IndexingStrategy
                indexes={dbSchema.indexes}
                onChange={handleIndexesChange}
                onAddClick={() => setShowAddIndex(true)}
              />
              <MigrationPlan migrations={dbSchema.migrations} />
            </div>
          )}

          {viewMode === 'sql' && (
            <SchemaPreview schema={dbSchema.schema} language={schemaLanguage} />
          )}

          {viewMode === 'json' && (
            <SchemaPreview
              schema={JSON.stringify(
                { engine: dbSchema.engine, tables: dbSchema.tables, indexes: dbSchema.indexes, migrations: dbSchema.migrations },
                null,
                2,
              )}
              language="json"
            />
          )}
        </>
      )}

      {/* Empty state */}
      {!hasSchema && stage.status === 'active' && (
        <div className="flex flex-col items-center justify-center gap-2 py-8">
          <p className="text-xs text-zinc-300">
            Click Generate to create a database schema from your data model, or select an engine
            first.
          </p>
        </div>
      )}

      {/* Add Index Dialog */}
      <AddIndexDialog
        open={showAddIndex}
        onOpenChange={setShowAddIndex}
        tables={dbSchema.tables}
        onAdd={handleAddIndex}
      />
    </div>
  )
}
