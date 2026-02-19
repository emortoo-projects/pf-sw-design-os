import { useState, useRef, useEffect } from 'react'
import { Key, Plus, Trash2, Copy, Check, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { useMCPTokens, useCreateMCPToken, useDeleteMCPToken } from '@/hooks/use-mcp-tokens'
import { useProjects } from '@/hooks/use-projects'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function MCPTokenManager() {
  const { data: tokens, isLoading } = useMCPTokens()
  const { data: projects } = useProjects()
  const createToken = useCreateMCPToken()
  const deleteToken = useDeleteMCPToken()

  const [createOpen, setCreateOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<{ tokenId: string; projectId: string; label: string } | null>(null)
  const [newLabel, setNewLabel] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  // Auto-select first project when projects load
  useEffect(() => {
    if (projects?.length && !selectedProjectId) {
      setSelectedProjectId(projects[0].id)
    }
  }, [projects, selectedProjectId])

  function handleCreate() {
    if (!newLabel.trim() || !selectedProjectId) return
    createToken.mutate(
      { projectId: selectedProjectId, label: newLabel.trim() },
      {
        onSuccess: (data) => {
          setNewlyCreatedToken(data.plaintext)
          setNewLabel('')
        },
      },
    )
  }

  function handleCloseCreate() {
    setCreateOpen(false)
    setNewlyCreatedToken(null)
    setNewLabel('')
    setSelectedProjectId(projects?.[0]?.id ?? '')
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

  function handleDelete() {
    if (!deleteId) return
    deleteToken.mutate(
      { projectId: deleteId.projectId, tokenId: deleteId.tokenId },
      { onSuccess: () => setDeleteId(null) },
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    )
  }

  const tokenList = tokens ?? []

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

      {tokenList.length === 0 ? (
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
              {tokenList.map((token) => (
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
                      onClick={() => setDeleteId({ tokenId: token.id, projectId: token.projectId, label: token.label })}
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
              <label htmlFor="tok-project" className="text-sm font-medium text-zinc-700">Project</label>
              <select
                id="tok-project"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {(projects ?? []).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
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
              <Button
                onClick={handleCreate}
                disabled={!newLabel.trim() || !selectedProjectId || createToken.isPending}
              >
                {createToken.isPending ? 'Creating...' : 'Create Token'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogHeader>
          <DialogTitle>Delete Token</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{deleteId?.label}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteToken.isPending}>
            {deleteToken.isPending ? 'Deleting...' : 'Delete Token'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
