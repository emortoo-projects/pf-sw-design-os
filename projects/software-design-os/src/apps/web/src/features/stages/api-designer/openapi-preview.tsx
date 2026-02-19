import { useState, useRef, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ApiDesign } from './types'

interface OpenApiPreviewProps {
  apiDesign: ApiDesign
}

function indent(level: number): string {
  return '  '.repeat(level)
}

function generateOpenApiYaml(api: ApiDesign): string {
  const lines: string[] = []

  lines.push("openapi: '3.0.3'")
  lines.push('info:')
  lines.push(`${indent(1)}title: API Design`)
  lines.push(`${indent(1)}version: '1.0.0'`)
  lines.push(`${indent(1)}description: Generated API specification`)
  lines.push('')

  lines.push('servers:')
  lines.push(`${indent(1)}- url: ${api.basePath}`)
  lines.push('')

  // Auth / security schemes
  if (api.auth.strategy !== 'none') {
    lines.push('components:')
    lines.push(`${indent(1)}securitySchemes:`)
    if (api.auth.strategy === 'jwt') {
      lines.push(`${indent(2)}BearerAuth:`)
      lines.push(`${indent(3)}type: http`)
      lines.push(`${indent(3)}scheme: bearer`)
      lines.push(`${indent(3)}bearerFormat: JWT`)
    } else if (api.auth.strategy === 'api-key') {
      lines.push(`${indent(2)}ApiKeyAuth:`)
      lines.push(`${indent(3)}type: apiKey`)
      lines.push(`${indent(3)}in: header`)
      lines.push(`${indent(3)}name: ${api.auth.apiKey?.headerName ?? 'X-API-Key'}`)
    } else if (api.auth.strategy === 'oauth') {
      lines.push(`${indent(2)}OAuth2:`)
      lines.push(`${indent(3)}type: oauth2`)
      lines.push(`${indent(3)}flows:`)
      lines.push(`${indent(4)}authorizationCode:`)
      lines.push(`${indent(5)}authorizationUrl: /oauth/authorize`)
      lines.push(`${indent(5)}tokenUrl: /oauth/token`)
    }
    lines.push('')
    lines.push('security:')
    if (api.auth.strategy === 'jwt') lines.push(`${indent(1)}- BearerAuth: []`)
    else if (api.auth.strategy === 'api-key') lines.push(`${indent(1)}- ApiKeyAuth: []`)
    else if (api.auth.strategy === 'oauth') lines.push(`${indent(1)}- OAuth2: []`)
    lines.push('')
  }

  // Paths
  lines.push('paths:')
  const pathGroups: Record<string, typeof api.endpoints> = {}
  for (const ep of api.endpoints) {
    if (!pathGroups[ep.path]) pathGroups[ep.path] = []
    pathGroups[ep.path].push(ep)
  }

  for (const [path, endpoints] of Object.entries(pathGroups)) {
    lines.push(`${indent(1)}${path}:`)
    for (const ep of endpoints) {
      const method = ep.method.toLowerCase()
      lines.push(`${indent(2)}${method}:`)
      lines.push(`${indent(3)}summary: ${ep.summary}`)
      lines.push(`${indent(3)}tags:`)
      lines.push(`${indent(4)}- ${ep.tag}`)

      if (ep.params.length > 0) {
        lines.push(`${indent(3)}parameters:`)
        for (const p of ep.params) {
          lines.push(`${indent(4)}- name: ${p.name}`)
          lines.push(`${indent(5)}in: ${p.in}`)
          lines.push(`${indent(5)}required: ${p.required}`)
          lines.push(`${indent(5)}schema:`)
          lines.push(`${indent(6)}type: ${p.type}`)
        }
      }

      if (ep.requestBody) {
        lines.push(`${indent(3)}requestBody:`)
        lines.push(`${indent(4)}required: true`)
        lines.push(`${indent(4)}content:`)
        lines.push(`${indent(5)}${ep.requestBody.contentType}:`)
        lines.push(`${indent(6)}schema:`)
        lines.push(`${indent(7)}type: object`)
        lines.push(`${indent(7)}properties:`)
        for (const f of ep.requestBody.schema) {
          lines.push(`${indent(8)}${f.name}:`)
          lines.push(`${indent(9)}type: ${f.type}`)
          if (f.description) lines.push(`${indent(9)}description: ${f.description}`)
        }
      }

      lines.push(`${indent(3)}responses:`)
      lines.push(`${indent(4)}'${ep.response.status}':`)
      lines.push(`${indent(5)}description: Success`)
      lines.push(`${indent(5)}content:`)
      lines.push(`${indent(6)}${ep.response.contentType}:`)
      lines.push(`${indent(7)}schema:`)
      lines.push(`${indent(8)}type: object`)
      lines.push(`${indent(8)}properties:`)
      for (const f of ep.response.schema) {
        lines.push(`${indent(9)}${f.name}:`)
        lines.push(`${indent(10)}type: ${f.type}`)
        if (f.description) lines.push(`${indent(10)}description: ${f.description}`)
      }
    }
  }

  return lines.join('\n')
}

export function OpenApiPreview({ apiDesign }: OpenApiPreviewProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const yaml = generateOpenApiYaml(apiDesign)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(yaml)
      setCopied(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API may not be available
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-700">OpenAPI 3.0 Specification</label>
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-success-500" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>
      <div className="relative">
        <pre className="max-h-[500px] overflow-auto rounded-lg border border-zinc-200 bg-zinc-900 p-4 text-xs leading-relaxed">
          <code className="text-zinc-100 font-mono whitespace-pre">{yaml}</code>
        </pre>
      </div>
    </div>
  )
}
