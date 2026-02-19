export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  name: string
  password: string
}

export interface RefreshRequest {
  refreshToken: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    name: string
    avatarUrl?: string
    preferences: Record<string, unknown>
  }
  tokens: AuthTokens
}
