export interface ComponentNode {
  id: string
  name: string
  description: string
  props: string[]
  children: ComponentNode[]
}

export interface Interaction {
  id: string
  trigger: string
  behavior: string
}

export interface StateManagement {
  serverState: string
  clientState: string
}

export type SectionStatus = 'empty' | 'generated' | 'edited'

export interface SectionSpec {
  id: string
  name: string
  route: string
  description: string
  components: ComponentNode[]
  dataRequirements: string[]
  interactions: Interaction[]
  stateManagement: StateManagement
}

export interface SectionsData {
  sections: SectionSpec[]
}

// --- ID generation ---

let idCounter = 0
export function generateId(prefix = 'sec'): string {
  return `${prefix}-${Date.now()}-${++idCounter}`
}

// --- Factory functions ---

export function createEmptySection(): SectionSpec {
  return {
    id: generateId('section'),
    name: 'New Section',
    route: '/',
    description: '',
    components: [],
    dataRequirements: [],
    interactions: [],
    stateManagement: { serverState: '', clientState: '' },
  }
}

export function createEmptySectionsData(): SectionsData {
  return { sections: [] }
}

export function createEmptyComponentNode(): ComponentNode {
  return {
    id: generateId('comp'),
    name: 'NewComponent',
    description: '',
    props: [],
    children: [],
  }
}

export function createEmptyInteraction(): Interaction {
  return {
    id: generateId('int'),
    trigger: '',
    behavior: '',
  }
}

// --- Tree utilities ---

export interface FlatNode {
  node: ComponentNode
  depth: number
  parentId: string | null
  indexInParent: number
  siblingCount: number
}

export function flattenTree(nodes: ComponentNode[], depth = 0, parentId: string | null = null): FlatNode[] {
  const result: FlatNode[] = []
  for (let i = 0; i < nodes.length; i++) {
    result.push({ node: nodes[i], depth, parentId, indexInParent: i, siblingCount: nodes.length })
    if (nodes[i].children.length > 0) {
      result.push(...flattenTree(nodes[i].children, depth + 1, nodes[i].id))
    }
  }
  return result
}

export function findNode(nodes: ComponentNode[], id: string): ComponentNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = findNode(node.children, id)
    if (found) return found
  }
  return undefined
}

export function updateNodeInTree(nodes: ComponentNode[], id: string, updates: Partial<ComponentNode>): ComponentNode[] {
  return nodes.map((node) => {
    if (node.id === id) {
      return { ...node, ...updates }
    }
    if (node.children.length > 0) {
      return { ...node, children: updateNodeInTree(node.children, id, updates) }
    }
    return node
  })
}

export function removeNodeFromTree(nodes: ComponentNode[], id: string): ComponentNode[] {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) => ({
      ...node,
      children: removeNodeFromTree(node.children, id),
    }))
}

export function addChildNode(nodes: ComponentNode[], parentId: string, child: ComponentNode): ComponentNode[] {
  return nodes.map((node) => {
    if (node.id === parentId) {
      return { ...node, children: [...node.children, child] }
    }
    if (node.children.length > 0) {
      return { ...node, children: addChildNode(node.children, parentId, child) }
    }
    return node
  })
}

export function moveNodeInSiblings(nodes: ComponentNode[], id: string, direction: 'up' | 'down'): ComponentNode[] {
  const index = nodes.findIndex((n) => n.id === id)
  if (index === -1) {
    return nodes.map((node) => ({
      ...node,
      children: moveNodeInSiblings(node.children, id, direction),
    }))
  }
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= nodes.length) return nodes
  const result = [...nodes]
  ;[result[index], result[targetIndex]] = [result[targetIndex], result[index]]
  return result
}

export function indentNode(nodes: ComponentNode[], id: string): ComponentNode[] {
  const index = nodes.findIndex((n) => n.id === id)
  if (index === -1) {
    return nodes.map((node) => ({
      ...node,
      children: indentNode(node.children, id),
    }))
  }
  if (index === 0) return nodes
  const node = nodes[index]
  const newParent = nodes[index - 1]
  const remaining = nodes.filter((_, i) => i !== index)
  return remaining.map((n) => {
    if (n.id === newParent.id) {
      return { ...n, children: [...n.children, node] }
    }
    return n
  })
}

export function outdentNode(tree: ComponentNode[], id: string): ComponentNode[] {
  // Find the direct parent that contains the node as a child
  for (let i = 0; i < tree.length; i++) {
    const parent = tree[i]
    const childIndex = parent.children.findIndex((c) => c.id === id)
    if (childIndex !== -1) {
      // Found: remove from parent's children, insert after parent in this level
      const child = parent.children[childIndex]
      const updatedParent = { ...parent, children: parent.children.filter((_, ci) => ci !== childIndex) }
      const result = [...tree]
      result[i] = updatedParent
      result.splice(i + 1, 0, child)
      return result
    }
    // Recurse into children
    if (parent.children.length > 0) {
      const updated = outdentNode(parent.children, id)
      if (updated !== parent.children) {
        return tree.map((n, ni) => (ni === i ? { ...n, children: updated } : n))
      }
    }
  }
  return tree
}
