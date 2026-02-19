---
title: Build Export Preview
status: complete
priority: medium
created: 2026-02-18
source: sdp-import
skills:
- export-packaging
- frontend-design
- api
- ai-integration
- database
- react-state
- mcp
- design-tokens
- ci-cd
skill_paths: []
skills_assigned: '2026-02-18'
---

# Build Export Preview

Stage 9 — final stage. Preview the assembled SDP package, run cross-reference validation, and download the export. Shows the complete file tree with sizes and validation status.

## Acceptance Criteria

- [ ] SDPTreeView is implemented and functional — File tree showing the complete SDP folder structure. Each file shows name, format badge (JSON/MD/SQL/YAML), estimated size, and validation status icon. Click a file to preview its contents.
- [ ] FilePreview is implemented and functional — Preview panel showing the selected file's contents with syntax highlighting. Supports JSON, Markdown rendered, SQL, and YAML.
- [ ] ValidationResults is implemented and functional — Validation panel showing cross-reference check results. Categories: entity references, API endpoint validity, design token consistency, section data requirements. Each result is pass/warning/error with description.
- [ ] ExportActions is implemented and functional — Export action bar with format selection (folder/zip), download button, and copy-to-clipboard for the sdp.json manifest. Shows estimated total package size.
- [ ] ReadmePreview is implemented and functional — Rendered preview of the generated README.md that will be included in the SDP. Shows product overview, section list, and quick-start guide for AI agents.

## Data Requirements

Reference: `context/data-model.md`

- All 8 previous stages (complete data)
- ExportPackage

## Interactions & Behaviors

- **Enter Stage 9**: Auto-run validation and assemble preview
- **Click file in tree**: Show file preview in right panel
- **Click Validate**: Re-run cross-reference validation
- **Click Export**: POST /api/projects/:id/export → generate package → download
- **Click Copy Manifest**: Copy sdp.json contents to clipboard

## SDP Section Reference

Full specification available at: `context/sdp-source/sections/`

```json
{
  "name": "Export Preview",
  "route": "/projects/:id/stage/9",
  "parentSection": "Pipeline View",
  "description": "Stage 9 \u2014 final stage. Preview the assembled SDP package, run cross-reference validation, and download the export. Shows the complete file tree with sizes and validation status.",
  "components": [
    {
      "name": "SDPTreeView",
      "description": "File tree showing the complete SDP folder structure. Each file shows name, format badge (JSON/MD/SQL/YAML), estimated size, and validation status icon. Click a file to preview its contents.",
      "props": [
        "files: SDPFile[]",
        "onSelect"
      ]
    },
    {
      "name": "FilePreview",
      "description": "Preview panel showing the selected file's contents with syntax highlighting. Supports JSON, Markdown rendered, SQL, and YAML.",
      "props": [
        "file: SDPFile"
      ]
    },
    {
      "name": "ValidationResults",
      "description": "Validation panel showing cross-reference check results. Categories: entity references, API endpoint validity, design token consistency, section data requirements. Each result is pass/warning/error with description.",
      "props": [
        "results: ValidationResult[]"
      ]
    },
    {
      "name": "ExportActions",
      "description": "Export action bar with format selection (folder/zip), download button, and copy-to-clipboard for the sdp.json manifest. Shows estimated total package size.",
      "props": [
        "projectId: string",
        "validationStatus: string"
      ]
    },
    {
      "name": "ReadmePreview",
      "description": "Rendered preview of the generated README.md that will be included in the SDP. Shows product overview, section list, and quick-start guide for AI agents.",
      "props": [
        "readme: string"
      ]
    }
  ],
  "dataRequirements": [
    "All 8 previous stages (complete data)",
    "ExportPackage"
  ],
  "interactions": [
    {
      "trigger": "Enter Stage 9",
      "behavior": "Auto-run validation and assemble preview"
    },
    {
      "trigger": "Click file in tree",
      "behavior": "Show file preview in right panel"
    },
    {
      "trigger": "Click Validate",
      "behavior": "Re-run cross-reference validation"
    },
    {
      "trigger": "Click Export",
      "behavior": "POST /api/projects/:id/export \u2192 generate package \u2192 download"
    },
    {
      "trigger": "Click Copy Manifest",
      "behavior": "Copy sdp.json contents to clipboard"
    }
  ]
}
```
