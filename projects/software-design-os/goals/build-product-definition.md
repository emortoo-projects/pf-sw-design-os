---
title: Build Product Definition Editor
status: complete
priority: medium
created: 2026-02-18
source: sdp-import
skills:
- frontend-design
- ai-integration
- api
- react-state
- ci-cd
- database
skill_paths: []
skills_assigned: '2026-02-18'
---

# Build Product Definition Editor

Stage 1 editor. User enters a product idea in free text. AI expands it into structured product overview with name, description, problems/solutions, key features, and target personas. User can edit any field inline.

## Acceptance Criteria

- [ ] ProductIdeaInput is implemented and functional — Large textarea for initial product idea. Placeholder with example text. Submit button triggers AI generation. Min 1 sentence required.
- [ ] ProductOverviewCard is implemented and functional — Displays AI-generated product name and description with inline edit capability. Name is a large heading input, description is a rich textarea.
- [ ] ProblemSolutionEditor is implemented and functional — List of problem/solution pairs. Each pair is two connected inputs. Add/remove buttons. Drag to reorder. AI generates 3-6 pairs initially.
- [ ] FeatureList is implemented and functional — List of key features with name (bold) and description. Editable inline. Add/remove. AI generates 4-8 features.
- [ ] PersonaCards is implemented and functional — Grid of persona cards with name, description, and optional avatar/icon. Add/remove/edit. AI infers 2-3 personas.
- [ ] DualViewToggle is implemented and functional — Toggle between Structured View (form fields) and Raw View (JSON editor). Changes in either view sync to the other.

## Data Requirements

Reference: `context/data-model.md`

- Stage (stageNumber=1)
- StageOutput

## Interactions & Behaviors

- **Enter product idea + click Generate**: POST generate → AI expands into full definition → display in form
- **Edit any field**: Mark stage as dirty → enable Save button
- **Toggle Dual View**: Switch between form editor and JSON editor
- **Click Regenerate**: Re-run AI generation (keeps user input, regenerates output)

## SDP Section Reference

Full specification available at: `context/sdp-source/sections/`

```json
{
  "name": "Product Definition Editor",
  "route": "/projects/:id/stage/1",
  "parentSection": "Pipeline View",
  "description": "Stage 1 editor. User enters a product idea in free text. AI expands it into structured product overview with name, description, problems/solutions, key features, and target personas. User can edit any field inline.",
  "components": [
    {
      "name": "ProductIdeaInput",
      "description": "Large textarea for initial product idea. Placeholder with example text. Submit button triggers AI generation. Min 1 sentence required.",
      "props": [
        "value: string",
        "onChange",
        "onSubmit"
      ]
    },
    {
      "name": "ProductOverviewCard",
      "description": "Displays AI-generated product name and description with inline edit capability. Name is a large heading input, description is a rich textarea.",
      "props": [
        "definition: ProductDefinition"
      ]
    },
    {
      "name": "ProblemSolutionEditor",
      "description": "List of problem/solution pairs. Each pair is two connected inputs. Add/remove buttons. Drag to reorder. AI generates 3-6 pairs initially.",
      "props": [
        "problems: ProblemSolution[]",
        "onChange"
      ]
    },
    {
      "name": "FeatureList",
      "description": "List of key features with name (bold) and description. Editable inline. Add/remove. AI generates 4-8 features.",
      "props": [
        "features: Feature[]",
        "onChange"
      ]
    },
    {
      "name": "PersonaCards",
      "description": "Grid of persona cards with name, description, and optional avatar/icon. Add/remove/edit. AI infers 2-3 personas.",
      "props": [
        "personas: Persona[]",
        "onChange"
      ]
    },
    {
      "name": "DualViewToggle",
      "description": "Toggle between Structured View (form fields) and Raw View (JSON editor). Changes in either view sync to the other.",
      "props": [
        "mode: structured|raw",
        "onToggle"
      ]
    }
  ],
  "dataRequirements": [
    "Stage (stageNumber=1)",
    "StageOutput"
  ],
  "interactions": [
    {
      "trigger": "Enter product idea + click Generate",
      "behavior": "POST generate \u2192 AI expands into full definition \u2192 display in form"
    },
    {
      "trigger": "Edit any field",
      "behavior": "Mark stage as dirty \u2192 enable Save button"
    },
    {
      "trigger": "Toggle Dual View",
      "behavior": "Switch between form editor and JSON editor"
    },
    {
      "trigger": "Click Regenerate",
      "behavior": "Re-run AI generation (keeps user input, regenerates output)"
    }
  ]
}
```
