import { useState, useRef, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Endpoint } from './types'

interface EndpointDetailProps {
  endpoint: Endpoint
}

function ParamsTable({ params, title }: { params: { name: string; type: string; required: boolean; description?: string }[]; title: string }) {
  if (params.length === 0) return null
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-zinc-600">{title}</label>
      <div className="overflow-x-auto rounded-md border border-zinc-200">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="px-3 py-1.5 text-left font-medium text-zinc-600">Name</th>
              <th className="px-3 py-1.5 text-left font-medium text-zinc-600">Type</th>
              <th className="px-3 py-1.5 text-left font-medium text-zinc-600">Required</th>
              <th className="px-3 py-1.5 text-left font-medium text-zinc-600">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {params.map((p) => (
              <tr key={p.name}>
                <td className="px-3 py-1.5 font-mono text-zinc-900">{p.name}</td>
                <td className="px-3 py-1.5 text-zinc-600">{p.type}</td>
                <td className="px-3 py-1.5 text-zinc-600">{p.required ? 'Yes' : 'No'}</td>
                <td className="px-3 py-1.5 text-zinc-400">{p.description ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SchemaTable({ fields, title }: { fields: { name: string; type: string; required: boolean; description?: string }[]; title: string }) {
  if (fields.length === 0) return null
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-zinc-600">{title}</label>
      <div className="overflow-x-auto rounded-md border border-zinc-200">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="px-3 py-1.5 text-left font-medium text-zinc-600">Field</th>
              <th className="px-3 py-1.5 text-left font-medium text-zinc-600">Type</th>
              <th className="px-3 py-1.5 text-left font-medium text-zinc-600">Required</th>
              <th className="px-3 py-1.5 text-left font-medium text-zinc-600">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {fields.map((f) => (
              <tr key={f.name}>
                <td className="px-3 py-1.5 font-mono text-zinc-900">{f.name}</td>
                <td className="px-3 py-1.5 text-zinc-600">{f.type}</td>
                <td className="px-3 py-1.5 text-zinc-600">{f.required ? 'Yes' : 'No'}</td>
                <td className="px-3 py-1.5 text-zinc-400">{f.description ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function EndpointDetail({ endpoint }: EndpointDetailProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  async function handleCopyCurl() {
    if (!endpoint.curlExample) return
    try {
      await navigator.clipboard.writeText(endpoint.curlExample)
      setCopied(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API may not be available
    }
  }

  const pathParams = endpoint.params.filter((p) => p.in === 'path')
  const queryParams = endpoint.params.filter((p) => p.in === 'query')

  return (
    <div className="space-y-3">
      {endpoint.description && (
        <p className="text-xs text-zinc-500">{endpoint.description}</p>
      )}

      <ParamsTable params={pathParams} title="Path Parameters" />
      <ParamsTable params={queryParams} title="Query Parameters" />

      {endpoint.requestBody && (
        <SchemaTable fields={endpoint.requestBody.schema} title={`Request Body (${endpoint.requestBody.contentType})`} />
      )}

      <SchemaTable fields={endpoint.response.schema} title={`Response ${endpoint.response.status} (${endpoint.response.contentType})`} />

      {endpoint.curlExample && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-600">cURL Example</label>
            <Button variant="ghost" size="sm" onClick={handleCopyCurl} className="h-6 text-xs">
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-success-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <pre className="overflow-auto rounded-md border border-zinc-200 bg-zinc-900 p-3 text-xs leading-relaxed">
            <code className="text-zinc-100 font-mono whitespace-pre">{endpoint.curlExample}</code>
          </pre>
        </div>
      )}
    </div>
  )
}
