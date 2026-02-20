import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import type { Stage } from '@sdos/shared'
import { useStageMutations } from '@/hooks/use-stage-mutations'
import { SDPTreeView } from './sdp-tree-view'
import { FilePreview } from './file-preview'
import { ValidationResults } from './validation-results'
import { ExportActions } from './export-actions'
import { assembleSDPFromStages, buildStageInputsFromStages } from './assemble-sdp'
import type { ExportPreviewData, SDPFileNode } from './types'
import type { StageInputs } from './assemble-sdp'
import { createEmptyExportPreviewData } from './types'

interface ExportPreviewEditorProps {
  stage: Stage
  allStages?: Stage[]
}

// --- Runtime type guards ---

function isExportPreviewData(data: unknown): data is ExportPreviewData {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return (
    typeof d.manifest === 'object' &&
    d.manifest !== null &&
    typeof d.tree === 'object' &&
    d.tree !== null &&
    Array.isArray(d.validation) &&
    typeof d.readme === 'string' &&
    typeof d.totalSizeBytes === 'number'
  )
}

function parseExportData(data: Record<string, unknown> | undefined): ExportPreviewData {
  if (!data || !isExportPreviewData(data)) return createEmptyExportPreviewData()
  return data
}

export function ExportPreviewEditor({ stage, allStages }: ExportPreviewEditorProps) {
  const [exportData, setExportData] = useState<ExportPreviewData>(() =>
    parseExportData(stage.data),
  )
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<SDPFileNode | null>(null)
  const [isAssembling, setIsAssembling] = useState(false)
  const hasAutoAssembled = useRef(false)

  const mutations = useStageMutations(stage.projectId)

  const hasContent = exportData.tree.children.length > 0

  // Stable fingerprint for allStages to avoid recomputing on reference changes
  const stagesFingerprint = useMemo(
    () => allStages?.map((s) => `${s.stageNumber}:${s.updatedAt}`).join(','),
    [allStages],
  )

  // Build inputs from allStages to check completeness
  const stageInputs = useMemo(
    () => (allStages ? buildStageInputsFromStages(allStages) : null),
    [stagesFingerprint], // eslint-disable-line react-hooks/exhaustive-deps
  )

  // Stale detection: compare stage 9 updatedAt against max of stages 1-8
  const isStale = useMemo(() => {
    if (!hasContent || !allStages) return false
    const priorStages = allStages.filter((s) => s.stageNumber >= 1 && s.stageNumber <= 8)
    if (priorStages.length === 0) return false
    const maxPriorUpdatedAt = Math.max(
      ...priorStages.map((s) => new Date(s.updatedAt).getTime()),
    )
    const exportUpdatedAt = new Date(stage.updatedAt).getTime()
    return maxPriorUpdatedAt > exportUpdatedAt
  }, [hasContent, stagesFingerprint, stage.updatedAt]) // eslint-disable-line react-hooks/exhaustive-deps

  const assembleAndSave = useCallback((inputs: StageInputs) => {
    setIsAssembling(true)
    const data = assembleSDPFromStages(inputs)
    setExportData(data)
    mutations.save.mutate(
      { stageNumber: 9, data: data as unknown as Record<string, unknown> },
      { onSettled: () => setIsAssembling(false) },
    )
  }, [mutations.save])

  // Auto-assemble on mount when stage data is empty but inputs are available
  useEffect(() => {
    if (hasAutoAssembled.current || hasContent || !stageInputs || isAssembling) return
    hasAutoAssembled.current = true
    assembleAndSave(stageInputs)
  }, [hasContent, stageInputs, isAssembling, assembleAndSave])

  useEffect(() => {
    if (stage.data && Object.keys(stage.data).length > 0) {
      setExportData(parseExportData(stage.data))
      setSelectedFilePath(null)
      setSelectedFile(null)
    }
  }, [stage.data])

  const validationHasErrors = exportData.validation.some((r) => r.severity === 'error')

  function handleSelectFile(path: string, file: SDPFileNode) {
    setSelectedFilePath(path)
    setSelectedFile(file)
  }

  function handleReassemble() {
    if (!stageInputs) return
    assembleAndSave(stageInputs)
  }

  // Loading state during assembly
  if (isAssembling && !hasContent) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-800" />
        <p className="text-xs text-zinc-500">Assembling Software Design Package...</p>
      </div>
    )
  }

  // No inputs available — stages 1-8 incomplete
  if (!hasContent && !stageInputs) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8">
        <p className="text-sm font-medium text-zinc-700">Complete stages 1-8 first</p>
        <p className="text-xs text-zinc-400">
          All prior stages must have data before the export package can be assembled.
        </p>
      </div>
    )
  }

  // No content yet but inputs exist — prompt to generate
  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8">
        <p className="text-xs text-zinc-300">
          Click Generate to assemble your Software Design Package from all completed stages.
        </p>
      </div>
    )
  }

  // Derive project name from manifest for download
  const projectName = exportData.manifest.name || 'untitled-project'

  return (
    <div className="flex flex-col gap-3">
      {isStale && (
        <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-2">
          <p className="text-xs text-amber-800">
            Prior stages have been updated since this export was assembled.
          </p>
          <button
            onClick={handleReassemble}
            disabled={isAssembling}
            className="rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {isAssembling ? 'Regenerating...' : 'Regenerate'}
          </button>
        </div>
      )}

      <ExportActions
        manifest={exportData.manifest}
        tree={exportData.tree}
        projectName={projectName}
        totalSizeBytes={exportData.totalSizeBytes}
        validationHasErrors={validationHasErrors}
      />

      <div className="flex gap-0 rounded-lg border border-zinc-200 overflow-hidden h-[480px]">
        <div className="w-[300px] shrink-0 overflow-auto border-r border-zinc-200 bg-white p-2">
          <SDPTreeView
            tree={exportData.tree}
            selectedFilePath={selectedFilePath}
            onSelectFile={handleSelectFile}
          />
        </div>
        <div className="flex-1 bg-white">
          <FilePreview filePath={selectedFilePath} file={selectedFile} />
        </div>
      </div>

      <ValidationResults results={exportData.validation} />
    </div>
  )
}
