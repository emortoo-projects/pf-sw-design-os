import { Shield, Key, Globe, Lock, Ban } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AuthConfig, AuthStrategy } from './types'

interface AuthConfigPanelProps {
  auth: AuthConfig
  onChange: (auth: AuthConfig) => void
}

const strategies: Array<{ value: AuthStrategy; label: string; icon: typeof Shield; description: string }> = [
  { value: 'jwt', label: 'JWT', icon: Shield, description: 'Token-based authentication with refresh tokens' },
  { value: 'api-key', label: 'API Key', icon: Key, description: 'Simple header-based key authentication' },
  { value: 'oauth', label: 'OAuth', icon: Globe, description: 'Third-party provider authentication' },
  { value: 'session', label: 'Session', icon: Lock, description: 'Server-side session with cookies' },
  { value: 'none', label: 'None', icon: Ban, description: 'No authentication required' },
]

export function AuthConfigPanel({ auth, onChange }: AuthConfigPanelProps) {
  function handleStrategyChange(strategy: AuthStrategy) {
    const next: AuthConfig = { strategy }
    if (strategy === 'jwt') {
      next.jwt = auth.jwt ?? { tokenExpiry: '7d', refreshTokenExpiry: '30d' }
    } else if (strategy === 'oauth') {
      next.oauth = auth.oauth ?? { providers: ['google'] }
    } else if (strategy === 'api-key') {
      next.apiKey = auth.apiKey ?? { headerName: 'X-API-Key' }
    }
    onChange(next)
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-zinc-900">Authentication</h4>

      {/* Strategy selector */}
      <div className="grid grid-cols-5 gap-2">
        {strategies.map(({ value, label, icon: Icon, description }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleStrategyChange(value)}
            title={description}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors',
              auth.strategy === value
                ? 'border-primary-400 bg-primary-50 ring-1 ring-primary-200'
                : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50',
            )}
          >
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md',
              auth.strategy === value
                ? 'bg-primary-100 text-primary-600'
                : 'bg-zinc-100 text-zinc-500',
            )}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Conditional config fields */}
      {auth.strategy === 'jwt' && auth.jwt && (
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-zinc-200 bg-zinc-50/50 p-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-600">Token Expiry</label>
            <input
              type="text"
              value={auth.jwt.tokenExpiry}
              onChange={(e) => onChange({ ...auth, jwt: { ...auth.jwt!, tokenExpiry: e.target.value } })}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-600">Refresh Token Expiry</label>
            <input
              type="text"
              value={auth.jwt.refreshTokenExpiry}
              onChange={(e) => onChange({ ...auth, jwt: { ...auth.jwt!, refreshTokenExpiry: e.target.value } })}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
          {auth.jwt.issuer !== undefined && (
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-zinc-600">Issuer</label>
              <input
                type="text"
                value={auth.jwt.issuer ?? ''}
                onChange={(e) => onChange({ ...auth, jwt: { ...auth.jwt!, issuer: e.target.value } })}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
          )}
        </div>
      )}

      {auth.strategy === 'api-key' && auth.apiKey && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-600">Header Name</label>
            <input
              type="text"
              value={auth.apiKey.headerName}
              onChange={(e) => onChange({ ...auth, apiKey: { headerName: e.target.value } })}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
        </div>
      )}

      {auth.strategy === 'oauth' && auth.oauth && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-600">Providers</label>
            <input
              type="text"
              value={auth.oauth.providers.join(', ')}
              onChange={(e) => onChange({ ...auth, oauth: { providers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) } })}
              placeholder="google, github, discord"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
            <p className="text-xs text-zinc-400">Comma-separated list of OAuth providers</p>
          </div>
        </div>
      )}
    </div>
  )
}
