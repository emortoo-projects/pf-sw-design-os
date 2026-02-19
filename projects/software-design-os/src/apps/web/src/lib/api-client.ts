import type {
  ProjectWithStages,
  StageWithOutputs,
  GenerateResponse,
  CompleteResponse,
  RevertResponse,
  Stage,
} from '@sdos/shared'

export interface ApiClient {
  getProject(id: string): Promise<ProjectWithStages>
  getStage(projectId: string, stageNumber: number): Promise<StageWithOutputs>
  updateStage(projectId: string, stageNumber: number, data: Record<string, unknown>): Promise<Stage>
  generateStage(projectId: string, stageNumber: number, userInput?: string): Promise<GenerateResponse>
  completeStage(projectId: string, stageNumber: number): Promise<CompleteResponse>
  revertStage(projectId: string, stageNumber: number): Promise<RevertResponse>
}

class HttpApiClient implements ApiClient {
  private baseUrl = '/api'

  private async fetch<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || `HTTP ${res.status}`)
    }
    return res.json()
  }

  getProject(id: string) {
    return this.fetch<ProjectWithStages>(`/projects/${id}`)
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
}

class MockApiClient implements ApiClient {
  private data = import('@/lib/mock-data')

  async getProject(id: string) {
    const { createMockProject } = await this.data
    return createMockProject(id)
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
}

export const apiClient: ApiClient =
  import.meta.env.VITE_API_MODE === 'mock' ? new MockApiClient() : new HttpApiClient()
