---
title: Build Design System Editor
status: complete
priority: medium
created: 2026-02-18
source: sdp-import
skills:
- frontend-design
- design-tokens
- ai-integration
- ci-cd
- api
- react-state
skill_paths: []
skills_assigned: '2026-02-18'
---

# Build Design System Editor

Stage 6 editor. Define the visual foundation: color palettes, typography, spacing, border radius, shadows, and the application shell layout. Live preview updates as tokens change.

## Acceptance Criteria

- [ ] ColorTokenEditor is implemented and functional — Three-palette editor for Primary, Secondary, and Neutral colors. Each palette shows a row of swatches (50-950 shades). Click a swatch to open color picker. AI generates harmonious palettes from a single seed color or mood keyword.
- [ ] TypographyPreview is implemented and functional — Shows heading, body, and mono font selections with live type specimens. Dropdown to select from web-safe and Google Fonts. Size scale preview.
- [ ] SpacingScale is implemented and functional — Visual spacing scale showing base unit and multipliers as colored bars. Editable base value.
- [ ] RadiusShadowEditor is implemented and functional — Border radius and shadow token editors with live preview boxes showing each token applied.
- [ ] AppShellConfigurator is implemented and functional — Visual layout builder for the application shell. Choose between sidebar/topbar/hybrid navigation. Configure sidebar width, collapse behavior, background color. Preview the shell layout with placeholder content.
- [ ] ComponentPreview is implemented and functional — Live preview panel showing common UI components (button, input, card, table row, badge) styled with the current design tokens. Updates in real-time as tokens change.
- [ ] DualViewToggle is implemented and functional — Toggle between Visual Editor, tokens.json preview, and CSS variables output.

## Data Requirements

Reference: `context/data-model.md`

- Stage (stageNumber=6)
- Stage 1 data (product mood/type)

## Interactions & Behaviors

- **Generate**: AI creates full design system from mood keywords or product type
- **Change color swatch**: Open color picker → update palette → refresh all previews
- **Change font selection**: Load new font → update typography preview
- **Edit app shell**: Update shell layout → refresh shell preview
- **View component preview**: All previewed components update as tokens change

## SDP Section Reference

Full specification available at: `context/sdp-source/sections/`

```json
{
  "name": "Design System Editor",
  "route": "/projects/:id/stage/6",
  "parentSection": "Pipeline View",
  "description": "Stage 6 editor. Define the visual foundation: color palettes, typography, spacing, border radius, shadows, and the application shell layout. Live preview updates as tokens change.",
  "components": [
    {
      "name": "ColorTokenEditor",
      "description": "Three-palette editor for Primary, Secondary, and Neutral colors. Each palette shows a row of swatches (50-950 shades). Click a swatch to open color picker. AI generates harmonious palettes from a single seed color or mood keyword.",
      "props": [
        "colors: ColorPalettes",
        "onChange"
      ]
    },
    {
      "name": "TypographyPreview",
      "description": "Shows heading, body, and mono font selections with live type specimens. Dropdown to select from web-safe and Google Fonts. Size scale preview.",
      "props": [
        "typography: Typography",
        "onChange"
      ]
    },
    {
      "name": "SpacingScale",
      "description": "Visual spacing scale showing base unit and multipliers as colored bars. Editable base value.",
      "props": [
        "spacing: SpacingConfig",
        "onChange"
      ]
    },
    {
      "name": "RadiusShadowEditor",
      "description": "Border radius and shadow token editors with live preview boxes showing each token applied.",
      "props": [
        "radius: RadiusTokens",
        "shadows: ShadowTokens",
        "onChange"
      ]
    },
    {
      "name": "AppShellConfigurator",
      "description": "Visual layout builder for the application shell. Choose between sidebar/topbar/hybrid navigation. Configure sidebar width, collapse behavior, background color. Preview the shell layout with placeholder content.",
      "props": [
        "shell: AppShellConfig",
        "onChange"
      ]
    },
    {
      "name": "ComponentPreview",
      "description": "Live preview panel showing common UI components (button, input, card, table row, badge) styled with the current design tokens. Updates in real-time as tokens change.",
      "props": [
        "tokens: DesignTokens"
      ]
    },
    {
      "name": "DualViewToggle",
      "description": "Toggle between Visual Editor, tokens.json preview, and CSS variables output.",
      "props": [
        "mode: visual|json|css"
      ]
    }
  ],
  "dataRequirements": [
    "Stage (stageNumber=6)",
    "Stage 1 data (product mood/type)"
  ],
  "interactions": [
    {
      "trigger": "Generate",
      "behavior": "AI creates full design system from mood keywords or product type"
    },
    {
      "trigger": "Change color swatch",
      "behavior": "Open color picker \u2192 update palette \u2192 refresh all previews"
    },
    {
      "trigger": "Change font selection",
      "behavior": "Load new font \u2192 update typography preview"
    },
    {
      "trigger": "Edit app shell",
      "behavior": "Update shell layout \u2192 refresh shell preview"
    },
    {
      "trigger": "View component preview",
      "behavior": "All previewed components update as tokens change"
    }
  ]
}
```
