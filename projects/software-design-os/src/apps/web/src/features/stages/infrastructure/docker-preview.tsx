import { useState, useRef, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DockerConfig } from './types'

interface DockerPreviewProps {
  docker: DockerConfig
  onChange: (docker: DockerConfig) => void
}

function CodeBlock({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API may not be available in all contexts
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-700">{label}</label>
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
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="w-full rounded-lg border border-zinc-200 bg-zinc-900 p-4 font-mono text-xs leading-relaxed text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        rows={Math.min(30, Math.max(8, value.split('\n').length + 1))}
      />
    </div>
  )
}

export function DockerPreview({ docker, onChange }: DockerPreviewProps) {
  return (
    <div className="space-y-4">
      <CodeBlock
        label="Dockerfile"
        value={docker.dockerfile}
        onChange={(dockerfile) => onChange({ ...docker, dockerfile })}
      />
      <CodeBlock
        label="docker-compose.yml"
        value={docker.compose}
        onChange={(compose) => onChange({ ...docker, compose })}
      />
    </div>
  )
}
