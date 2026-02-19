import type { Typography } from './types'
import { FONT_OPTIONS } from './types'

interface TypographyPreviewProps {
  typography: Typography
  onChange: (typography: Typography) => void
}

type FontRole = 'heading' | 'body' | 'mono'

const FONT_ROLES: Array<{ key: FontRole; label: string; sample: string }> = [
  { key: 'heading', label: 'Heading', sample: 'The quick brown fox jumps over the lazy dog' },
  { key: 'body', label: 'Body', sample: 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.' },
  { key: 'mono', label: 'Monospace', sample: 'const greeting = "Hello, world!";' },
]

export function TypographyPreview({ typography, onChange }: TypographyPreviewProps) {
  function handleFontChange(role: FontRole, fontFamily: string) {
    onChange({
      ...typography,
      [role]: { ...typography[role], fontFamily },
    })
  }

  const scaleEntries = Object.entries(typography.scale)

  return (
    <div className="space-y-4">
      <label className="text-sm font-semibold text-zinc-900">Typography</label>

      {FONT_ROLES.map(({ key, label, sample }) => (
        <div key={key} className="space-y-2 rounded-lg border border-zinc-200 p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-zinc-600">{label}</span>
            <select
              value={typography[key].fontFamily}
              onChange={(e) => handleFontChange(key, e.target.value)}
              className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-1">
            {typography[key].weights.map((w) => (
              <span key={w} className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500">{w}</span>
            ))}
          </div>
          <p
            className="text-sm text-zinc-800"
            style={{ fontFamily: typography[key].fontFamily }}
          >
            {sample}
          </p>
        </div>
      ))}

      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-600">Type Scale</label>
        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-3 py-1.5 text-left font-medium text-zinc-500">Size</th>
                <th className="px-3 py-1.5 text-left font-medium text-zinc-500">Value</th>
                <th className="px-3 py-1.5 text-left font-medium text-zinc-500">Preview</th>
              </tr>
            </thead>
            <tbody>
              {scaleEntries.map(([name, value]) => (
                <tr key={name} className="border-b border-zinc-50">
                  <td className="px-3 py-1.5 font-mono text-zinc-600">{name}</td>
                  <td className="px-3 py-1.5 text-zinc-400">{value}</td>
                  <td className="px-3 py-1.5">
                    <span
                      style={{
                        fontSize: value,
                        fontFamily: typography.body.fontFamily,
                      }}
                      className="text-zinc-800"
                    >
                      Aa
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
