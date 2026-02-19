---
title: Build Data Model Editor
status: complete
priority: medium
created: 2026-02-18
source: sdp-import
skills:
- frontend-design
- database
- ai-integration
- api
- react-state
- ci-cd
skill_paths: []
skills_assigned: '2026-02-18'
---

# Build Data Model Editor

Stage 2 editor. AI analyzes the product definition and identifies entities with typed attributes and relationships. Visual entity cards with field management. Relationship lines between entities.

## Acceptance Criteria

- [ ] EntityCanvas is implemented and functional — Main canvas area showing entity cards arranged in a grid or free-form layout. Relationship lines drawn between connected entities. Zoom and pan controls.
- [ ] EntityCard is implemented and functional — Card representing a single entity. Shows entity name (editable), description, and field list. Each field row has name, type dropdown, required toggle, and description. Add/remove field buttons. Delete entity button.
- [ ] FieldEditor is implemented and functional — Inline editor for a single entity field. Type dropdown includes: string, text, integer, decimal, boolean, uuid, datetime, enum(), jsonb. Required toggle. Description input.
- [ ] RelationshipLine is implemented and functional — Visual line connecting two entities showing relationship type (1:1, 1:N, M:N) and foreign key name. Click to edit or delete.
- [ ] AddEntityButton is implemented and functional — Button to add a new blank entity card to the canvas.
- [ ] AddRelationshipButton is implemented and functional — Button that enters relationship-drawing mode. User clicks source entity then target entity to create a relationship.
- [ ] DualViewToggle is implemented and functional — Toggle between Visual Canvas and TypeScript Interfaces view.

## Data Requirements

Reference: `context/data-model.md`

- Stage (stageNumber=2)
- Stage 1 data (product definition for context)

## Interactions & Behaviors

- **Generate from product**: AI reads product definition → creates entity cards with fields and relationships
- **Edit entity name/description**: Inline edit on the card
- **Add/remove/edit field**: Modify field list within entity card
- **Draw relationship**: Enter drawing mode → click source → click target → select type
- **Switch to TypeScript view**: Show entities as TypeScript interfaces with types

## SDP Section Reference

Full specification available at: `context/sdp-source/sections/`

```json
{
  "name": "Data Model Editor",
  "route": "/projects/:id/stage/2",
  "parentSection": "Pipeline View",
  "description": "Stage 2 editor. AI analyzes the product definition and identifies entities with typed attributes and relationships. Visual entity cards with field management. Relationship lines between entities.",
  "components": [
    {
      "name": "EntityCanvas",
      "description": "Main canvas area showing entity cards arranged in a grid or free-form layout. Relationship lines drawn between connected entities. Zoom and pan controls.",
      "children": [
        "EntityCard",
        "RelationshipLine"
      ]
    },
    {
      "name": "EntityCard",
      "description": "Card representing a single entity. Shows entity name (editable), description, and field list. Each field row has name, type dropdown, required toggle, and description. Add/remove field buttons. Delete entity button.",
      "props": [
        "entity: Entity",
        "onChange",
        "onDelete"
      ]
    },
    {
      "name": "FieldEditor",
      "description": "Inline editor for a single entity field. Type dropdown includes: string, text, integer, decimal, boolean, uuid, datetime, enum(), jsonb. Required toggle. Description input.",
      "props": [
        "field: Field",
        "onChange"
      ]
    },
    {
      "name": "RelationshipLine",
      "description": "Visual line connecting two entities showing relationship type (1:1, 1:N, M:N) and foreign key name. Click to edit or delete.",
      "props": [
        "relationship: Relationship"
      ]
    },
    {
      "name": "AddEntityButton",
      "description": "Button to add a new blank entity card to the canvas.",
      "props": [
        "onAdd"
      ]
    },
    {
      "name": "AddRelationshipButton",
      "description": "Button that enters relationship-drawing mode. User clicks source entity then target entity to create a relationship.",
      "props": [
        "onStartDrawing"
      ]
    },
    {
      "name": "DualViewToggle",
      "description": "Toggle between Visual Canvas and TypeScript Interfaces view.",
      "props": [
        "mode: visual|typescript|json"
      ]
    }
  ],
  "dataRequirements": [
    "Stage (stageNumber=2)",
    "Stage 1 data (product definition for context)"
  ],
  "interactions": [
    {
      "trigger": "Generate from product",
      "behavior": "AI reads product definition \u2192 creates entity cards with fields and relationships"
    },
    {
      "trigger": "Edit entity name/description",
      "behavior": "Inline edit on the card"
    },
    {
      "trigger": "Add/remove/edit field",
      "behavior": "Modify field list within entity card"
    },
    {
      "trigger": "Draw relationship",
      "behavior": "Enter drawing mode \u2192 click source \u2192 click target \u2192 select type"
    },
    {
      "trigger": "Switch to TypeScript view",
      "behavior": "Show entities as TypeScript interfaces with types"
    }
  ]
}
```
