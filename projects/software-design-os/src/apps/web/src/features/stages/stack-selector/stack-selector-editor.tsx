import { useState, useEffect, useCallback } from 'react'
import type { Stage } from '@sdos/shared'
import { usePipelineStore } from '@/stores/pipeline-store'
import { SchemaPreview } from '@/features/stages/database-designer/schema-preview'
import { StackViewToggle, type StackViewMode } from './stack-view-toggle'
import { StackRecommendation } from './stack-recommendation'
import { CategoryPicker } from './category-picker'
import { DependencyList } from './dependency-list'
import { AddDependencyDialog } from './add-dependency-dialog'
import { StructurePreview } from './structure-preview'
import type { StackSelection, StackCategory, Dependency, FolderNode, StackRecommendationData } from './types'
import { CATEGORIES, createEmptyStackSelection } from './types'

interface StackSelectorEditorProps {
  stage: Stage
}

function isFolderNode(v: unknown): v is FolderNode {
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as FolderNode).name === 'string' &&
    ((v as FolderNode).type === 'folder' || (v as FolderNode).type === 'file')
  )
}

function isRecommendation(v: unknown): v is StackRecommendationData {
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as StackRecommendationData).confidence === 'number' &&
    typeof (v as StackRecommendationData).summary === 'string' &&
    typeof (v as StackRecommendationData).reasoning === 'string'
  )
}

function isStackSelection(data: unknown): data is StackSelection {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return (
    typeof d.selections === 'object' &&
    d.selections !== null &&
    Array.isArray(d.dependencies) &&
    isFolderNode(d.structure)
  )
}

function parseStackSelection(data: Record<string, unknown> | undefined): StackSelection {
  if (!data || !isStackSelection(data)) return createEmptyStackSelection()
  return {
    selections: data.selections as StackSelection['selections'],
    dependencies: Array.isArray(data.dependencies) ? data.dependencies : [],
    structure: data.structure,
    recommendation: isRecommendation(data.recommendation) ? data.recommendation : undefined,
  }
}

function generatePackageJson(selection: StackSelection): string {
  const deps: Record<string, string> = {}
  const devDeps: Record<string, string> = {}

  for (const dep of selection.dependencies) {
    if (dep.dev) {
      devDeps[dep.name] = dep.version
    } else {
      deps[dep.name] = dep.version
    }
  }

  const testScript = selection.selections.testing === 'jest' ? 'jest' : 'vitest'

  const pkg = {
    name: 'my-project',
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'vite',
      build: 'tsc && vite build',
      preview: 'vite preview',
      test: testScript,
    },
    dependencies: deps,
    devDependencies: devDeps,
  }

  return JSON.stringify(pkg, null, 2)
}

export function StackSelectorEditor({ stage }: StackSelectorEditorProps) {
  const { setEditorDirty, setEditorData } = usePipelineStore()
  const [viewMode, setViewMode] = useState<StackViewMode>('visual')
  const [stackSelection, setStackSelection] = useState<StackSelection>(() =>
    parseStackSelection(stage.data),
  )
  const [showAddDep, setShowAddDep] = useState(false)

  const hasSelections = Object.values(stackSelection.selections).some(Boolean)

  useEffect(() => {
    if (stage.data && Object.keys(stage.data).length > 0) {
      setStackSelection(parseStackSelection(stage.data))
    }
  }, [stage.data])

  const updateStackSelection = useCallback(
    (updater: Partial<StackSelection> | ((prev: StackSelection) => StackSelection)) => {
      setStackSelection((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
        setEditorData(next as unknown as Record<string, unknown>)
        setEditorDirty(true)
        return next
      })
    },
    [setEditorData, setEditorDirty],
  )

  function handleCategoryChange(category: StackCategory, optionId: string) {
    updateStackSelection((prev) => ({
      ...prev,
      selections: { ...prev.selections, [category]: optionId },
    }))
  }

  function handleDependenciesChange(dependencies: Dependency[]) {
    updateStackSelection({ dependencies })
  }

  function handleAddDependency(dependency: Dependency) {
    updateStackSelection((prev) => ({
      ...prev,
      dependencies: [...prev.dependencies, dependency],
    }))
  }

  return (
    <div className="space-y-6">
      {/* View toggle and content */}
      {hasSelections && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">Technology Stack</h3>
            <StackViewToggle mode={viewMode} onToggle={setViewMode} />
          </div>

          {viewMode === 'visual' && (
            <div className="space-y-6">
              {stackSelection.recommendation && (
                <StackRecommendation recommendation={stackSelection.recommendation} />
              )}
              <CategoryPicker
                categories={CATEGORIES}
                selections={stackSelection.selections}
                onChange={handleCategoryChange}
              />
              <DependencyList
                dependencies={stackSelection.dependencies}
                onChange={handleDependenciesChange}
                onAddClick={() => setShowAddDep(true)}
              />
              <StructurePreview structure={stackSelection.structure} />
            </div>
          )}

          {viewMode === 'packagejson' && (
            <SchemaPreview
              schema={generatePackageJson(stackSelection)}
              language="json"
            />
          )}

          {viewMode === 'json' && (
            <SchemaPreview
              schema={JSON.stringify(stackSelection, null, 2)}
              language="json"
            />
          )}
        </>
      )}

      {/* Empty state */}
      {!hasSelections && stage.status === 'active' && (
        <div className="flex flex-col items-center justify-center gap-2 py-8">
          <p className="text-xs text-zinc-300">
            Click Generate to get AI-recommended stack for your project.
          </p>
        </div>
      )}

      {/* Add Dependency Dialog */}
      <AddDependencyDialog
        open={showAddDep}
        onOpenChange={setShowAddDep}
        onAdd={handleAddDependency}
      />
    </div>
  )
}
