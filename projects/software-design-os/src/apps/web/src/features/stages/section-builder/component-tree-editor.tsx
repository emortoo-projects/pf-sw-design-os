import { useState, useEffect } from 'react'
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  IndentIncrease,
  IndentDecrease,
  Plus,
  Trash2,
  Component,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { ComponentNode } from './types'
import {
  flattenTree,
  updateNodeInTree,
  removeNodeFromTree,
  addChildNode,
  moveNodeInSiblings,
  indentNode,
  outdentNode,
  createEmptyComponentNode,
} from './types'

interface ComponentTreeEditorProps {
  components: ComponentNode[]
  onChange: (components: ComponentNode[]) => void
}

interface TreeNodeRowProps {
  node: ComponentNode
  depth: number
  indexInParent: number
  siblingCount: number
  expanded: Set<string>
  editingId: string | null
  editValue: string
  onToggle: (id: string) => void
  onStartEdit: (id: string, name: string) => void
  onEditChange: (value: string) => void
  onEditSave: () => void
  onEditCancel: () => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onIndent: (id: string) => void
  onOutdent: (id: string) => void
  onAddChild: (id: string) => void
  onRemove: (id: string) => void
}

function TreeNodeRow({
  node,
  depth,
  indexInParent,
  siblingCount,
  expanded,
  editingId,
  editValue,
  onToggle,
  onStartEdit,
  onEditChange,
  onEditSave,
  onEditCancel,
  onMoveUp,
  onMoveDown,
  onIndent,
  onOutdent,
  onAddChild,
  onRemove,
}: TreeNodeRowProps) {
  const hasChildren = node.children.length > 0
  const isOpen = expanded.has(node.id)
  const isEditing = editingId === node.id

  return (
    <>
      <div
        className="group flex items-center gap-1 rounded py-0.5 hover:bg-zinc-50"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(node.id)}
            className="shrink-0 rounded p-0.5 text-zinc-400 hover:bg-zinc-100"
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Collapse' : 'Expand'}
          >
            {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        ) : (
          <span className="w-5" />
        )}

        <Component className="h-3.5 w-3.5 shrink-0 text-primary-500" />

        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onEditSave()
              if (e.key === 'Escape') onEditCancel()
            }}
            onBlur={onEditSave}
            autoFocus
            className="flex-1 rounded border border-primary-300 bg-white px-1.5 py-0.5 text-xs font-mono font-medium outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => onStartEdit(node.id, node.name)}
            className="truncate text-xs font-mono font-medium text-zinc-900 hover:text-primary-600"
          >
            {node.name}
          </button>
        )}

        {node.description && (
          <span className="truncate text-xs text-zinc-400">{node.description}</span>
        )}

        {node.props.length > 0 && (
          <span className="shrink-0 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
            {node.props.length} props
          </span>
        )}

        <div className="ml-auto hidden shrink-0 items-center gap-0.5 group-hover:flex">
          <button
            type="button"
            onClick={() => onMoveUp(node.id)}
            disabled={indexInParent === 0}
            className={cn('rounded p-0.5', indexInParent === 0 ? 'text-zinc-200' : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600')}
            aria-label="Move up"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(node.id)}
            disabled={indexInParent === siblingCount - 1}
            className={cn('rounded p-0.5', indexInParent === siblingCount - 1 ? 'text-zinc-200' : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600')}
            aria-label="Move down"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onIndent(node.id)}
            disabled={indexInParent === 0}
            className={cn('rounded p-0.5', indexInParent === 0 ? 'text-zinc-200' : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600')}
            aria-label="Indent"
          >
            <IndentIncrease className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onOutdent(node.id)}
            disabled={depth === 0}
            className={cn('rounded p-0.5', depth === 0 ? 'text-zinc-200' : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600')}
            aria-label="Outdent"
          >
            <IndentDecrease className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onAddChild(node.id)}
            className="rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-primary-500"
            aria-label="Add child"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onRemove(node.id)}
            className="rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-red-500"
            aria-label="Remove"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {hasChildren && isOpen &&
        node.children.map((child, i) => (
          <TreeNodeRow
            key={child.id}
            node={child}
            depth={depth + 1}
            indexInParent={i}
            siblingCount={node.children.length}
            expanded={expanded}
            editingId={editingId}
            editValue={editValue}
            onToggle={onToggle}
            onStartEdit={onStartEdit}
            onEditChange={onEditChange}
            onEditSave={onEditSave}
            onEditCancel={onEditCancel}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onIndent={onIndent}
            onOutdent={onOutdent}
            onAddChild={onAddChild}
            onRemove={onRemove}
          />
        ))}
    </>
  )
}

function computeExpandedIds(nodes: ComponentNode[]): Set<string> {
  const ids = new Set<string>()
  for (const flat of flattenTree(nodes)) {
    if (flat.node.children.length > 0) ids.add(flat.node.id)
  }
  return ids
}

export function ComponentTreeEditor({ components, onChange }: ComponentTreeEditorProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => computeExpandedIds(components))

  useEffect(() => {
    setExpanded(computeExpandedIds(components))
  }, [components])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  function handleToggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleStartEdit(id: string, name: string) {
    setEditingId(id)
    setEditValue(name)
  }

  function handleEditSave() {
    if (editingId && editValue.trim()) {
      onChange(updateNodeInTree(components, editingId, { name: editValue.trim() }))
    }
    setEditingId(null)
    setEditValue('')
  }

  function handleEditCancel() {
    setEditingId(null)
    setEditValue('')
  }

  function handleAddRoot() {
    const node = createEmptyComponentNode()
    onChange([...components, node])
  }

  function handleAddChild(parentId: string) {
    const node = createEmptyComponentNode()
    onChange(addChildNode(components, parentId, node))
    setExpanded((prev) => new Set(prev).add(parentId))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-zinc-700">Component Tree</label>
        <Button variant="ghost" size="sm" onClick={handleAddRoot} className="h-6 gap-1 text-xs">
          <Plus className="h-3 w-3" />
          Add Component
        </Button>
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white">
        {components.length === 0 ? (
          <p className="p-4 text-center text-xs text-zinc-400">No components yet. Add one to start building.</p>
        ) : (
          <div className="py-1">
            {components.map((comp, i) => (
              <TreeNodeRow
                key={comp.id}
                node={comp}
                depth={0}
                indexInParent={i}
                siblingCount={components.length}
                expanded={expanded}
                editingId={editingId}
                editValue={editValue}
                onToggle={handleToggle}
                onStartEdit={handleStartEdit}
                onEditChange={setEditValue}
                onEditSave={handleEditSave}
                onEditCancel={handleEditCancel}
                onMoveUp={(id) => onChange(moveNodeInSiblings(components, id, 'up'))}
                onMoveDown={(id) => onChange(moveNodeInSiblings(components, id, 'down'))}
                onIndent={(id) => onChange(indentNode(components, id))}
                onOutdent={(id) => onChange(outdentNode(components, id))}
                onAddChild={handleAddChild}
                onRemove={(id) => onChange(removeNodeFromTree(components, id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
