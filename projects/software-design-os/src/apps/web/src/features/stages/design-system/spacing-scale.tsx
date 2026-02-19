import type { SpacingConfig } from './types'

interface SpacingScaleProps {
  spacing: SpacingConfig
  onChange: (spacing: SpacingConfig) => void
}

export function SpacingScale({ spacing, onChange }: SpacingScaleProps) {
  function handleBaseChange(value: number) {
    onChange({ ...spacing, base: value })
  }

  const maxPx = spacing.base * Math.max(...spacing.scale, 1)

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-zinc-900">Spacing Scale</label>

      <div className="flex items-center gap-2">
        <label className="text-xs text-zinc-600">Base unit (px):</label>
        <input
          type="number"
          min={1}
          max={16}
          value={spacing.base}
          onChange={(e) => handleBaseChange(Number(e.target.value) || 4)}
          className="w-16 rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-700"
        />
      </div>

      <div className="space-y-1.5">
        {spacing.scale.map((multiplier) => {
          const px = spacing.base * multiplier
          const widthPercent = maxPx > 0 ? (px / maxPx) * 100 : 0
          return (
            <div key={multiplier} className="flex items-center gap-2">
              <span className="w-8 text-right text-xs font-mono text-zinc-400">{multiplier}</span>
              <div className="flex-1">
                <div
                  className="h-4 rounded-sm bg-primary-400 transition-all"
                  style={{ width: `${Math.max(widthPercent, 1)}%` }}
                />
              </div>
              <span className="w-12 text-right text-xs text-zinc-500">{px}px</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
