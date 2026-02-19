import { useRef } from 'react'
import { cn } from '@/lib/utils'
import type { ColorPalettes, ColorShade } from './types'
import { COLOR_SHADES } from './types'

interface ColorTokenEditorProps {
  colors: ColorPalettes
  onChange: (colors: ColorPalettes) => void
}

type PaletteName = 'primary' | 'secondary' | 'neutral'

const PALETTE_NAMES: PaletteName[] = ['primary', 'secondary', 'neutral']

function PaletteRow({
  name,
  palette,
  onShadeChange,
}: {
  name: PaletteName
  palette: Record<ColorShade, string>
  onShadeChange: (shade: ColorShade, value: string) => void
}) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium capitalize text-zinc-700">{name}</label>
      <div className="flex flex-wrap gap-1.5">
        {COLOR_SHADES.map((shade) => (
          <div key={shade} className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => inputRefs.current[shade]?.click()}
              className={cn(
                'h-10 w-10 rounded-md border border-zinc-200 transition-all',
                'hover:ring-2 hover:ring-primary-300 hover:ring-offset-1',
                'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1',
              )}
              style={{ backgroundColor: palette[shade] }}
              aria-label={`${name} ${shade}: ${palette[shade]}`}
            />
            <input
              ref={(el) => { inputRefs.current[shade] = el }}
              type="color"
              value={palette[shade]}
              onChange={(e) => onShadeChange(shade, e.target.value)}
              className="sr-only"
              tabIndex={-1}
            />
            <span className="text-[10px] text-zinc-400">{shade}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ColorTokenEditor({ colors, onChange }: ColorTokenEditorProps) {
  function handleShadeChange(palette: PaletteName, shade: ColorShade, value: string) {
    onChange({
      ...colors,
      [palette]: { ...colors[palette], [shade]: value },
    })
  }

  return (
    <div className="space-y-4">
      <label className="text-sm font-semibold text-zinc-900">Color Palettes</label>
      {PALETTE_NAMES.map((name) => (
        <PaletteRow
          key={name}
          name={name}
          palette={colors[name]}
          onShadeChange={(shade, value) => handleShadeChange(name, shade, value)}
        />
      ))}
    </div>
  )
}
