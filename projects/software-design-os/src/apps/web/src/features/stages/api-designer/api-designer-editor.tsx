import { useState, useEffect, useCallback } from 'react'
import type { Stage } from '@sdos/shared'
import { usePipelineStore } from '@/stores/pipeline-store'
import { SchemaPreview } from '@/features/stages/database-designer/schema-preview'
import { ApiViewToggle, type ApiViewMode } from './api-view-toggle'
import { EndpointList } from './endpoint-list'
import { AuthConfigPanel } from './auth-config-panel'
import { IntegrationsList } from './integrations-list'
import { AddIntegrationDialog } from './add-integration-dialog'
import { OpenApiPreview } from './openapi-preview'
import type { ApiDesign, AuthConfig, Endpoint, Integration } from './types'
import { createEmptyApiDesign } from './types'

interface ApiDesignerEditorProps {
  stage: Stage
}

function isEndpoint(e: unknown): e is Endpoint {
  return (
    typeof e === 'object' &&
    e !== null &&
    'id' in e &&
    'method' in e &&
    'path' in e &&
    'params' in e &&
    Array.isArray((e as Endpoint).params) &&
    'response' in e
  )
}

function parseApiDesign(data: Record<string, unknown> | undefined): ApiDesign {
  if (!data || !data.style) return createEmptyApiDesign()
  const auth = data.auth as AuthConfig | undefined
  return {
    style: (data.style as ApiDesign['style']) ?? 'rest',
    basePath: (data.basePath as string) ?? '/api',
    auth: auth && typeof auth.strategy === 'string' ? auth : { strategy: 'none' },
    endpoints: Array.isArray(data.endpoints) ? data.endpoints.filter(isEndpoint) : [],
    integrations: Array.isArray(data.integrations) ? data.integrations : [],
    pagination: data.pagination as ApiDesign['pagination'],
    errorFormat: data.errorFormat as ApiDesign['errorFormat'],
  }
}

export function ApiDesignerEditor({ stage }: ApiDesignerEditorProps) {
  const { setEditorDirty, setEditorData } = usePipelineStore()
  const [viewMode, setViewMode] = useState<ApiViewMode>('structured')
  const [apiDesign, setApiDesign] = useState<ApiDesign>(() => parseApiDesign(stage.data))
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null)
  const [showAddIntegration, setShowAddIntegration] = useState(false)

  const hasEndpoints = apiDesign.endpoints.length > 0

  useEffect(() => {
    if (stage.data && Object.keys(stage.data).length > 0) {
      setApiDesign(parseApiDesign(stage.data))
    }
  }, [stage.data])

  const updateApiDesign = useCallback(
    (updates: Partial<ApiDesign>) => {
      setApiDesign((prev) => {
        const next = { ...prev, ...updates }
        setEditorData(next as unknown as Record<string, unknown>)
        setEditorDirty(true)
        return next
      })
    },
    [setEditorData, setEditorDirty],
  )

  function handleAuthChange(auth: AuthConfig) {
    updateApiDesign({ auth })
  }

  function handleIntegrationsChange(integrations: Integration[]) {
    updateApiDesign({ integrations })
  }

  function handleAddIntegration(integration: Integration) {
    setApiDesign((prev) => {
      const next = { ...prev, integrations: [...prev.integrations, integration] }
      setEditorData(next as unknown as Record<string, unknown>)
      setEditorDirty(true)
      return next
    })
  }

  function handleToggleEndpoint(id: string) {
    setExpandedEndpoint((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-6">
      {/* Auth config — always visible */}
      <AuthConfigPanel auth={apiDesign.auth} onChange={handleAuthChange} />

      {/* View toggle and content */}
      {hasEndpoints && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">API Design</h3>
            <ApiViewToggle mode={viewMode} onToggle={setViewMode} />
          </div>

          {viewMode === 'structured' && (
            <div className="space-y-6">
              <EndpointList
                endpoints={apiDesign.endpoints}
                expandedId={expandedEndpoint}
                onToggle={handleToggleEndpoint}
              />
              <IntegrationsList
                integrations={apiDesign.integrations}
                onChange={handleIntegrationsChange}
                onAddClick={() => setShowAddIntegration(true)}
              />
            </div>
          )}

          {viewMode === 'openapi' && (
            <OpenApiPreview apiDesign={apiDesign} />
          )}

          {viewMode === 'json' && (
            <SchemaPreview
              schema={JSON.stringify(apiDesign, null, 2)}
              language="json"
            />
          )}
        </>
      )}

      {/* Empty state */}
      {!hasEndpoints && stage.status === 'active' && (
        <div className="flex flex-col items-center justify-center gap-2 py-8">
          <p className="text-xs text-zinc-300">
            Click Generate to create API endpoints from your data model.
          </p>
        </div>
      )}

      {/* Add Integration Dialog */}
      <AddIntegrationDialog
        open={showAddIntegration}
        onOpenChange={setShowAddIntegration}
        onAdd={handleAddIntegration}
      />
    </div>
  )
}
