import { useState, useRef, useEffect } from 'react'
import { Download, Copy, Check, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SDPManifest, ExportFormat } from './types'
import { formatBytes } from './types'

interface ExportActionsProps {
  manifest: SDPManifest
  totalSizeBytes: number
  validationHasErrors: boolean
}

export function ExportActions({ manifest, totalSizeBytes, validationHasErrors }: ExportActionsProps) {
  const [format, setFormat] = useState<ExportFormat>('zip')
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  async function handleCopyManifest() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(manifest, null, 2))
      setCopied(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API may not be available
    }
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2">
      <div className="flex items-center gap-3">
        <div className="flex rounded-md border border-zinc-200 text-xs">
          <button
            onClick={() => setFormat('folder')}
            className={`px-2.5 py-1 rounded-l-md font-medium ${format === 'folder' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}
          >
            Folder
          </button>
          <button
            onClick={() => setFormat('zip')}
            className={`px-2.5 py-1 rounded-r-md font-medium ${format === 'zip' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}
          >
            ZIP
          </button>
        </div>

        <Button
          variant="default"
          size="sm"
          disabled={validationHasErrors}
          onClick={() => {
            // Mock download action — in production this would trigger the real export
          }}
        >
          <Download className="h-3.5 w-3.5" />
          Download {format === 'zip' ? '.zip' : 'folder'}
        </Button>

        <Button variant="ghost" size="sm" onClick={handleCopyManifest}>
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy Manifest
            </>
          )}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {validationHasErrors && (
          <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            <AlertTriangle className="h-3 w-3" />
            Validation errors
          </span>
        )}
        <span className="text-xs text-zinc-500">
          Total: {formatBytes(totalSizeBytes)}
        </span>
      </div>
    </div>
  )
}
