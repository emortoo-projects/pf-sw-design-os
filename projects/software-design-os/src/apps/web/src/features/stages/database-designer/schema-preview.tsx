import { useState, useRef, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SchemaPreviewProps {
  schema: string
  language: 'sql' | 'json' | 'css' | 'yaml' | 'markdown'
}

export function SchemaPreview({ schema, language }: SchemaPreviewProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(schema)
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
        <label className="text-sm font-medium text-zinc-700">
          {language === 'sql' ? 'SQL Schema' : language === 'css' ? 'CSS Variables' : language === 'yaml' ? 'YAML' : language === 'markdown' ? 'Markdown' : 'JSON Schema'}
        </label>
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
          <code className="text-zinc-100 font-mono whitespace-pre">{schema}</code>
        </pre>
      </div>
    </div>
  )
}
