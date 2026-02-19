import { useState, useEffect, useCallback } from 'react'
import { Plus, Link2, X } from 'lucide-react'
import type { Stage } from '@sdos/shared'
import { usePipelineStore } from '@/stores/pipeline-store'
import { Button } from '@/components/ui/button'
import { EntityCanvas } from './entity-canvas'
import { RelationshipPanel } from './relationship-panel'
import { AddRelationshipDialog } from './add-relationship-dialog'
import { TypeScriptView } from './typescript-view'
import { DataModelViewToggle, type DataModelViewMode } from './data-model-view-toggle'
import type { DataModel, Entity, Relationship } from './types'
import { createEmptyDataModel, createEmptyEntity } from './types'

interface DataModelEditorProps {
  stage: Stage
}

function parseDataModel(data: Record<string, unknown> | undefined): DataModel {
  if (!data || !Array.isArray(data.entities)) return createEmptyDataModel()
  return {
    entities: data.entities as Entity[],
    relationships: Array.isArray(data.relationships) ? (data.relationships as Relationship[]) : [],
  }
}

export function DataModelEditor({ stage }: DataModelEditorProps) {
  const { setEditorDirty, setEditorData } = usePipelineStore()
  const [viewMode, setViewMode] = useState<DataModelViewMode>('visual')
  const [model, setModel] = useState<DataModel>(() => parseDataModel(stage.data))

  // Drawing mode state
  const [drawingMode, setDrawingMode] = useState(false)
  const [drawingSource, setDrawingSource] = useState<string | null>(null)
  const [showRelDialog, setShowRelDialog] = useState(false)
  const [relDialogTarget, setRelDialogTarget] = useState<string | undefined>()

  const hasModel = model.entities.length > 0

  useEffect(() => {
    const parsed = parseDataModel(stage.data)
    if (parsed.entities.length > 0) {
      setModel(parsed)
    }
  }, [stage.data])

  const updateModel = useCallback(
    (updates: Partial<DataModel>) => {
      setModel((prev) => {
        const next = { ...prev, ...updates }
        setEditorData(next as unknown as Record<string, unknown>)
        setEditorDirty(true)
        return next
      })
    },
    [setEditorData, setEditorDirty],
  )

  function handleAddEntity() {
    updateModel({ entities: [...model.entities, createEmptyEntity()] })
  }

  function handleEntitiesChange(entities: Entity[]) {
    // Also clean up relationships referencing deleted entities
    const entityIds = new Set(entities.map((e) => e.id))
    const cleanedRels = model.relationships.filter(
      (r) => entityIds.has(r.fromEntityId) && entityIds.has(r.toEntityId),
    )
    updateModel({ entities, relationships: cleanedRels })
  }

  function handleEntitySelect(entityId: string) {
    if (!drawingMode) return

    if (!drawingSource) {
      setDrawingSource(entityId)
    } else if (drawingSource !== entityId) {
      // Source and target selected, open dialog
      setRelDialogTarget(entityId)
      setShowRelDialog(true)
      setDrawingMode(false)
      setDrawingSource(null)
    }
  }

  function handleAddRelationship(rel: Relationship) {
    updateModel({ relationships: [...model.relationships, rel] })
    setDrawingSource(null)
    setRelDialogTarget(undefined)
  }

  function cancelDrawingMode() {
    setDrawingMode(false)
    setDrawingSource(null)
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleAddEntity}>
            <Plus className="h-3.5 w-3.5" />
            Add Entity
          </Button>
          {drawingMode ? (
            <Button variant="outline" size="sm" onClick={cancelDrawingMode}>
              <X className="h-3.5 w-3.5" />
              Cancel
              {drawingSource ? ' (select target)' : ' (select source)'}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDrawingMode(true)}
              disabled={model.entities.length < 2}
            >
              <Link2 className="h-3.5 w-3.5" />
              Add Relationship
            </Button>
          )}
        </div>
        <DataModelViewToggle mode={viewMode} onToggle={setViewMode} />
      </div>

      {/* Drawing mode hint */}
      {drawingMode && (
        <div className="rounded-md border border-primary-200 bg-primary-50 px-4 py-2 text-sm text-primary-700">
          {drawingSource
            ? `Click the target entity to complete the relationship from "${model.entities.find((e) => e.id === drawingSource)?.name || 'Unknown'}"`
            : 'Click the source entity to start drawing a relationship'}
        </div>
      )}

      {/* Main view */}
      {viewMode === 'visual' ? (
        <div className="space-y-6">
          <EntityCanvas
            entities={model.entities}
            onChange={handleEntitiesChange}
            drawingMode={drawingMode}
            selectedEntityId={drawingSource}
            onEntitySelect={handleEntitySelect}
          />
          {hasModel && (
            <RelationshipPanel
              relationships={model.relationships}
              entities={model.entities}
              onChange={(rels) => updateModel({ relationships: rels })}
            />
          )}
        </div>
      ) : (
        <TypeScriptView model={model} />
      )}

      {/* Empty state */}
      {!hasModel && stage.status === 'active' && viewMode === 'visual' && (
        <div className="flex flex-col items-center justify-center gap-2 py-8">
          <p className="text-xs text-zinc-300">
            Click Generate to create entities from your product definition, or add entities manually.
          </p>
        </div>
      )}

      {/* Add Relationship Dialog */}
      <AddRelationshipDialog
        open={showRelDialog}
        onOpenChange={setShowRelDialog}
        entities={model.entities}
        sourceEntityId={drawingSource ?? undefined}
        targetEntityId={relDialogTarget}
        onAdd={handleAddRelationship}
      />
    </div>
  )
}
