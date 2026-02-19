import { useState, useEffect } from 'react'
import type { ProductDefinition } from './types'

interface RawJsonEditorProps {
  data: ProductDefinition
  onChange: (data: ProductDefinition) => void
}

export function RawJsonEditor({ data, onChange }: RawJsonEditorProps) {
  const [text, setText] = useState(() => JSON.stringify(data, null, 2))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setText(JSON.stringify(data, null, 2))
    setError(null)
  }, [data])

  function handleChange(value: string) {
    setText(value)
    try {
      const parsed = JSON.parse(value)
      setError(null)
      onChange(parsed)
    } catch {
      setError('Invalid JSON')
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-700">Raw JSON</h3>
        {error && <span className="text-xs text-error-500">{error}</span>}
      </div>
      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        spellCheck={false}
        rows={20}
        className={`w-full resize-y rounded-lg border bg-zinc-950 px-4 py-3 font-mono text-xs text-emerald-400 placeholder:text-zinc-600 focus:outline-none focus:ring-2 ${
          error ? 'border-error-500 focus:ring-error-300' : 'border-zinc-700 focus:ring-primary-300'
        }`}
      />
    </div>
  )
}
