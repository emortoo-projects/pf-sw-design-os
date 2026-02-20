import { useMemo } from 'react'
import type { PromptContract } from './types'

interface DependencyGraphProps {
  contracts: PromptContract[]
  onSelectContract: (id: string) => void
}

interface NodeLayout {
  id: string
  title: string
  type: string
  status: string
  level: number
  col: number
  x: number
  y: number
}

const NODE_W = 160
const NODE_H = 40
const H_GAP = 40
const V_GAP = 60

const STATUS_FILL: Record<string, string> = {
  backlog: '#e4e4e7',
  ready: '#bfdbfe',
  in_progress: '#fde68a',
  in_review: '#e9d5ff',
  done: '#bbf7d0',
}

const STATUS_STROKE: Record<string, string> = {
  backlog: '#a1a1aa',
  ready: '#3b82f6',
  in_progress: '#eab308',
  in_review: '#a855f7',
  done: '#22c55e',
}

export function ContractDependencyGraph({ contracts, onSelectContract }: DependencyGraphProps) {
  const { nodes, edges, width, height } = useMemo(() => {
    if (contracts.length === 0) return { nodes: [], edges: [], width: 0, height: 0 }

    // Topological sort (Kahn's algorithm) → assign levels
    const idSet = new Set(contracts.map((c) => c.id))
    const inDegree: Record<string, number> = {}
    const adjList: Record<string, string[]> = {}

    for (const c of contracts) {
      inDegree[c.id] = 0
      adjList[c.id] = []
    }

    for (const c of contracts) {
      for (const dep of c.dependencies) {
        if (idSet.has(dep)) {
          adjList[dep].push(c.id)
          inDegree[c.id]++
        }
      }
    }

    // BFS levels
    const levels: Record<string, number> = {}
    const queue: string[] = []
    for (const c of contracts) {
      if (inDegree[c.id] === 0) {
        queue.push(c.id)
        levels[c.id] = 0
      }
    }

    let head = 0
    while (head < queue.length) {
      const current = queue[head++]
      for (const next of adjList[current]) {
        levels[next] = Math.max(levels[next] ?? 0, levels[current] + 1)
        inDegree[next]--
        if (inDegree[next] === 0) {
          queue.push(next)
        }
      }
    }

    // Assign column positions within each level
    const levelGroups: Record<number, string[]> = {}
    for (const c of contracts) {
      const level = levels[c.id] ?? 0
      if (!levelGroups[level]) levelGroups[level] = []
      levelGroups[level].push(c.id)
    }

    const contractMap = new Map(contracts.map((c) => [c.id, c]))
    const nodeLayouts: NodeLayout[] = []

    for (const [levelStr, ids] of Object.entries(levelGroups)) {
      const level = parseInt(levelStr, 10)
      ids.forEach((id, col) => {
        const c = contractMap.get(id)!
        nodeLayouts.push({
          id: c.id,
          title: c.title.length > 22 ? c.title.slice(0, 20) + '...' : c.title,
          type: c.type,
          status: c.status,
          level,
          col,
          x: col * (NODE_W + H_GAP) + 20,
          y: level * (NODE_H + V_GAP) + 20,
        })
      })
    }

    // Build edges
    const nodeMap = new Map(nodeLayouts.map((n) => [n.id, n]))
    const edgeList: Array<{ from: NodeLayout; to: NodeLayout }> = []

    for (const c of contracts) {
      const toNode = nodeMap.get(c.id)
      if (!toNode) continue
      for (const dep of c.dependencies) {
        const fromNode = nodeMap.get(dep)
        if (fromNode) edgeList.push({ from: fromNode, to: toNode })
      }
    }

    const maxLevel = Math.max(...nodeLayouts.map((n) => n.level), 0)
    const maxCols = Math.max(
      ...Object.values(levelGroups).map((ids) => ids.length),
      1,
    )

    return {
      nodes: nodeLayouts,
      edges: edgeList,
      width: maxCols * (NODE_W + H_GAP) + 40,
      height: (maxLevel + 1) * (NODE_H + V_GAP) + 40,
    }
  }, [contracts])

  if (contracts.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-zinc-400">
        No contracts to display
      </div>
    )
  }

  return (
    <div className="overflow-auto rounded-lg border border-zinc-200 bg-zinc-50">
      <svg width={width} height={height} className="min-w-full">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#a1a1aa" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map((edge, i) => {
          const x1 = edge.from.x + NODE_W / 2
          const y1 = edge.from.y + NODE_H
          const x2 = edge.to.x + NODE_W / 2
          const y2 = edge.to.y
          const cy1 = y1 + V_GAP / 3
          const cy2 = y2 - V_GAP / 3

          return (
            <path
              key={i}
              d={`M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`}
              fill="none"
              stroke="#a1a1aa"
              strokeWidth={1.5}
              markerEnd="url(#arrow)"
            />
          )
        })}

        {/* Nodes */}
        {nodes.map((node) => (
          <g
            key={node.id}
            className="cursor-pointer"
            onClick={() => onSelectContract(node.id)}
          >
            <rect
              x={node.x}
              y={node.y}
              width={NODE_W}
              height={NODE_H}
              rx={8}
              fill={STATUS_FILL[node.status] ?? '#e4e4e7'}
              stroke={STATUS_STROKE[node.status] ?? '#a1a1aa'}
              strokeWidth={1.5}
            />
            <text
              x={node.x + NODE_W / 2}
              y={node.y + NODE_H / 2 + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-zinc-800 text-[11px] font-medium"
            >
              {node.title}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
