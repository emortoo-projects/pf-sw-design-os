import type { RadiusTokens, ShadowTokens } from './types'

interface RadiusShadowEditorProps {
  radius: RadiusTokens
  shadows: ShadowTokens
  onRadiusChange: (radius: RadiusTokens) => void
  onShadowChange: (shadows: ShadowTokens) => void
}

export function RadiusShadowEditor({ radius, shadows, onRadiusChange, onShadowChange }: RadiusShadowEditorProps) {
  function handleRadiusValueChange(key: string, value: string) {
    onRadiusChange({ ...radius, [key]: value })
  }

  function handleShadowValueChange(key: string, value: string) {
    onShadowChange({ ...shadows, [key]: value })
  }

  return (
    <div className="space-y-5">
      {/* Border Radius */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-zinc-900">Border Radius</label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(radius).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3">
              <div
                className="h-10 w-10 shrink-0 border border-primary-300 bg-primary-100"
                style={{ borderRadius: value }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-zinc-700">{key}</p>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleRadiusValueChange(key, e.target.value)}
                  className="mt-0.5 w-full rounded border border-zinc-200 px-1.5 py-0.5 text-xs text-zinc-600"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shadows */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-zinc-900">Shadows</label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(shadows).map(([key, value]) => (
            <div key={key} className="rounded-lg border border-zinc-200 p-3">
              <div
                className="mx-auto mb-2 h-12 w-20 rounded-md bg-white"
                style={{ boxShadow: value }}
              />
              <p className="text-xs font-medium text-zinc-700">{key}</p>
              <input
                type="text"
                value={value}
                onChange={(e) => handleShadowValueChange(key, e.target.value)}
                className="mt-0.5 w-full rounded border border-zinc-200 px-1.5 py-0.5 text-xs text-zinc-600"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
