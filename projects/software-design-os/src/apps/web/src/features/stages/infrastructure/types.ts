export type HostingProvider = 'docker-local' | 'railway' | 'flyio' | 'modal' | 'vercel-backend' | 'custom'

export interface HostingOption {
  id: HostingProvider
  name: string
  description: string
  bestFor: string
  pricingHint: string
  icon: string
}

export interface DockerConfig {
  dockerfile: string
  compose: string
}

export interface CIStep {
  id: string
  name: string
  command: string
  enabled: boolean
}

export interface CIStage {
  id: string
  name: string
  steps: CIStep[]
}

export interface CIPipeline {
  name: string
  trigger: string
  stages: CIStage[]
}

export interface EnvVar {
  id: string
  name: string
  required: boolean
  defaultValue: string
  description: string
}

export interface InfrastructureData {
  hosting: HostingProvider
  docker: DockerConfig
  ciPipeline: CIPipeline
  envVars: EnvVar[]
}

export const HOSTING_OPTIONS: HostingOption[] = [
  {
    id: 'docker-local',
    name: 'Docker (Local)',
    description: 'Containerized local development and self-hosted deployment',
    bestFor: 'Self-hosted / on-prem',
    pricingHint: 'Free (self-managed)',
    icon: 'Container',
  },
  {
    id: 'railway',
    name: 'Railway',
    description: 'Deploy from GitHub with zero config. Managed Postgres included.',
    bestFor: 'Full-stack apps',
    pricingHint: 'From $5/mo',
    icon: 'Train',
  },
  {
    id: 'flyio',
    name: 'Fly.io',
    description: 'Deploy Docker containers to edge locations worldwide',
    bestFor: 'Low-latency global apps',
    pricingHint: 'From $0/mo (free tier)',
    icon: 'Globe',
  },
  {
    id: 'modal',
    name: 'Modal',
    description: 'Serverless compute for AI/ML workloads with GPU support',
    bestFor: 'AI/ML backends',
    pricingHint: 'Pay per compute-second',
    icon: 'Cpu',
  },
  {
    id: 'vercel-backend',
    name: 'Vercel',
    description: 'Edge-first platform with serverless functions and edge middleware',
    bestFor: 'Frontend-heavy apps',
    pricingHint: 'Free tier available',
    icon: 'Triangle',
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Bring your own infrastructure — AWS, GCP, Azure, or bare metal',
    bestFor: 'Enterprise / custom needs',
    pricingHint: 'Varies',
    icon: 'Settings',
  },
]

// --- ID generation ---

let idCounter = 0
export function generateId(prefix = 'infra'): string {
  return `${prefix}-${Date.now()}-${++idCounter}`
}

// --- Factory functions ---

export function createEmptyCIStep(): CIStep {
  return {
    id: generateId('step'),
    name: '',
    command: '',
    enabled: true,
  }
}

export function createEmptyEnvVar(): EnvVar {
  return {
    id: generateId('env'),
    name: '',
    required: false,
    defaultValue: '',
    description: '',
  }
}

export function createEmptyInfrastructureData(): InfrastructureData {
  return {
    hosting: 'docker-local',
    docker: { dockerfile: '', compose: '' },
    ciPipeline: {
      name: '',
      trigger: '',
      stages: [
        { id: generateId('stage'), name: 'test', steps: [] },
        { id: generateId('stage'), name: 'build', steps: [] },
        { id: generateId('stage'), name: 'deploy', steps: [] },
      ],
    },
    envVars: [],
  }
}
