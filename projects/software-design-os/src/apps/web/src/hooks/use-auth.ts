import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { apiClient } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'

export function useAuth() {
  return useAuthStore()
}

export function useLogin() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiClient.login(email, password),
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

export function useRegister() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ email, name, password }: { email: string; name: string; password: string }) =>
      apiClient.register(email, name, password),
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

export function useLogout() {
  const { refreshToken, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return () => {
    // Best-effort server-side revocation
    if (refreshToken) {
      apiClient.logout(refreshToken).catch(() => {})
    }
    clearAuth()
    queryClient.clear()
    navigate('/login')
  }
}

export function useMe() {
  const { isAuthenticated, setUser, clearAuth, setLoading } = useAuthStore()

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        const user = await apiClient.getMe()
        setUser(user)
        return user
      } catch (err) {
        clearAuth()
        throw err
      }
    },
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000,
    meta: {
      onSettled: () => setLoading(false),
    },
  })
}
