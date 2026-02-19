import { useState, useEffect, useCallback } from 'react'
import type { Stage } from '@sdos/shared'
import { usePipelineStore } from '@/stores/pipeline-store'
import { SchemaPreview } from '@/features/stages/database-designer/schema-preview'
import { SectionViewToggle, type SectionViewMode } from './section-view-toggle'
import { SectionTabs } from './section-tabs'
import { SectionDetailHeader } from './section-detail-header'
import { ComponentTreeEditor } from './component-tree-editor'
import { DataRequirements } from './data-requirements'
import { InteractionEditor } from './interaction-editor'
import { StateManagementNotes } from './state-management-notes'
import { SectionPreview } from './section-preview'
import type { SectionsData, SectionSpec, ComponentNode, Interaction, StateManagement } from './types'
import { createEmptySectionsData, createEmptySection } from './types'

interface SectionBuilderEditorProps {
  stage: Stage
}

function isComponentNode(v: unknown): v is ComponentNode {
  if (typeof v !== 'object' || v === null) return false
  const n = v as ComponentNode
  return (
    typeof n.id === 'string' &&
    typeof n.name === 'string' &&
    typeof n.description === 'string' &&
    Array.isArray(n.props) &&
    Array.isArray(n.children) &&
    n.children.every(isComponentNode)
  )
}

function isInteraction(v: unknown): v is Interaction {
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as Interaction).id === 'string' &&
    typeof (v as Interaction).trigger === 'string' &&
    typeof (v as Interaction).behavior === 'string'
  )
}

function isStateManagement(v: unknown): v is StateManagement {
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as StateManagement).serverState === 'string' &&
    typeof (v as StateManagement).clientState === 'string'
  )
}

function isSectionSpec(v: unknown): v is SectionSpec {
  if (typeof v !== 'object' || v === null) return false
  const s = v as Record<string, unknown>
  return (
    typeof s.id === 'string' &&
    typeof s.name === 'string' &&
    typeof s.route === 'string' &&
    typeof s.description === 'string' &&
    Array.isArray(s.components) &&
    s.components.every(isComponentNode) &&
    Array.isArray(s.dataRequirements) &&
    s.dataRequirements.every((r: unknown) => typeof r === 'string') &&
    Array.isArray(s.interactions) &&
    s.interactions.every(isInteraction) &&
    isStateManagement(s.stateManagement)
  )
}

function isSectionsData(data: unknown): data is SectionsData {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return Array.isArray(d.sections) && d.sections.every(isSectionSpec)
}

function parseSectionsData(data: Record<string, unknown> | undefined): SectionsData {
  if (!data || !isSectionsData(data)) return createEmptySectionsData()
  return { sections: data.sections }
}

export function SectionBuilderEditor({ stage }: SectionBuilderEditorProps) {
  const { setEditorDirty, setEditorData } = usePipelineStore()
  const [viewMode, setViewMode] = useState<SectionViewMode>('visual')
  const [sectionsData, setSectionsData] = useState<SectionsData>(() =>
    parseSectionsData(stage.data),
  )
  const [activeTabId, setActiveTabId] = useState<string | null>(() =>
    sectionsData.sections.length > 0 ? sectionsData.sections[0].id : null,
  )

  const hasContent = sectionsData.sections.length > 0

  useEffect(() => {
    if (stage.data && Object.keys(stage.data).length > 0) {
      const parsed = parseSectionsData(stage.data)
      setSectionsData(parsed)
      if (parsed.sections.length > 0) {
        setActiveTabId((prev) => {
          if (prev && parsed.sections.some((s) => s.id === prev)) return prev
          return parsed.sections[0].id
        })
      }
    }
  }, [stage.data])

  const updateSectionsData = useCallback(
    (updater: Partial<SectionsData> | ((prev: SectionsData) => SectionsData)) => {
      setSectionsData((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
        setEditorData(next as unknown as Record<string, unknown>)
        setEditorDirty(true)
        return next
      })
    },
    [setEditorData, setEditorDirty],
  )

  function updateSection(sectionId: string, updates: Partial<SectionSpec>) {
    updateSectionsData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, ...updates } : s,
      ),
    }))
  }

  function handleAddSection() {
    const section = createEmptySection()
    updateSectionsData((prev) => ({
      ...prev,
      sections: [...prev.sections, section],
    }))
    setActiveTabId(section.id)
  }

  function handleRemoveSection(id: string) {
    const remaining = sectionsData.sections.filter((s) => s.id !== id)
    const nextActiveId = activeTabId === id
      ? (remaining[0]?.id ?? null)
      : activeTabId

    updateSectionsData((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== id),
    }))
    setActiveTabId(nextActiveId)
  }

  const activeSection = sectionsData.sections.find((s) => s.id === activeTabId) ?? null

  return (
    <div className="space-y-6">
      {hasContent && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">Section Builder</h3>
            <SectionViewToggle mode={viewMode} onToggle={setViewMode} />
          </div>

          {viewMode === 'visual' && (
            <div className="space-y-6">
              <SectionTabs
                sections={sectionsData.sections}
                activeId={activeTabId}
                onSelect={setActiveTabId}
                onAdd={handleAddSection}
                onRemove={handleRemoveSection}
              />

              {activeSection && (
                <div className="space-y-5">
                  <SectionDetailHeader
                    section={activeSection}
                    onChange={(updates) => updateSection(activeSection.id, updates)}
                  />
                  <ComponentTreeEditor
                    components={activeSection.components}
                    onChange={(components) => updateSection(activeSection.id, { components })}
                  />
                  <DataRequirements
                    requirements={activeSection.dataRequirements}
                    onChange={(dataRequirements) => updateSection(activeSection.id, { dataRequirements })}
                  />
                  <InteractionEditor
                    interactions={activeSection.interactions}
                    onChange={(interactions) => updateSection(activeSection.id, { interactions })}
                  />
                  <StateManagementNotes
                    stateManagement={activeSection.stateManagement}
                    onChange={(stateManagement) => updateSection(activeSection.id, { stateManagement })}
                  />
                  <SectionPreview section={activeSection} />
                </div>
              )}

              {!activeSection && (
                <div className="flex flex-col items-center justify-center gap-2 py-8">
                  <p className="text-xs text-zinc-300">Select a section tab to view its details.</p>
                </div>
              )}
            </div>
          )}

          {viewMode === 'json' && (
            <SchemaPreview
              schema={JSON.stringify(sectionsData, null, 2)}
              language="json"
            />
          )}
        </>
      )}

      {!hasContent && stage.status === 'active' && (
        <div className="flex flex-col items-center justify-center gap-2 py-8">
          <p className="text-xs text-zinc-300">
            Click Generate to create section specifications from your product definition.
          </p>
        </div>
      )}
    </div>
  )
}
