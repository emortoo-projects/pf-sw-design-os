export type StackCategory = 'frontend' | 'backend' | 'styling' | 'stateManagement' | 'testing' | 'orm'

export interface CategoryOption {
  id: string
  name: string
  description: string
}

export interface CategoryConfig {
  id: StackCategory
  label: string
  options: CategoryOption[]
}

export interface Dependency {
  id: string
  name: string
  version: string
  description?: string
  dev: boolean
}

export interface FolderNode {
  name: string
  type: 'folder' | 'file'
  children?: FolderNode[]
}

export interface StackRecommendationData {
  confidence: number
  reasoning: string
  summary: string
}

export interface StackSelection {
  selections: Record<StackCategory, string>
  dependencies: Dependency[]
  structure: FolderNode
  recommendation?: StackRecommendationData
}

export const CATEGORIES: CategoryConfig[] = [
  {
    id: 'frontend',
    label: 'Frontend Framework',
    options: [
      { id: 'react', name: 'React', description: 'Component-based UI library with huge ecosystem' },
      { id: 'nextjs', name: 'Next.js', description: 'Full-stack React framework with SSR and file-based routing' },
      { id: 'vue', name: 'Vue', description: 'Progressive framework with gentle learning curve' },
      { id: 'svelte', name: 'Svelte', description: 'Compile-time framework with minimal runtime overhead' },
    ],
  },
  {
    id: 'backend',
    label: 'Backend Framework',
    options: [
      { id: 'hono', name: 'Hono', description: 'Ultrafast, lightweight web framework for the edge' },
      { id: 'express', name: 'Express', description: 'Minimal and flexible Node.js web framework' },
      { id: 'fastapi', name: 'FastAPI', description: 'Modern Python framework with automatic OpenAPI docs' },
    ],
  },
  {
    id: 'styling',
    label: 'Styling',
    options: [
      { id: 'tailwindcss', name: 'Tailwind CSS', description: 'Utility-first CSS framework for rapid UI development' },
      { id: 'css-modules', name: 'CSS Modules', description: 'Scoped CSS with automatic class name hashing' },
      { id: 'styled-components', name: 'styled-components', description: 'CSS-in-JS with tagged template literals' },
    ],
  },
  {
    id: 'stateManagement',
    label: 'State Management',
    options: [
      { id: 'zustand', name: 'Zustand', description: 'Small, fast state management with hooks-based API' },
      { id: 'redux', name: 'Redux', description: 'Predictable state container with middleware ecosystem' },
      { id: 'jotai', name: 'Jotai', description: 'Primitive and flexible atomic state management' },
    ],
  },
  {
    id: 'testing',
    label: 'Testing',
    options: [
      { id: 'vitest', name: 'Vitest', description: 'Vite-native test runner with Jest-compatible API' },
      { id: 'jest', name: 'Jest', description: 'Batteries-included testing framework by Meta' },
    ],
  },
  {
    id: 'orm',
    label: 'ORM',
    options: [
      { id: 'drizzle', name: 'Drizzle', description: 'TypeScript ORM with SQL-like query builder' },
      { id: 'prisma', name: 'Prisma', description: 'Type-safe ORM with declarative schema and migrations' },
    ],
  },
]

export function createEmptyStackSelection(): StackSelection {
  return {
    selections: {
      frontend: '',
      backend: '',
      styling: '',
      stateManagement: '',
      testing: '',
      orm: '',
    },
    dependencies: [],
    structure: { name: 'root', type: 'folder', children: [] },
  }
}

let idCounter = 0
export function generateId(prefix = 'dep'): string {
  return `${prefix}-${Date.now()}-${++idCounter}`
}
