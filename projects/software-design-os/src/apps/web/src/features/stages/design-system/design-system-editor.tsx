import { useState, useEffect, useCallback } from 'react'
import type { Stage } from '@sdos/shared'
import { usePipelineStore } from '@/stores/pipeline-store'
import { SchemaPreview } from '@/features/stages/database-designer/schema-preview'
import { DesignViewToggle, type DesignViewMode } from './design-view-toggle'
import { ColorTokenEditor } from './color-token-editor'
import { TypographyPreview } from './typography-preview'
import { SpacingScale } from './spacing-scale'
import { RadiusShadowEditor } from './radius-shadow-editor'
import { AppShellConfigurator } from './app-shell-configurator'
import { ComponentPreview } from './component-preview'
import { generateCssVariables } from './generate-css-variables'
import type { DesignSystem, ColorPalette, ColorPalettes, Typography, SpacingConfig, RadiusTokens, ShadowTokens, AppShellConfig } from './types'
import { COLOR_SHADES, createEmptyDesignSystem } from './types'

interface DesignSystemEditorProps {
  stage: Stage
}

function isColorPalette(v: unknown): v is ColorPalette {
  if (typeof v !== 'object' || v === null) return false
  const obj = v as Record<string, unknown>
  return COLOR_SHADES.every((shade) => typeof obj[shade] === 'string')
}

function isColorPalettes(v: unknown): v is ColorPalettes {
  if (typeof v !== 'object' || v === null) return false
  const obj = v as Record<string, unknown>
  return isColorPalette(obj.primary) && isColorPalette(obj.secondary) && isColorPalette(obj.neutral)
}

function isTypography(v: unknown): v is Typography {
  if (typeof v !== 'object' || v === null) return false
  const obj = v as Record<string, unknown>
  return (
    typeof obj.heading === 'object' && obj.heading !== null &&
    typeof obj.body === 'object' && obj.body !== null &&
    typeof obj.mono === 'object' && obj.mono !== null &&
    typeof obj.scale === 'object' && obj.scale !== null
  )
}

function isSpacingConfig(v: unknown): v is SpacingConfig {
  if (typeof v !== 'object' || v === null) return false
  const obj = v as Record<string, unknown>
  return typeof obj.base === 'number' && Array.isArray(obj.scale)
}

function isDesignSystem(data: unknown): data is DesignSystem {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return isColorPalettes(d.colors) && isTypography(d.typography) && isSpacingConfig(d.spacing)
}

function parseDesignSystem(data: Record<string, unknown> | undefined): DesignSystem {
  if (!data || !isDesignSystem(data)) return createEmptyDesignSystem()

  const defaults = createEmptyDesignSystem()
  return {
    colors: data.colors,
    typography: data.typography,
    spacing: data.spacing,
    borderRadius: (typeof data.borderRadius === 'object' && data.borderRadius !== null
      ? data.borderRadius as RadiusTokens
      : defaults.borderRadius),
    shadows: (typeof data.shadows === 'object' && data.shadows !== null
      ? data.shadows as ShadowTokens
      : defaults.shadows),
    applicationShell: (typeof data.applicationShell === 'object' && data.applicationShell !== null
      ? data.applicationShell as AppShellConfig
      : defaults.applicationShell),
  }
}

export function DesignSystemEditor({ stage }: DesignSystemEditorProps) {
  const { setEditorDirty, setEditorData } = usePipelineStore()
  const [viewMode, setViewMode] = useState<DesignViewMode>('visual')
  const [designSystem, setDesignSystem] = useState<DesignSystem>(() =>
    parseDesignSystem(stage.data),
  )

  const hasContent = Boolean(stage.data && Object.keys(stage.data).length > 0)

  useEffect(() => {
    if (stage.data && Object.keys(stage.data).length > 0) {
      setDesignSystem(parseDesignSystem(stage.data))
    }
  }, [stage.data])

  const updateDesignSystem = useCallback(
    (updater: Partial<DesignSystem> | ((prev: DesignSystem) => DesignSystem)) => {
      setDesignSystem((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
        setEditorData(next as unknown as Record<string, unknown>)
        setEditorDirty(true)
        return next
      })
    },
    [setEditorData, setEditorDirty],
  )

  return (
    <div className="space-y-6">
      {hasContent && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">Design System</h3>
            <DesignViewToggle mode={viewMode} onToggle={setViewMode} />
          </div>

          {viewMode === 'visual' && (
            <div className="space-y-6">
              <ColorTokenEditor colors={designSystem.colors} onChange={(colors) => updateDesignSystem({ colors })} />
              <TypographyPreview typography={designSystem.typography} onChange={(typography) => updateDesignSystem({ typography })} />
              <SpacingScale spacing={designSystem.spacing} onChange={(spacing) => updateDesignSystem({ spacing })} />
              <RadiusShadowEditor
                radius={designSystem.borderRadius}
                shadows={designSystem.shadows}
                onRadiusChange={(borderRadius) => updateDesignSystem({ borderRadius })}
                onShadowChange={(shadows) => updateDesignSystem({ shadows })}
              />
              <AppShellConfigurator shell={designSystem.applicationShell} onChange={(applicationShell) => updateDesignSystem({ applicationShell })} />
              <ComponentPreview tokens={designSystem} />
            </div>
          )}

          {viewMode === 'json' && (
            <SchemaPreview
              schema={JSON.stringify(designSystem, null, 2)}
              language="json"
            />
          )}

          {viewMode === 'css' && (
            <SchemaPreview
              schema={generateCssVariables(designSystem)}
              language="css"
            />
          )}
        </>
      )}

      {!hasContent && stage.status === 'active' && (
        <div className="flex flex-col items-center justify-center gap-2 py-8">
          <p className="text-xs text-zinc-300">
            Click Generate to create a design system from your product definition.
          </p>
        </div>
      )}
    </div>
  )
}
