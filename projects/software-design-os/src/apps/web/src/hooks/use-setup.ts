import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { apiClient } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'

export function useSetupStatus() {
  return useQuery({
    queryKey: ['setup-status'],
    queryFn: () => apiClient.getSetupStatus(),
    staleTime: 0,
  })
}

export interface SetupInput {
  admin: {
    email: string
    name: string
    password: string
  }
  provider?: {
    provider: 'anthropic' | 'openai' | 'openrouter' | 'deepseek' | 'kimi' | 'custom'
    label: string
    apiKey: string
    defaultModel: string
    baseUrl?: string
  }
}

export function useCompleteSetup() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (input: SetupInput) => apiClient.completeSetup(input),
    onSuccess: (data) => {
      setAuth(
        { ...data.user, createdAt: '', updatedAt: '' },
        data.tokens.accessToken,
        data.tokens.refreshToken,
      )
      navigate('/')
    },
  })
}
