export type SDPFileFormat = 'json' | 'md' | 'sql' | 'yaml'
export type ValidationSeverity = 'pass' | 'warning' | 'error'
export type ValidationCategory =
  | 'entity-references'
  | 'api-endpoint-validity'
  | 'design-token-consistency'
  | 'section-data-requirements'

export interface ValidationResult {
  id: string
  category: ValidationCategory
  severity: ValidationSeverity
  message: string
  source?: string
  target?: string
}

export interface SDPFileNode {
  name: string
  type: 'file'
  format: SDPFileFormat
  content: string
  sizeBytes: number
  validation: ValidationSeverity
}

export interface SDPFolderNode {
  name: string
  type: 'folder'
  children: SDPTreeNode[]
}

export type SDPTreeNode = SDPFileNode | SDPFolderNode

export interface SDPManifest {
  name: string
  version: string
  schemaVersion: string
  stages: Record<string, string>
  files: Record<string, string | string[]>
}

export type ExportFormat = 'folder' | 'zip'

export interface ExportPreviewData {
  manifest: SDPManifest
  tree: SDPFolderNode
  validation: ValidationResult[]
  readme: string
  totalSizeBytes: number
}

// --- Helpers ---

let idCounter = 0
export function generateId(prefix = 'exp'): string {
  return `${prefix}-${Date.now()}-${++idCounter}`
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, i)
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

const CATEGORY_LABELS: Record<ValidationCategory, string> = {
  'entity-references': 'Entity References',
  'api-endpoint-validity': 'API Endpoint Validity',
  'design-token-consistency': 'Design Token Consistency',
  'section-data-requirements': 'Section Data Requirements',
}

export function getValidationCategoryLabel(category: ValidationCategory): string {
  return CATEGORY_LABELS[category]
}

export function createEmptyExportPreviewData(): ExportPreviewData {
  return {
    manifest: {
      name: '',
      version: '0.0.0',
      schemaVersion: '1.0.0',
      stages: {},
      files: {},
    },
    tree: { name: 'sdp', type: 'folder', children: [] },
    validation: [],
    readme: '',
    totalSizeBytes: 0,
  }
}
