import { useState, useRef, useEffect } from 'react'
import { Key, Plus, Trash2, Copy, Check, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import type { MCPToken } from './types'
import { generateSettingsId } from './types'

interface MCPTokenManagerProps {
  tokens: MCPToken[]
  onChange: (tokens: MCPToken[]) => void
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function generateTokenPrefix(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let suffix = ''
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)]
  }
  return `sdp_live_${suffix}`
}

export function MCPTokenManager({ tokens, onChange }: MCPTokenManagerProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [revokeId, setRevokeId] = useState<string | null>(null)
  const [newLabel, setNewLabel] = useState('')
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const activeTokens = tokens.filter((t) => !t.revoked)

  function handleCreate() {
    if (!newLabel.trim()) return
    const fullToken = `${generateTokenPrefix()}_${crypto.randomUUID().replace(/-/g, '').slice(0, 32)}`
    const token: MCPToken = {
      id: generateSettingsId('tok'),
      label: newLabel.trim(),
      projectId: 'mock-project-1',
      projectName: 'Software Design OS',
      tokenPrefix: fullToken.slice(0, 13),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
      revoked: false,
    }
    onChange([...tokens, token])
    setNewlyCreatedToken(fullToken)
    setNewLabel('')
  }

  function handleCloseCreate() {
    setCreateOpen(false)
    setNewlyCreatedToken(null)
    setNewLabel('')
  }

  async function handleCopyToken() {
    if (!newlyCreatedToken) return
    try {
      await navigator.clipboard.writeText(newlyCreatedToken)
      setCopied(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API may not be available
    }
  }

  function handleRevoke() {
    if (!revokeId) return
    onChange(tokens.map((t) => (t.id === revokeId ? { ...t, revoked: true } : t)))
    setRevokeId(null)
  }

  const tokenToRevoke = tokens.find((t) => t.id === revokeId)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">MCP Access Tokens</h3>
          <p className="text-xs text-zinc-500">Tokens for AI agents to access your SDP via MCP</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          Create Token
        </Button>
      </div>

      {activeTokens.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-zinc-200 py-8 text-center">
          <Key className="mx-auto h-8 w-8 text-zinc-300" />
          <p className="mt-2 text-sm text-zinc-500">No MCP tokens created</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500">Label</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500">Project</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500">Token</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500">Created</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500">Last Used</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500">Expires</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {activeTokens.map((token) => (
                <tr key={token.id} className="bg-white">
                  <td className="px-4 py-2.5 font-medium text-zinc-900">{token.label}</td>
                  <td className="px-4 py-2.5 text-zinc-500">{token.projectName}</td>
                  <td className="px-4 py-2.5">
                    <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-mono text-zinc-600">
                      {token.tokenPrefix}...
                    </code>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-500">{formatDate(token.createdAt)}</td>
                  <td className="px-4 py-2.5 text-zinc-500">
                    {token.lastUsedAt ? formatDate(token.lastUsedAt) : 'Never'}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-500">{formatDate(token.expiresAt)}</td>
                  <td className="px-4 py-2.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRevokeId(token.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Token Dialog */}
      <Dialog open={createOpen} onOpenChange={handleCloseCreate}>
        <DialogHeader>
          <DialogTitle>{newlyCreatedToken ? 'Token Created' : 'Create MCP Token'}</DialogTitle>
          {!newlyCreatedToken && (
            <DialogDescription>
              Create an access token for AI agents to query your SDP.
            </DialogDescription>
          )}
        </DialogHeader>

        {newlyCreatedToken ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-amber-800">
                <AlertTriangle className="h-3.5 w-3.5" />
                Copy this token now — it won't be shown again.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-mono text-zinc-700 break-all">
                {newlyCreatedToken}
              </code>
              <Button variant="outline" size="sm" onClick={handleCopyToken}>
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={handleCloseCreate}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="tok-label" className="text-sm font-medium text-zinc-700">Token Label</label>
              <input
                id="tok-label"
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="CI/CD Pipeline"
                autoFocus
                className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={handleCloseCreate}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!newLabel.trim()}>Create Token</Button>
            </DialogFooter>
          </div>
        )}
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <Dialog open={!!revokeId} onOpenChange={() => setRevokeId(null)}>
        <DialogHeader>
          <DialogTitle>Revoke Token</DialogTitle>
          <DialogDescription>
            Are you sure you want to revoke "{tokenToRevoke?.label}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => setRevokeId(null)}>Cancel</Button>
          <Button variant="destructive" onClick={handleRevoke}>Revoke Token</Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
