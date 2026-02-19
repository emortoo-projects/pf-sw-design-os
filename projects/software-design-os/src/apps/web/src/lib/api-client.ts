import type {
  ProjectWithStages,
  StageWithOutputs,
  GenerateResponse,
  CompleteResponse,
  RevertResponse,
  Stage,
  User,
  AuthResponse,
} from '@sdos/shared'

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
  login(email: string, password: string): Promise<AuthResponse>
  register(email: string, name: string, password: string): Promise<AuthResponse>
  refreshAuth(refreshToken: string): Promise<AuthResponse>
  logout(refreshToken: string): Promise<void>
  getMe(): Promise<User>
  updateMe(data: { name?: string; avatarUrl?: string | null; preferences?: Record<string, unknown> }): Promise<User>
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
      const error = await res.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error?.message || error.error || `HTTP ${res.status}`)
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
    const project = createMockProject(id)
    return { ...project, name: input.name, description: input.description, currentStage: 1 }
  }

  async getProject(id: string) {
    const { createMockProject } = await this.data
    return createMockProject(id)
  }

  async updateProject(id: string, _input: UpdateProjectInput) {
    const { createMockProject } = await this.data
    return createMockProject(id)
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
}

export const apiClient: ApiClient =
  import.meta.env.VITE_API_MODE === 'mock' ? new MockApiClient() : new HttpApiClient()
