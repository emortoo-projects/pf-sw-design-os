import type {
  ProjectWithStages,
  StageWithOutputs,
  GenerateResponse,
  CompleteResponse,
  RevertResponse,
  ActivateOutputResponse,
  Stage,
  User,
  AuthResponse,
  PromptContract,
  ContractStatus,
  ContractEvent,
  AutomationConfig,
  BatchRun,
  QualityReport,
} from '@sdos/shared'
import type { UsageSummary, UsagePeriod } from '@/features/settings/types'

export interface CreateProjectInput {
  name: string
  description?: string
  templateId?: string
  aiProviderId?: string
}

export interface UpdateProjectInput {
  name?: string
  description?: string | null
  aiProviderId?: string | null
}

export interface Template {
  id: string
  name: string
  description: string
  category: string
  icon: string | null
  isBuiltIn: boolean
  createdAt: string
}

export type ProviderType = 'anthropic' | 'openai' | 'openrouter' | 'deepseek' | 'kimi' | 'custom'

export interface AIProvider {
  id: string
  userId: string
  provider: ProviderType
  label: string
  defaultModel: string
  baseUrl: string | null
  isDefault: boolean
  apiKeySet: boolean
  createdAt: string
}

export interface CreateAIProviderInput {
  provider: ProviderType
  label: string
  apiKey: string
  defaultModel: string
  baseUrl?: string
  isDefault?: boolean
}

export interface UpdateAIProviderInput {
  label?: string
  apiKey?: string
  defaultModel?: string
  baseUrl?: string | null
  isDefault?: boolean
}

export interface TestConnectionResult {
  success: boolean
  model: string
  latencyMs: number
  error?: string
}

export interface MCPTokenResponse {
  id: string
  label: string
  projectId: string
  projectName: string
  tokenPrefix: string
  lastUsedAt: string | null
  expiresAt: string
  createdAt: string
}

export interface MCPTokenCreateResponse extends MCPTokenResponse {
  plaintext: string
}

export interface CreateMCPTokenInput {
  label: string
  expiresInDays?: number
}

export interface ApiClient {
  listProjects(): Promise<ProjectWithStages[]>
  createProject(input: CreateProjectInput): Promise<ProjectWithStages>
  getProject(id: string): Promise<ProjectWithStages>
  updateProject(id: string, input: UpdateProjectInput): Promise<ProjectWithStages>
  deleteProject(id: string): Promise<void>
  listTemplates(): Promise<Template[]>
  getStage(projectId: string, stageNumber: number): Promise<StageWithOutputs>
  updateStage(projectId: string, stageNumber: number, data: Record<string, unknown>): Promise<Stage>
  generateStage(projectId: string, stageNumber: number, userInput?: string): Promise<GenerateResponse>
  completeStage(projectId: string, stageNumber: number): Promise<CompleteResponse>
  revertStage(projectId: string, stageNumber: number): Promise<RevertResponse>
  activateOutputVersion(projectId: string, stageNumber: number, version: number): Promise<ActivateOutputResponse>
  login(email: string, password: string): Promise<AuthResponse>
  register(email: string, name: string, password: string): Promise<AuthResponse>
  refreshAuth(refreshToken: string): Promise<AuthResponse>
  logout(refreshToken: string): Promise<void>
  getMe(): Promise<User>
  updateMe(data: { name?: string; avatarUrl?: string | null; preferences?: Record<string, unknown> }): Promise<User>
  listAIProviders(): Promise<AIProvider[]>
  createAIProvider(input: CreateAIProviderInput): Promise<AIProvider>
  updateAIProvider(id: string, input: UpdateAIProviderInput): Promise<AIProvider>
  deleteAIProvider(id: string): Promise<void>
  testAIProvider(id: string): Promise<TestConnectionResult>
  getUsageSummary(period: UsagePeriod): Promise<UsageSummary>
  getDashboardSummary(): Promise<DashboardSummary>
  listMCPTokens(): Promise<MCPTokenResponse[]>
  createMCPToken(projectId: string, input: CreateMCPTokenInput): Promise<MCPTokenCreateResponse>
  deleteMCPToken(projectId: string, tokenId: string): Promise<void>
  // Contracts
  listContracts(projectId: string): Promise<PromptContract[]>
  getContract(projectId: string, contractId: string): Promise<PromptContract>
  generateContracts(projectId: string): Promise<{ contracts: PromptContract[]; count: number }>
  updateContract(projectId: string, contractId: string, patch: { status?: ContractStatus }): Promise<PromptContract>
  markContractDone(projectId: string, contractId: string): Promise<PromptContract>
  getNextContract(projectId: string): Promise<PromptContract | null>
  generateClaudeMd(projectId: string): Promise<{ content: string }>
  startContract(projectId: string, contractId: string): Promise<PromptContract>
  submitContract(projectId: string, contractId: string, summary: string): Promise<PromptContract>
  approveContract(projectId: string, contractId: string): Promise<PromptContract>
  requestChanges(projectId: string, contractId: string, feedback: string): Promise<PromptContract>
  listContractEvents(projectId: string, contractId: string): Promise<ContractEvent[]>
  // Automation
  getAutomationConfig(projectId: string): Promise<AutomationConfig | null>
  saveAutomationConfig(projectId: string, config: AutomationConfig): Promise<AutomationConfig | null>
  startBatchRun(projectId: string): Promise<BatchRun>
  getBatchRun(projectId: string, batchId: string): Promise<BatchRun>
  getLatestBatchRun(projectId: string): Promise<BatchRun | null>
  stopBatchRun(projectId: string, batchId: string): Promise<BatchRun>
  runQualityGates(projectId: string, taskId: string, report: QualityReport): Promise<PromptContract>
  batchApprove(projectId: string): Promise<{ approved: number; total: number }>
  generateWorkflowPrompt(projectId: string): Promise<{ prompt: string }>
  // Setup
  getSetupStatus(): Promise<{ needsSetup: boolean }>
  completeSetup(input: SetupInput): Promise<AuthResponse>
  // Data management
  exportData(format: 'json' | 'sql'): Promise<void>
  importData(data: Record<string, unknown>): Promise<{ tablesImported: number }>
  importSdp(file: File): Promise<{ projectId: string; projectName: string; stagesImported: number }>
  getDbStatus(): Promise<DbStatus>
  resetDatabase(confirm: string): Promise<{ success: boolean }>
}

export interface SetupInput {
  admin: { email: string; name: string; password: string }
  provider?: {
    provider: ProviderType
    label: string
    apiKey: string
    defaultModel: string
    baseUrl?: string
  }
}

export interface DbStatus {
  sizeBytes: number
  tables: Array<{ name: string; rowCount: number }>
  lastBackup: string | null
}

export interface RecentGeneration {
  id: string
  model: string
  cost: number
  tokens: number
  durationMs: number
  createdAt: string
  stageNumber: number
  stageName: string
  stageLabel: string
  projectId: string
  projectName: string
}

export interface ModelUsage {
  model: string
  tokens: number
  cost: number
  count: number
  percentage: number
}

export interface DashboardSummary {
  totalTokens: number
  totalCost: number
  generationCount: number
  avgCostPerGeneration: number
  topModel: { model: string; percentage: number } | null
  modelUsage: ModelUsage[]
  dailySpending: Array<{ date: string; cost: number }>
  recentGenerations: RecentGeneration[]
}

// Prevent concurrent refresh attempts
let refreshPromise: Promise<AuthResponse> | null = null

class HttpApiClient implements ApiClient {
  private baseUrl = '/api'

  private async fetch<T>(path: string, init?: RequestInit): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    const token = localStorage.getItem('sdos_access_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      headers,
      ...init,
    })

    if (res.status === 401 && !path.startsWith('/auth/')) {
      // Try refresh
      const refreshed = await this.tryRefresh()
      if (refreshed) {
        // Retry original request with new token
        const newToken = localStorage.getItem('sdos_access_token')
        const retryRes = await fetch(`${this.baseUrl}${path}`, {
          headers: { ...headers, Authorization: `Bearer ${newToken}` },
          ...init,
        })
        if (!retryRes.ok) {
          const error = await retryRes.json().catch(() => ({ error: 'Request failed' }))
          throw new Error(error.error?.message || error.error || `HTTP ${retryRes.status}`)
        }
        return retryRes.json()
      }

      // Refresh failed — redirect to login
      localStorage.removeItem('sdos_access_token')
      localStorage.removeItem('sdos_refresh_token')
      window.location.href = '/login'
      throw new Error('Session expired')
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: { message: `HTTP ${res.status}` } }))
      const message = error.error?.message || error.error || `HTTP ${res.status}`
      const code = error.error?.code || `HTTP_${res.status}`
      const err = new Error(message)
      ;(err as any).code = code
      ;(err as any).status = res.status
      throw err
    }
    return res.json()
  }

  private async tryRefresh(): Promise<boolean> {
    const refreshToken = localStorage.getItem('sdos_refresh_token')
    if (!refreshToken) return false

    try {
      if (!refreshPromise) {
        refreshPromise = this.refreshAuth(refreshToken)
      }
      const result = await refreshPromise
      localStorage.setItem('sdos_access_token', result.tokens.accessToken)
      localStorage.setItem('sdos_refresh_token', result.tokens.refreshToken)
      return true
    } catch {
      return false
    } finally {
      refreshPromise = null
    }
  }

  listProjects() {
    return this.fetch<ProjectWithStages[]>('/projects')
  }

  createProject(input: CreateProjectInput) {
    return this.fetch<ProjectWithStages>('/projects', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  }

  getProject(id: string) {
    return this.fetch<ProjectWithStages>(`/projects/${id}`)
  }

  updateProject(id: string, input: UpdateProjectInput) {
    return this.fetch<ProjectWithStages>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  }

  async deleteProject(id: string) {
    await this.fetch(`/projects/${id}`, { method: 'DELETE' })
  }

  listTemplates() {
    return this.fetch<Template[]>('/templates')
  }

  getStage(projectId: string, stageNumber: number) {
    return this.fetch<StageWithOutputs>(`/projects/${projectId}/stages/${stageNumber}`)
  }

  updateStage(projectId: string, stageNumber: number, data: Record<string, unknown>) {
    return this.fetch<Stage>(`/projects/${projectId}/stages/${stageNumber}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    })
  }

  generateStage(projectId: string, stageNumber: number, userInput?: string) {
    return this.fetch<GenerateResponse>(`/projects/${projectId}/stages/${stageNumber}/generate`, {
      method: 'POST',
      body: JSON.stringify({ userInput }),
    })
  }

  completeStage(projectId: string, stageNumber: number) {
    return this.fetch<CompleteResponse>(`/projects/${projectId}/stages/${stageNumber}/complete`, {
      method: 'POST',
    })
  }

  revertStage(projectId: string, stageNumber: number) {
    return this.fetch<RevertResponse>(`/projects/${projectId}/stages/${stageNumber}/revert`, {
      method: 'POST',
    })
  }

  activateOutputVersion(projectId: string, stageNumber: number, version: number) {
    return this.fetch<ActivateOutputResponse>(
      `/projects/${projectId}/stages/${stageNumber}/outputs/${version}/activate`,
      { method: 'POST' },
    )
  }

  listContracts(projectId: string) {
    return this.fetch<PromptContract[]>(`/projects/${projectId}/contracts`)
  }

  getContract(projectId: string, contractId: string) {
    return this.fetch<PromptContract>(`/projects/${projectId}/contracts/${contractId}`)
  }

  generateContracts(projectId: string) {
    return this.fetch<{ contracts: PromptContract[]; count: number }>(`/projects/${projectId}/contracts/generate`, {
      method: 'POST',
    })
  }

  updateContract(projectId: string, contractId: string, patch: { status?: ContractStatus }) {
    return this.fetch<PromptContract>(`/projects/${projectId}/contracts/${contractId}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
  }

  markContractDone(projectId: string, contractId: string) {
    return this.fetch<PromptContract>(`/projects/${projectId}/contracts/${contractId}/mark-done`, {
      method: 'POST',
    })
  }

  getNextContract(projectId: string) {
    return this.fetch<PromptContract | null>(`/projects/${projectId}/contracts/next`)
  }

  generateClaudeMd(projectId: string) {
    return this.fetch<{ content: string }>(`/projects/${projectId}/contracts/claude-md`, {
      method: 'POST',
    })
  }

  startContract(projectId: string, contractId: string) {
    return this.fetch<PromptContract>(`/projects/${projectId}/contracts/${contractId}/start`, {
      method: 'POST',
    })
  }

  submitContract(projectId: string, contractId: string, summary: string) {
    return this.fetch<PromptContract>(`/projects/${projectId}/contracts/${contractId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ summary }),
    })
  }

  approveContract(projectId: string, contractId: string) {
    return this.fetch<PromptContract>(`/projects/${projectId}/contracts/${contractId}/approve`, {
      method: 'POST',
    })
  }

  requestChanges(projectId: string, contractId: string, feedback: string) {
    return this.fetch<PromptContract>(`/projects/${projectId}/contracts/${contractId}/request-changes`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    })
  }

  listContractEvents(projectId: string, contractId: string) {
    return this.fetch<ContractEvent[]>(`/projects/${projectId}/contracts/${contractId}/events`)
  }

  getAutomationConfig(projectId: string) {
    return this.fetch<AutomationConfig | null>(`/projects/${projectId}/automation`)
  }

  saveAutomationConfig(projectId: string, config: AutomationConfig) {
    return this.fetch<AutomationConfig | null>(`/projects/${projectId}/automation`, {
      method: 'PATCH',
      body: JSON.stringify(config),
    })
  }

  startBatchRun(projectId: string) {
    return this.fetch<BatchRun>(`/projects/${projectId}/automation/batch/start`, {
      method: 'POST',
    })
  }

  getBatchRun(projectId: string, batchId: string) {
    return this.fetch<BatchRun>(`/projects/${projectId}/automation/batch/${batchId}`)
  }

  getLatestBatchRun(projectId: string) {
    return this.fetch<BatchRun | null>(`/projects/${projectId}/automation/batch/latest`)
  }

  stopBatchRun(projectId: string, batchId: string) {
    return this.fetch<BatchRun>(`/projects/${projectId}/automation/batch/${batchId}/stop`, {
      method: 'POST',
    })
  }

  runQualityGates(projectId: string, taskId: string, report: QualityReport) {
    return this.fetch<PromptContract>(`/projects/${projectId}/automation/tasks/${taskId}/quality-gates`, {
      method: 'POST',
      body: JSON.stringify(report),
    })
  }

  batchApprove(projectId: string) {
    return this.fetch<{ approved: number; total: number }>(`/projects/${projectId}/automation/batch-approve`, {
      method: 'POST',
    })
  }

  generateWorkflowPrompt(projectId: string) {
    return this.fetch<{ prompt: string }>(`/projects/${projectId}/automation/generate-workflow-prompt`, {
      method: 'POST',
    })
  }

  listAIProviders() {
    return this.fetch<AIProvider[]>('/ai-providers')
  }

  createAIProvider(input: CreateAIProviderInput) {
    return this.fetch<AIProvider>('/ai-providers', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  }

  updateAIProvider(id: string, input: UpdateAIProviderInput) {
    return this.fetch<AIProvider>(`/ai-providers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  }

  async deleteAIProvider(id: string) {
    await this.fetch(`/ai-providers/${id}`, { method: 'DELETE' })
  }

  testAIProvider(id: string) {
    return this.fetch<TestConnectionResult>(`/ai-providers/${id}/test`, {
      method: 'POST',
    })
  }

  getUsageSummary(period: UsagePeriod) {
    return this.fetch<UsageSummary>(`/usage?period=${period}`)
  }

  getDashboardSummary() {
    return this.fetch<DashboardSummary>('/usage/summary')
  }

  listMCPTokens() {
    return this.fetch<MCPTokenResponse[]>('/mcp-tokens')
  }

  createMCPToken(projectId: string, input: CreateMCPTokenInput) {
    return this.fetch<MCPTokenCreateResponse>(`/projects/${projectId}/mcp-tokens`, {
      method: 'POST',
      body: JSON.stringify(input),
    })
  }

  async deleteMCPToken(projectId: string, tokenId: string) {
    await this.fetch(`/projects/${projectId}/mcp-tokens/${tokenId}`, { method: 'DELETE' })
  }

  async login(email: string, password: string) {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Login failed' }))
      throw new Error(error.error?.message || error.error || `HTTP ${res.status}`)
    }
    return res.json()
  }

  async register(email: string, name: string, password: string) {
    const res = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password }),
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Registration failed' }))
      throw new Error(error.error?.message || error.error || `HTTP ${res.status}`)
    }
    return res.json()
  }

  async refreshAuth(refreshToken: string) {
    const res = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) {
      throw new Error('Token refresh failed')
    }
    return res.json()
  }

  async logout(refreshToken: string) {
    await fetch(`${this.baseUrl}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
  }

  getMe() {
    return this.fetch<User>('/users/me')
  }

  updateMe(data: { name?: string; avatarUrl?: string | null; preferences?: Record<string, unknown> }) {
    return this.fetch<User>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Setup (public — no auth header)
  async getSetupStatus(): Promise<{ needsSetup: boolean }> {
    const res = await fetch(`${this.baseUrl}/setup/status`)
    if (!res.ok) throw new Error('Failed to check setup status')
    return res.json()
  }

  async completeSetup(input: SetupInput): Promise<AuthResponse> {
    const res = await fetch(`${this.baseUrl}/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Setup failed' }))
      throw new Error(error.error?.message || error.error || `HTTP ${res.status}`)
    }
    return res.json()
  }

  // Data management
  async exportData(format: 'json' | 'sql'): Promise<void> {
    const token = localStorage.getItem('sdos_access_token')
    const res = await fetch(`${this.baseUrl}/admin/export?format=${format}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Export failed')
    const blob = await res.blob()
    const ext = format === 'json' ? 'json' : 'sql.gz'
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sdos-export.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  importData(data: Record<string, unknown>) {
    return this.fetch<{ tablesImported: number }>('/admin/import', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async importSdp(file: File) {
    const token = localStorage.getItem('sdos_access_token')
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${this.baseUrl}/projects/import-sdp`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'SDP import failed' }))
      throw new Error(error.error?.message || error.error || `HTTP ${res.status}`)
    }
    return res.json()
  }

  getDbStatus() {
    return this.fetch<DbStatus>('/admin/db-status')
  }

  resetDatabase(confirm: string) {
    return this.fetch<{ success: boolean }>('/admin/db-reset', {
      method: 'POST',
      body: JSON.stringify({ confirm }),
    })
  }
}

class MockApiClient implements ApiClient {
  private data = import('@/lib/mock-data')

  async listProjects() {
    const { createMockProjectsList } = await this.data
    return createMockProjectsList()
  }

  async createProject(input: CreateProjectInput) {
    const { createMockProject } = await this.data
    const id = `project-${Date.now()}`
    const project = createMockProject(id, 1)
    return { ...project, name: input.name, description: input.description }
  }

  async getProject(id: string) {
    const { createMockProject } = await this.data
    return createMockProject(id, 1)
  }

  async updateProject(id: string, _input: UpdateProjectInput) {
    const { createMockProject } = await this.data
    return createMockProject(id, 1)
  }

  async deleteProject(_id: string) {}

  async listTemplates(): Promise<Template[]> {
    return [
      { id: 't1', name: 'SaaS Starter', description: 'Full-stack SaaS boilerplate', category: 'saas', icon: 'Rocket', isBuiltIn: true, createdAt: new Date().toISOString() },
      { id: 't2', name: 'REST API', description: 'Backend-only API', category: 'api', icon: 'Globe', isBuiltIn: true, createdAt: new Date().toISOString() },
    ]
  }

  async getStage(_projectId: string, stageNumber: number) {
    const { createMockStageWithOutputs } = await this.data
    return createMockStageWithOutputs(stageNumber)
  }

  async updateStage(_projectId: string, stageNumber: number, data: Record<string, unknown>) {
    const { createMockStage } = await this.data
    return { ...createMockStage(stageNumber, 'review'), data }
  }

  async generateStage(_projectId: string, stageNumber: number) {
    const { createMockGenerateResponse } = await this.data
    await new Promise((r) => setTimeout(r, 1500))
    return createMockGenerateResponse(stageNumber)
  }

  async completeStage(_projectId: string, stageNumber: number) {
    const { createMockCompleteResponse } = await this.data
    return createMockCompleteResponse(stageNumber)
  }

  async revertStage(_projectId: string, stageNumber: number) {
    const { createMockRevertResponse } = await this.data
    return createMockRevertResponse(stageNumber)
  }

  async activateOutputVersion(_projectId: string, stageNumber: number, version: number): Promise<ActivateOutputResponse> {
    const { createMockStage } = await this.data
    const stage = createMockStage(stageNumber, 'review')
    return {
      stage,
      output: {
        id: `output-${stageNumber}-${version}`,
        stageId: stage.id,
        version,
        format: 'json',
        content: JSON.stringify(stage.data ?? {}),
        generatedBy: 'ai',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    }
  }

  async listContracts(_projectId: string): Promise<PromptContract[]> {
    return []
  }

  async getContract(_projectId: string, contractId: string): Promise<PromptContract> {
    return {
      id: contractId, projectId: _projectId, title: 'Mock Contract', type: 'setup', priority: 1,
      status: 'ready', dependencies: [], description: 'Mock', userStory: null, stack: null,
      targetFiles: null, referenceFiles: null, constraints: null, doNotTouch: null, patterns: null,
      dataModels: null, apiEndpoints: null, designTokens: null, componentSpec: null,
      acceptanceCriteria: null, testCases: null, generatedPrompt: null,
      reviewSummary: null, reviewFeedback: null, startedAt: null, completedAt: null,
      batchRunId: null, qualityReport: null, submittedAt: null, reviewedAt: null, reviewNotes: null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
  }

  async generateContracts(_projectId: string): Promise<{ contracts: PromptContract[]; count: number }> {
    return { contracts: [], count: 0 }
  }

  async updateContract(_projectId: string, contractId: string, _patch: { status?: ContractStatus }): Promise<PromptContract> {
    return {
      id: contractId, projectId: _projectId, title: 'Mock Contract', type: 'setup', priority: 1,
      status: _patch.status ?? 'ready', dependencies: [], description: 'Mock', userStory: null,
      stack: null, targetFiles: null, referenceFiles: null, constraints: null, doNotTouch: null,
      patterns: null, dataModels: null, apiEndpoints: null, designTokens: null, componentSpec: null,
      acceptanceCriteria: null, testCases: null, generatedPrompt: null,
      reviewSummary: null, reviewFeedback: null, startedAt: null, completedAt: null,
      batchRunId: null, qualityReport: null, submittedAt: null, reviewedAt: null, reviewNotes: null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
  }

  async markContractDone(_projectId: string, contractId: string): Promise<PromptContract> {
    return {
      id: contractId, projectId: _projectId, title: 'Mock Contract', type: 'setup', priority: 1,
      status: 'done', dependencies: [], description: 'Mock', userStory: null, stack: null,
      targetFiles: null, referenceFiles: null, constraints: null, doNotTouch: null, patterns: null,
      dataModels: null, apiEndpoints: null, designTokens: null, componentSpec: null,
      acceptanceCriteria: null, testCases: null, generatedPrompt: null,
      reviewSummary: null, reviewFeedback: null, startedAt: null,
      completedAt: new Date().toISOString(),
      batchRunId: null, qualityReport: null, submittedAt: null, reviewedAt: null, reviewNotes: null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
  }

  async getNextContract(_projectId: string): Promise<PromptContract | null> {
    return null
  }

  async generateClaudeMd(_projectId: string): Promise<{ content: string }> {
    return { content: '# Mock Project\n\nGenerated CLAUDE.md content' }
  }

  async startContract(_projectId: string, contractId: string): Promise<PromptContract> {
    return {
      id: contractId, projectId: _projectId, title: 'Mock Contract', type: 'setup', priority: 1,
      status: 'in_progress', dependencies: [], description: 'Mock', userStory: null, stack: null,
      targetFiles: null, referenceFiles: null, constraints: null, doNotTouch: null, patterns: null,
      dataModels: null, apiEndpoints: null, designTokens: null, componentSpec: null,
      acceptanceCriteria: null, testCases: null, generatedPrompt: null,
      reviewSummary: null, reviewFeedback: null, startedAt: new Date().toISOString(),
      completedAt: null,
      batchRunId: null, qualityReport: null, submittedAt: null, reviewedAt: null, reviewNotes: null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
  }

  async submitContract(_projectId: string, contractId: string, summary: string): Promise<PromptContract> {
    return {
      id: contractId, projectId: _projectId, title: 'Mock Contract', type: 'setup', priority: 1,
      status: 'in_review', dependencies: [], description: 'Mock', userStory: null, stack: null,
      targetFiles: null, referenceFiles: null, constraints: null, doNotTouch: null, patterns: null,
      dataModels: null, apiEndpoints: null, designTokens: null, componentSpec: null,
      acceptanceCriteria: null, testCases: null, generatedPrompt: null,
      reviewSummary: summary, reviewFeedback: null, startedAt: new Date().toISOString(),
      completedAt: null,
      batchRunId: null, qualityReport: null, submittedAt: null, reviewedAt: null, reviewNotes: null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
  }

  async approveContract(_projectId: string, contractId: string): Promise<PromptContract> {
    return {
      id: contractId, projectId: _projectId, title: 'Mock Contract', type: 'setup', priority: 1,
      status: 'done', dependencies: [], description: 'Mock', userStory: null, stack: null,
      targetFiles: null, referenceFiles: null, constraints: null, doNotTouch: null, patterns: null,
      dataModels: null, apiEndpoints: null, designTokens: null, componentSpec: null,
      acceptanceCriteria: null, testCases: null, generatedPrompt: null,
      reviewSummary: null, reviewFeedback: null, startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      batchRunId: null, qualityReport: null, submittedAt: null, reviewedAt: null, reviewNotes: null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
  }

  async requestChanges(_projectId: string, contractId: string, feedback: string): Promise<PromptContract> {
    return {
      id: contractId, projectId: _projectId, title: 'Mock Contract', type: 'setup', priority: 1,
      status: 'in_progress', dependencies: [], description: 'Mock', userStory: null, stack: null,
      targetFiles: null, referenceFiles: null, constraints: null, doNotTouch: null, patterns: null,
      dataModels: null, apiEndpoints: null, designTokens: null, componentSpec: null,
      acceptanceCriteria: null, testCases: null, generatedPrompt: null,
      reviewSummary: null, reviewFeedback: feedback, startedAt: new Date().toISOString(),
      completedAt: null,
      batchRunId: null, qualityReport: null, submittedAt: null, reviewedAt: null, reviewNotes: null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
  }

  async listContractEvents(_projectId: string, _contractId: string): Promise<ContractEvent[]> {
    return []
  }

  async getAutomationConfig(_projectId: string): Promise<AutomationConfig | null> {
    return {
      trustLevel: 'semi_auto',
      qualityGates: { typescriptCompiles: true, testsPass: true, lintClean: false, noNewWarnings: false },
      boundaries: { protectEnvFiles: true, protectConfigFiles: true, protectedPaths: [] },
      batchLimits: { maxTasks: 10, maxConsecutiveFailures: 3 },
    }
  }

  async saveAutomationConfig(_projectId: string, config: AutomationConfig): Promise<AutomationConfig | null> {
    return config
  }

  async startBatchRun(_projectId: string): Promise<BatchRun> {
    return {
      id: `batch-${Date.now()}`, projectId: _projectId, status: 'running',
      config: null, startedAt: new Date().toISOString(), completedAt: null,
      tasksAttempted: 0, tasksCompleted: 0, tasksFailed: 0, tasksParkedForReview: 0,
      report: null, createdAt: new Date().toISOString(),
    }
  }

  async getBatchRun(_projectId: string, batchId: string): Promise<BatchRun> {
    return {
      id: batchId, projectId: _projectId, status: 'running',
      config: null, startedAt: new Date().toISOString(), completedAt: null,
      tasksAttempted: 3, tasksCompleted: 2, tasksFailed: 0, tasksParkedForReview: 1,
      report: null, createdAt: new Date().toISOString(),
    }
  }

  async getLatestBatchRun(_projectId: string): Promise<BatchRun | null> {
    return null
  }

  async stopBatchRun(_projectId: string, batchId: string): Promise<BatchRun> {
    return {
      id: batchId, projectId: _projectId, status: 'stopped',
      config: null, startedAt: new Date().toISOString(), completedAt: new Date().toISOString(),
      tasksAttempted: 3, tasksCompleted: 2, tasksFailed: 0, tasksParkedForReview: 1,
      report: null, createdAt: new Date().toISOString(),
    }
  }

  async runQualityGates(_projectId: string, contractId: string, _report: QualityReport): Promise<PromptContract> {
    return {
      id: contractId, projectId: _projectId, title: 'Mock Contract', type: 'setup', priority: 1,
      status: 'in_review', dependencies: [], description: 'Mock', userStory: null, stack: null,
      targetFiles: null, referenceFiles: null, constraints: null, doNotTouch: null, patterns: null,
      dataModels: null, apiEndpoints: null, designTokens: null, componentSpec: null,
      acceptanceCriteria: null, testCases: null, generatedPrompt: null,
      reviewSummary: null, reviewFeedback: null, startedAt: null, completedAt: null,
      batchRunId: null, qualityReport: null, submittedAt: null, reviewedAt: null, reviewNotes: null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
  }

  async batchApprove(_projectId: string): Promise<{ approved: number; total: number }> {
    return { approved: 0, total: 0 }
  }

  async generateWorkflowPrompt(_projectId: string): Promise<{ prompt: string }> {
    return { prompt: '# Mock Workflow Prompt\n\nUse SDOS MCP tools to implement contracts autonomously.' }
  }

  async listAIProviders(): Promise<AIProvider[]> {
    return [
      { id: 'prov-1', userId: 'mock-user', provider: 'anthropic', label: 'Claude (Primary)', defaultModel: 'claude-sonnet-4-5-20250929', baseUrl: null, isDefault: true, apiKeySet: true, createdAt: new Date().toISOString() },
      { id: 'prov-2', userId: 'mock-user', provider: 'openai', label: 'OpenAI Fallback', defaultModel: 'gpt-4o', baseUrl: null, isDefault: false, apiKeySet: true, createdAt: new Date().toISOString() },
    ]
  }

  async createAIProvider(input: CreateAIProviderInput): Promise<AIProvider> {
    return { id: `prov-${Date.now()}`, userId: 'mock-user', provider: input.provider, label: input.label, defaultModel: input.defaultModel, baseUrl: input.baseUrl ?? null, isDefault: input.isDefault ?? false, apiKeySet: true, createdAt: new Date().toISOString() }
  }

  async updateAIProvider(id: string, input: UpdateAIProviderInput): Promise<AIProvider> {
    return { id, userId: 'mock-user', provider: 'anthropic', label: input.label ?? 'Provider', defaultModel: input.defaultModel ?? 'claude-sonnet-4-5-20250929', baseUrl: null, isDefault: input.isDefault ?? false, apiKeySet: true, createdAt: new Date().toISOString() }
  }

  async deleteAIProvider(_id: string): Promise<void> {}

  async testAIProvider(_id: string): Promise<TestConnectionResult> {
    await new Promise((r) => setTimeout(r, 1500))
    return { success: true, model: 'claude-sonnet-4-5-20250929', latencyMs: 1200 }
  }

  async getUsageSummary(_period: UsagePeriod): Promise<UsageSummary> {
    const { createMockUsageSummary } = await import('@/features/settings/types')
    return createMockUsageSummary()
  }

  async getDashboardSummary(): Promise<DashboardSummary> {
    const now = Date.now()
    return {
      totalTokens: 955000,
      totalCost: 5.73,
      generationCount: 42,
      avgCostPerGeneration: 0.136,
      topModel: { model: 'claude-sonnet-4-5', percentage: 72 },
      modelUsage: [
        { model: 'claude-sonnet-4-5', tokens: 680000, cost: 4.08, count: 30, percentage: 72 },
        { model: 'gpt-4o', tokens: 210000, cost: 1.26, count: 8, percentage: 19 },
        { model: 'deepseek-chat', tokens: 65000, cost: 0.39, count: 4, percentage: 9 },
      ],
      dailySpending: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(now - (6 - i) * 86400000).toISOString().split('T')[0],
        cost: Math.random() * 0.5 + 0.1,
      })),
      recentGenerations: [
        { id: 'gen-1', model: 'claude-sonnet-4-5', cost: 0.12, tokens: 18500, durationMs: 3200, createdAt: new Date(now - 120000).toISOString(), stageNumber: 2, stageName: 'dataModel', stageLabel: 'Data Model', projectId: 'mock-project-1', projectName: 'Mission Control' },
        { id: 'gen-2', model: 'claude-sonnet-4-5', cost: 0.08, tokens: 12000, durationMs: 2100, createdAt: new Date(now - 3600000).toISOString(), stageNumber: 1, stageName: 'product', stageLabel: 'Product Definition', projectId: 'mock-project-1', projectName: 'Mission Control' },
        { id: 'gen-3', model: 'gpt-4o', cost: 0.15, tokens: 22000, durationMs: 4500, createdAt: new Date(now - 7200000).toISOString(), stageNumber: 4, stageName: 'api', stageLabel: 'API Design', projectId: 'mock-project-2', projectName: 'E-Commerce Platform' },
        { id: 'gen-4', model: 'claude-sonnet-4-5', cost: 0.09, tokens: 14000, durationMs: 2800, createdAt: new Date(now - 86400000).toISOString(), stageNumber: 3, stageName: 'database', stageLabel: 'Database', projectId: 'mock-project-2', projectName: 'E-Commerce Platform' },
        { id: 'gen-5', model: 'deepseek-chat', cost: 0.03, tokens: 8000, durationMs: 1500, createdAt: new Date(now - 172800000).toISOString(), stageNumber: 5, stageName: 'stack', stageLabel: 'Tech Stack', projectId: 'mock-project-1', projectName: 'Mission Control' },
      ],
    }
  }

  async listMCPTokens(): Promise<MCPTokenResponse[]> {
    const now = Date.now()
    return [
      { id: 'token-1', label: 'CI/CD Pipeline', projectId: 'mock-project-1', projectName: 'Software Design OS', tokenPrefix: 'sdp_live_abc1', lastUsedAt: new Date(now - 2 * 86400000).toISOString(), expiresAt: new Date(now + 335 * 86400000).toISOString(), createdAt: new Date(now - 30 * 86400000).toISOString() },
      { id: 'token-2', label: 'Development', projectId: 'mock-project-2', projectName: 'E-Commerce Platform', tokenPrefix: 'sdp_live_xyz2', lastUsedAt: null, expiresAt: new Date(now + 351 * 86400000).toISOString(), createdAt: new Date(now - 14 * 86400000).toISOString() },
    ]
  }

  async createMCPToken(_projectId: string, input: CreateMCPTokenInput): Promise<MCPTokenCreateResponse> {
    const now = new Date()
    return {
      id: `token-${Date.now()}`,
      label: input.label,
      projectId: _projectId,
      projectName: 'Mock Project',
      tokenPrefix: 'sdp_live_mock',
      lastUsedAt: null,
      expiresAt: new Date(now.getTime() + (input.expiresInDays ?? 365) * 86400000).toISOString(),
      createdAt: now.toISOString(),
      plaintext: `sdp_live_${crypto.randomUUID().replace(/-/g, '')}mock1234567890ab`,
    }
  }

  async deleteMCPToken(_projectId: string, _tokenId: string): Promise<void> {}

  async login(_email: string, _password: string): Promise<AuthResponse> {
    return {
      user: { id: 'mock-user', email: 'demo@sdos.dev', name: 'Demo User', preferences: {} },
      tokens: { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' },
    }
  }

  async register(_email: string, _name: string, _password: string): Promise<AuthResponse> {
    return {
      user: { id: 'mock-user', email: 'demo@sdos.dev', name: 'Demo User', preferences: {} },
      tokens: { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' },
    }
  }

  async refreshAuth(_refreshToken: string): Promise<AuthResponse> {
    return {
      user: { id: 'mock-user', email: 'demo@sdos.dev', name: 'Demo User', preferences: {} },
      tokens: { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' },
    }
  }

  async logout(_refreshToken: string): Promise<void> {}

  async getMe(): Promise<User> {
    return {
      id: 'mock-user',
      email: 'demo@sdos.dev',
      name: 'Demo User',
      preferences: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  async updateMe(data: { name?: string; avatarUrl?: string | null; preferences?: Record<string, unknown> }): Promise<User> {
    return {
      id: 'mock-user',
      email: 'demo@sdos.dev',
      name: data.name ?? 'Demo User',
      avatarUrl: data.avatarUrl ?? undefined,
      preferences: data.preferences ?? {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  async getSetupStatus(): Promise<{ needsSetup: boolean }> {
    return { needsSetup: false }
  }

  async completeSetup(_input: SetupInput): Promise<AuthResponse> {
    return {
      user: { id: 'mock-user', email: 'demo@sdos.dev', name: 'Demo User', preferences: {} },
      tokens: { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' },
    }
  }

  async exportData(_format: 'json' | 'sql'): Promise<void> {}

  async importData(_data: Record<string, unknown>): Promise<{ tablesImported: number }> {
    return { tablesImported: 8 }
  }

  async importSdp(_file: File): Promise<{ projectId: string; projectName: string; stagesImported: number }> {
    return { projectId: 'mock-project', projectName: 'Imported Project', stagesImported: 9 }
  }

  async getDbStatus(): Promise<DbStatus> {
    return {
      sizeBytes: 52428800,
      tables: [
        { name: 'users', rowCount: 1 },
        { name: 'projects', rowCount: 3 },
        { name: 'stages', rowCount: 27 },
        { name: 'templates', rowCount: 6 },
      ],
      lastBackup: new Date(Date.now() - 86400000).toISOString(),
    }
  }

  async resetDatabase(_confirm: string): Promise<{ success: boolean }> {
    return { success: true }
  }
}

export const apiClient: ApiClient =
  import.meta.env.VITE_API_MODE === 'mock' ? new MockApiClient() : new HttpApiClient()
