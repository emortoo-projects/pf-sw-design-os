export interface ProblemSolution {
  id: string
  problem: string
  solution: string
}

export interface Feature {
  id: string
  name: string
  description: string
}

export interface Persona {
  id: string
  name: string
  description: string
  icon?: string
}

export interface ProductDefinition {
  name: string
  tagline: string
  description: string
  problems: ProblemSolution[]
  features: Feature[]
  personas: Persona[]
}

export function createEmptyProductDefinition(): ProductDefinition {
  return {
    name: '',
    tagline: '',
    description: '',
    problems: [],
    features: [],
    personas: [],
  }
}

let idCounter = 0
export function generateId(): string {
  return `item-${Date.now()}-${++idCounter}`
}
