---
title: Build Pipeline View
status: complete
priority: medium
created: 2026-02-18
source: sdp-import
skills:
- frontend-design
- react-state
- api
- ai-integration
- monorepo
- ci-cd
skill_paths: []
skills_assigned: '2026-02-18'
---

# Build Pipeline View

Primary workspace for a single project. Displays the 9-stage pipeline progress bar at the top with the active stage editor loaded below. This is the main layout wrapper that manages stage navigation and loads the appropriate stage editor component.

## Acceptance Criteria

- [ ] PipelineProgressBar is implemented and functional — Horizontal 9-step stepper showing all stages as connected nodes. Completed stages have green check icons. Active stage is highlighted with primary color and pulse animation. Locked stages are grayed out with lock icon. Clicking a completed stage navigates to its review view. Shows stage names on hover/tooltip.
- [ ] StageEditorContainer is implemented and functional — Dynamic container that loads the appropriate stage editor component based on the current stage number. Wraps all editors with a consistent header (stage name, status badge, last generated time) and footer (action bar).
- [ ] StageHeader is implemented and functional — Shows stage name, stage number badge, status indicator (locked/active/generating/review/complete), last validated timestamp, and generation count.
- [ ] StageActionBar is implemented and functional — Bottom action bar with contextual buttons: Generate (triggers AI), Save (saves human edits), Validate & Complete (validates and advances), Revert (unlocks for re-editing). Buttons are enabled/disabled based on stage status. Shows loading spinner during generation.
- [ ] StageNavigationButtons is implemented and functional — Previous/Next stage buttons for linear navigation. Previous is always available for completed stages. Next is available only if current stage is complete.

## Data Requirements

Reference: `context/data-model.md`

- Project
- Stage (all 9)
- StageOutput (for active stage)

## Interactions & Behaviors

- **Click stage node in progress bar**: Navigate to that stage if completed or active
- **Click Generate**: POST /api/projects/:id/stages/:num/generate → show loading → display result
- **Click Save**: PUT /api/projects/:id/stages/:num with edited data
- **Click Complete**: POST /api/projects/:id/stages/:num/complete → validate → unlock next
- **Click Revert**: POST /api/projects/:id/stages/:num/revert → confirm dialog → lock subsequent stages
- **Click Previous/Next**: Navigate to adjacent stage

## SDP Section Reference

Full specification available at: `context/sdp-source/sections/`

```json
{
  "name": "Pipeline View",
  "route": "/projects/:id",
  "description": "Primary workspace for a single project. Displays the 9-stage pipeline progress bar at the top with the active stage editor loaded below. This is the main layout wrapper that manages stage navigation and loads the appropriate stage editor component.",
  "components": [
    {
      "name": "PipelineProgressBar",
      "description": "Horizontal 9-step stepper showing all stages as connected nodes. Completed stages have green check icons. Active stage is highlighted with primary color and pulse animation. Locked stages are grayed out with lock icon. Clicking a completed stage navigates to its review view. Shows stage names on hover/tooltip.",
      "props": [
        "stages: Stage[]",
        "currentStage: number",
        "onStageClick: (num) => void"
      ]
    },
    {
      "name": "StageEditorContainer",
      "description": "Dynamic container that loads the appropriate stage editor component based on the current stage number. Wraps all editors with a consistent header (stage name, status badge, last generated time) and footer (action bar).",
      "children": [
        "StageHeader",
        "StageEditor (dynamic)",
        "StageActionBar"
      ]
    },
    {
      "name": "StageHeader",
      "description": "Shows stage name, stage number badge, status indicator (locked/active/generating/review/complete), last validated timestamp, and generation count.",
      "props": [
        "stage: Stage"
      ]
    },
    {
      "name": "StageActionBar",
      "description": "Bottom action bar with contextual buttons: Generate (triggers AI), Save (saves human edits), Validate & Complete (validates and advances), Revert (unlocks for re-editing). Buttons are enabled/disabled based on stage status. Shows loading spinner during generation.",
      "props": [
        "stage: Stage",
        "onGenerate",
        "onSave",
        "onComplete",
        "onRevert"
      ]
    },
    {
      "name": "StageNavigationButtons",
      "description": "Previous/Next stage buttons for linear navigation. Previous is always available for completed stages. Next is available only if current stage is complete.",
      "props": [
        "currentStage: number",
        "stages: Stage[]"
      ]
    }
  ],
  "dataRequirements": [
    "Project",
    "Stage (all 9)",
    "StageOutput (for active stage)"
  ],
  "interactions": [
    {
      "trigger": "Click stage node in progress bar",
      "behavior": "Navigate to that stage if completed or active"
    },
    {
      "trigger": "Click Generate",
      "behavior": "POST /api/projects/:id/stages/:num/generate \u2192 show loading \u2192 display result"
    },
    {
      "trigger": "Click Save",
      "behavior": "PUT /api/projects/:id/stages/:num with edited data"
    },
    {
      "trigger": "Click Complete",
      "behavior": "POST /api/projects/:id/stages/:num/complete \u2192 validate \u2192 unlock next"
    },
    {
      "trigger": "Click Revert",
      "behavior": "POST /api/projects/:id/stages/:num/revert \u2192 confirm dialog \u2192 lock subsequent stages"
    },
    {
      "trigger": "Click Previous/Next",
      "behavior": "Navigate to adjacent stage"
    }
  ],
  "stateManagement": {
    "serverState": "useQuery for project + all stages. useMutation for generate/save/complete/revert.",
    "clientState": "activeStageNumber, editorDirtyState, confirmRevertDialog"
  }
}
```
