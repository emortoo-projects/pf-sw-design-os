export interface Project {
  id: string
  userId: string
  name: string
  slug: string
  description?: string
  currentStage: number
  status: 'active' | 'archived' | 'deleted'
  aiProviderId?: string
  templateId?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}
