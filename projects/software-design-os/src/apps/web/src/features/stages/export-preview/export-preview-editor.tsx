import { useState, useEffect } from 'react'
import type { Stage } from '@sdos/shared'
import { SDPTreeView } from './sdp-tree-view'
import { FilePreview } from './file-preview'
import { ValidationResults } from './validation-results'
import { ExportActions } from './export-actions'
import type { ExportPreviewData, SDPFileNode } from './types'
import { createEmptyExportPreviewData } from './types'

interface ExportPreviewEditorProps {
  stage: Stage
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

export function ExportPreviewEditor({ stage }: ExportPreviewEditorProps) {
  const [exportData, setExportData] = useState<ExportPreviewData>(() =>
    parseExportData(stage.data),
  )
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<SDPFileNode | null>(null)

  const hasContent = exportData.tree.children.length > 0

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

  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8">
        <p className="text-xs text-zinc-300">
          Click Generate to assemble your Software Design Package from all completed stages.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <ExportActions
        manifest={exportData.manifest}
        totalSizeBytes={exportData.totalSizeBytes}
        validationHasErrors={validationHasErrors}
      />

      <div className="flex gap-0 rounded-lg border border-zinc-200 overflow-hidden" style={{ height: '480px' }}>
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
