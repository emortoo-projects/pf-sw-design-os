import type { DesignSystem } from './types'
import { COLOR_SHADES } from './types'

export function generateCssVariables(ds: DesignSystem): string {
  const lines: string[] = [':root {']

  // Colors
  const palettes = ['primary', 'secondary', 'neutral'] as const
  for (const palette of palettes) {
    for (const shade of COLOR_SHADES) {
      lines.push(`  --color-${palette}-${shade}: ${ds.colors[palette][shade]};`)
    }
  }

  lines.push('')

  // Typography
  lines.push(`  --font-heading: ${ds.typography.heading.fontFamily};`)
  lines.push(`  --font-body: ${ds.typography.body.fontFamily};`)
  lines.push(`  --font-mono: ${ds.typography.mono.fontFamily};`)

  lines.push('')

  // Type scale
  for (const [name, value] of Object.entries(ds.typography.scale)) {
    lines.push(`  --text-${name}: ${value};`)
  }

  lines.push('')

  // Spacing
  lines.push(`  --spacing-base: ${ds.spacing.base}px;`)
  for (const multiplier of ds.spacing.scale) {
    lines.push(`  --spacing-${multiplier}: ${ds.spacing.base * multiplier}px;`)
  }

  lines.push('')

  // Border radius
  for (const [name, value] of Object.entries(ds.borderRadius)) {
    lines.push(`  --radius-${name}: ${value};`)
  }

  lines.push('')

  // Shadows
  for (const [name, value] of Object.entries(ds.shadows)) {
    lines.push(`  --shadow-${name}: ${value};`)
  }

  lines.push('}')

  return lines.join('\n')
}
