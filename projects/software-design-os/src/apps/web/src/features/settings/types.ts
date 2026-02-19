export interface UserProfile {
  id: string
  name: string
  email: string
  avatarUrl: string
  preferences: {
    defaultDbEngine: string
    defaultStack: string
    defaultAiProvider: string
  }
}

export type AIProviderType = 'anthropic' | 'openai' | 'openai-compatible'

export interface AIProviderConfig {
  id: string
  label: string
  providerType: AIProviderType
  model: string
  apiKeySet: boolean
  isDefault: boolean
  status: 'connected' | 'error' | 'untested'
  lastTestedAt?: string
}

export interface MCPToken {
  id: string
  label: string
  projectId: string
  projectName: string
  tokenPrefix: string
  createdAt: string
  lastUsedAt?: string
  expiresAt: string
  revoked: boolean
}

export type UsagePeriod = '7d' | '30d' | '90d' | 'all'

export interface UsageDataPoint {
  date: string
  tokens: number
  cost: number
}

export interface UsageByProject {
  projectId: string
  projectName: string
  tokens: number
  cost: number
}

export interface UsageByModel {
  model: string
  tokens: number
  cost: number
}

export interface UsageSummary {
  totalTokens: number
  totalCost: number
  byProject: UsageByProject[]
  byModel: UsageByModel[]
  trend: UsageDataPoint[]
}

export interface CostAlertConfig {
  monthlyBudget: number
  warningThreshold: number
  emailNotifications: boolean
}

// --- ID generation ---

let idCounter = 0
export function generateSettingsId(prefix = 'set'): string {
  return `${prefix}-${Date.now()}-${++idCounter}`
}

// --- Mock data factories ---

export function createMockUserProfile(): UserProfile {
  return {
    id: 'mock-user-1',
    name: 'Alex Developer',
    email: 'alex@example.com',
    avatarUrl: '',
    preferences: {
      defaultDbEngine: 'postgresql',
      defaultStack: 'react',
      defaultAiProvider: 'provider-1',
    },
  }
}

export function createMockProviders(): AIProviderConfig[] {
  return [
    {
      id: 'provider-1',
      label: 'Claude (Primary)',
      providerType: 'anthropic',
      model: 'claude-sonnet-4-5-20250929',
      apiKeySet: true,
      isDefault: true,
      status: 'connected',
      lastTestedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'provider-2',
      label: 'OpenAI Fallback',
      providerType: 'openai',
      model: 'gpt-4o',
      apiKeySet: true,
      isDefault: false,
      status: 'connected',
      lastTestedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'provider-3',
      label: 'Local Ollama',
      providerType: 'openai-compatible',
      model: 'llama3.1:70b',
      apiKeySet: false,
      isDefault: false,
      status: 'untested',
    },
  ]
}

export function createMockTokens(): MCPToken[] {
  const now = Date.now()
  return [
    {
      id: 'token-1',
      label: 'CI/CD Pipeline',
      projectId: 'mock-project-1',
      projectName: 'Software Design OS',
      tokenPrefix: 'sdp_live_abc1',
      createdAt: new Date(now - 30 * 86400000).toISOString(),
      lastUsedAt: new Date(now - 2 * 86400000).toISOString(),
      expiresAt: new Date(now + 335 * 86400000).toISOString(),
      revoked: false,
    },
    {
      id: 'token-2',
      label: 'Development',
      projectId: 'mock-project-2',
      projectName: 'E-Commerce Platform',
      tokenPrefix: 'sdp_dev_xyz2',
      createdAt: new Date(now - 14 * 86400000).toISOString(),
      expiresAt: new Date(now + 351 * 86400000).toISOString(),
      revoked: false,
    },
  ]
}

export function createMockUsageSummary(): UsageSummary {
  const trend: UsageDataPoint[] = []
  const now = Date.now()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now - i * 86400000)
    const tokens = Math.floor(Math.random() * 50000) + 10000
    trend.push({
      date: date.toISOString().split('T')[0],
      tokens,
      cost: tokens * 0.000006,
    })
  }

  return {
    totalTokens: trend.reduce((s, d) => s + d.tokens, 0),
    totalCost: trend.reduce((s, d) => s + d.cost, 0),
    byProject: [
      { projectId: 'mock-project-1', projectName: 'Software Design OS', tokens: 420000, cost: 2.52 },
      { projectId: 'mock-project-2', projectName: 'E-Commerce Platform', tokens: 180000, cost: 1.08 },
      { projectId: 'mock-project-3', projectName: 'Analytics Dashboard', tokens: 310000, cost: 1.86 },
      { projectId: 'mock-project-4', projectName: 'Learning Management System', tokens: 45000, cost: 0.27 },
    ],
    byModel: [
      { model: 'claude-sonnet-4-5', tokens: 680000, cost: 4.08 },
      { model: 'gpt-4o', tokens: 210000, cost: 1.26 },
      { model: 'claude-haiku-3-5', tokens: 65000, cost: 0.39 },
    ],
    trend,
  }
}

export function createMockCostAlertConfig(): CostAlertConfig {
  return {
    monthlyBudget: 25,
    warningThreshold: 80,
    emailNotifications: true,
  }
}
