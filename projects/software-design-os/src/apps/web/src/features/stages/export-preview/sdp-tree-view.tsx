import { useState } from 'react'
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SDPFolderNode, SDPFileNode, SDPTreeNode, ValidationSeverity } from './types'
import { formatBytes } from './types'

interface SDPTreeViewProps {
  tree: SDPFolderNode
  selectedFilePath: string | null
  onSelectFile: (path: string, file: SDPFileNode) => void
}

const FORMAT_COLORS: Record<string, string> = {
  json: 'bg-blue-100 text-blue-700',
  md: 'bg-purple-100 text-purple-700',
  sql: 'bg-amber-100 text-amber-700',
  yaml: 'bg-green-100 text-green-700',
}

function ValidationIcon({ severity }: { severity: ValidationSeverity }) {
  switch (severity) {
    case 'pass':
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
    case 'warning':
      return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
    case 'error':
      return <XCircle className="h-3.5 w-3.5 text-red-500" />
  }
}

function TreeNode({
  node,
  path,
  depth,
  expanded,
  selectedFilePath,
  onToggle,
  onSelectFile,
}: {
  node: SDPTreeNode
  path: string
  depth: number
  expanded: Set<string>
  selectedFilePath: string | null
  onToggle: (path: string) => void
  onSelectFile: (path: string, file: SDPFileNode) => void
}) {
  const currentPath = `${path}/${node.name}`

  if (node.type === 'folder') {
    const isExpanded = expanded.has(currentPath)
    return (
      <div>
        <button
          onClick={() => onToggle(currentPath)}
          className="flex w-full items-center gap-1.5 rounded px-1 py-0.5 text-left text-sm hover:bg-zinc-100"
          style={{ paddingLeft: `${depth * 16 + 4}px` }}
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
          )}
          <Folder className="h-3.5 w-3.5 text-zinc-500" />
          <span className="font-medium text-zinc-700">{node.name}</span>
        </button>
        {isExpanded &&
          node.children.map((child) => (
            <TreeNode
              key={`${currentPath}/${child.name}`}
              node={child}
              path={currentPath}
              depth={depth + 1}
              expanded={expanded}
              selectedFilePath={selectedFilePath}
              onToggle={onToggle}
              onSelectFile={onSelectFile}
            />
          ))}
      </div>
    )
  }

  const isSelected = selectedFilePath === currentPath
  return (
    <button
      onClick={() => onSelectFile(currentPath, node)}
      className={cn(
        'flex w-full items-center gap-1.5 rounded px-1 py-0.5 text-left text-sm hover:bg-zinc-100',
        isSelected && 'bg-blue-50 border-l-2 border-blue-500',
      )}
      style={{ paddingLeft: `${depth * 16 + 4 + 18}px` }}
    >
      <FileText className="h-3.5 w-3.5 text-zinc-400" />
      <span className={cn('flex-1 truncate', isSelected ? 'text-blue-700 font-medium' : 'text-zinc-600')}>
        {node.name}
      </span>
      <span
        className={cn(
          'rounded px-1.5 py-0.5 text-[10px] font-medium',
          FORMAT_COLORS[node.format] ?? 'bg-zinc-100 text-zinc-600',
        )}
      >
        {node.format.toUpperCase()}
      </span>
      <span className="text-[10px] text-zinc-400">{formatBytes(node.sizeBytes)}</span>
      <ValidationIcon severity={node.validation} />
    </button>
  )
}

export function SDPTreeView({ tree, selectedFilePath, onSelectFile }: SDPTreeViewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    // Expand root and all top-level folders by default
    const initial = new Set<string>()
    initial.add(`/${tree.name}`)
    for (const child of tree.children) {
      if (child.type === 'folder') {
        initial.add(`/${tree.name}/${child.name}`)
      }
    }
    return initial
  })

  function handleToggle(path: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  return (
    <div className="space-y-0.5 overflow-auto">
      <TreeNode
        node={tree}
        path=""
        depth={0}
        expanded={expanded}
        selectedFilePath={selectedFilePath}
        onToggle={handleToggle}
        onSelectFile={onSelectFile}
      />
    </div>
  )
}
