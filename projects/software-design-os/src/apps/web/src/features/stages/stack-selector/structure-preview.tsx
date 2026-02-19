import { useState, useEffect } from 'react'
import { ChevronRight, ChevronDown, Folder, FolderOpen, File } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FolderNode } from './types'

interface StructurePreviewProps {
  structure: FolderNode
}

interface TreeNodeProps {
  node: FolderNode
  depth: number
  path: string
  expanded: Set<string>
  onToggle: (path: string) => void
}

function TreeNode({ node, depth, path, expanded, onToggle }: TreeNodeProps) {
  const isFolder = node.type === 'folder'
  const isOpen = expanded.has(path)
  const hasChildren = isFolder && node.children && node.children.length > 0

  return (
    <>
      {isFolder ? (
        <button
          type="button"
          aria-expanded={isOpen}
          aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${node.name}`}
          onClick={() => onToggle(path)}
          className="flex w-full items-center gap-1.5 rounded px-2 py-0.5 text-left text-xs transition-colors hover:bg-zinc-100"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {isOpen ? (
            <ChevronDown className="h-3 w-3 shrink-0 text-zinc-400" />
          ) : (
            <ChevronRight className="h-3 w-3 shrink-0 text-zinc-400" />
          )}
          {isOpen ? (
            <FolderOpen className="h-3.5 w-3.5 shrink-0 text-warning-500" />
          ) : (
            <Folder className="h-3.5 w-3.5 shrink-0 text-warning-500" />
          )}
          <span className="font-mono font-medium text-zinc-900">{node.name}</span>
        </button>
      ) : (
        <div
          className="flex w-full items-center gap-1.5 rounded px-2 py-0.5 text-xs"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          <span className="h-3 w-3 shrink-0" />
          <File className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
          <span className="font-mono text-zinc-600">{node.name}</span>
        </div>
      )}
      {isFolder && isOpen && hasChildren && (
        <>
          {node.children!.map((child) => {
            const childPath = `${path}/${child.name}`
            return (
              <TreeNode
                key={childPath}
                node={child}
                depth={depth + 1}
                path={childPath}
                expanded={expanded}
                onToggle={onToggle}
              />
            )
          })}
        </>
      )}
    </>
  )
}

export function StructurePreview({ structure }: StructurePreviewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    return new Set([structure.name])
  })

  useEffect(() => {
    setExpanded(new Set([structure.name]))
  }, [structure.name])

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

  if (!structure.children || structure.children.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-zinc-400">No folder structure generated yet.</p>
    )
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-700">Project Structure</label>
      <div className="rounded-lg border border-zinc-200 bg-white py-2">
        <TreeNode
          node={structure}
          depth={0}
          path={structure.name}
          expanded={expanded}
          onToggle={handleToggle}
        />
      </div>
    </div>
  )
}
