import type { DesignSystem } from './types'

interface ComponentPreviewProps {
  tokens: DesignSystem
}

export function ComponentPreview({ tokens }: ComponentPreviewProps) {
  const { colors, typography, borderRadius, shadows } = tokens

  const styles = {
    primaryBg: { backgroundColor: colors.primary['500'] },
    primaryText: { color: colors.primary['500'] },
    primaryBorder: { borderColor: colors.primary['500'] },
    bodyFont: { fontFamily: typography.body.fontFamily },
    headingFont: { fontFamily: typography.heading.fontFamily },
    monoFont: { fontFamily: typography.mono.fontFamily },
    radiusMd: borderRadius.md,
    radiusSm: borderRadius.sm,
    shadowSm: shadows.sm,
    shadowMd: shadows.md,
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-zinc-900">Component Preview</label>
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <div className="flex flex-wrap gap-4">

          {/* Buttons */}
          <div className="space-y-2">
            <p className="text-xs text-zinc-500" style={styles.bodyFont}>Buttons</p>
            <div className="flex gap-2">
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-medium text-white"
                style={{
                  ...styles.primaryBg,
                  ...styles.bodyFont,
                  borderRadius: styles.radiusMd,
                  boxShadow: styles.shadowSm,
                }}
              >
                Primary
              </button>
              <button
                type="button"
                className="border px-3 py-1.5 text-xs font-medium"
                style={{
                  ...styles.primaryText,
                  ...styles.primaryBorder,
                  ...styles.bodyFont,
                  borderRadius: styles.radiusMd,
                  backgroundColor: 'white',
                }}
              >
                Outline
              </button>
            </div>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <p className="text-xs text-zinc-500" style={styles.bodyFont}>Input</p>
            <input
              type="text"
              placeholder="Enter text..."
              className="border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-700"
              style={{
                ...styles.bodyFont,
                borderRadius: styles.radiusMd,
              }}
              readOnly
            />
          </div>

          {/* Badge */}
          <div className="space-y-2">
            <p className="text-xs text-zinc-500" style={styles.bodyFont}>Badge</p>
            <span
              className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium text-white"
              style={{
                ...styles.primaryBg,
                ...styles.bodyFont,
                borderRadius: borderRadius.full,
              }}
            >
              New
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="mt-4 space-y-2">
          <p className="text-xs text-zinc-500" style={styles.bodyFont}>Card</p>
          <div
            className="border border-zinc-200 bg-white p-3"
            style={{
              borderRadius: styles.radiusMd,
              boxShadow: styles.shadowMd,
            }}
          >
            <h4
              className="text-sm font-semibold text-zinc-900"
              style={styles.headingFont}
            >
              Card Title
            </h4>
            <p
              className="mt-1 text-xs text-zinc-500"
              style={styles.bodyFont}
            >
              This card uses your design tokens for radius, shadow, and typography.
            </p>
          </div>
        </div>

        {/* Table row */}
        <div className="mt-4 space-y-2">
          <p className="text-xs text-zinc-500" style={styles.bodyFont}>Table</p>
          <div
            className="overflow-hidden border border-zinc-200"
            style={{ borderRadius: styles.radiusSm }}
          >
            <table className="w-full text-xs" style={styles.bodyFont}>
              <thead>
                <tr style={{ backgroundColor: colors.neutral['100'] }}>
                  <th className="px-3 py-1.5 text-left font-medium" style={{ color: colors.neutral['600'] }}>Name</th>
                  <th className="px-3 py-1.5 text-left font-medium" style={{ color: colors.neutral['600'] }}>Status</th>
                  <th className="px-3 py-1.5 text-left font-medium" style={{ color: colors.neutral['600'] }}>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-zinc-100">
                  <td className="px-3 py-1.5 text-zinc-700">Design tokens</td>
                  <td className="px-3 py-1.5">
                    <span
                      className="inline-block px-1.5 py-0.5 text-[10px] font-medium text-white"
                      style={{
                        backgroundColor: colors.primary['500'],
                        borderRadius: borderRadius.sm,
                      }}
                    >
                      Active
                    </span>
                  </td>
                  <td className="px-3 py-1.5 font-mono" style={styles.monoFont}>42</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
