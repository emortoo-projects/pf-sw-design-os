---
title: Build API Designer
status: complete
priority: medium
created: 2026-02-18
source: sdp-import
skills:
- api
- frontend-design
- auth
- database
- ai-integration
- react-state
- design-tokens
- ci-cd
skill_paths: []
skills_assigned: '2026-02-18'
---

# Build API Designer

Stage 4 editor. AI generates API endpoints from entities and features. Configure auth strategy, pagination, error format, and external integrations.

## Acceptance Criteria

- [ ] EndpointList is implemented and functional — Grouped list of endpoints organized by resource (entity). Each row shows method badge (GET/POST/PUT/DELETE with color coding), path, description, and expand arrow for request/response schema.
- [ ] EndpointDetail is implemented and functional — Expanded view of a single endpoint showing request body schema, response schema, query parameters, path parameters, and example curl command.
- [ ] AuthConfigPanel is implemented and functional — Configuration panel for auth strategy: JWT (with token expiry config), API Key, OAuth, Session. Shows relevant fields based on selection.
- [ ] IntegrationsList is implemented and functional — List of external integrations with webhook definitions. Add integration with URL, events, and payload format.
- [ ] DualViewToggle is implemented and functional — Toggle between Structured List, OpenAPI YAML preview, and JSON.

## Data Requirements

Reference: `context/data-model.md`

- Stage (stageNumber=4)
- Stage 2 data (entities)
- Stage 1 data (features)

## Interactions & Behaviors

- **Generate**: AI creates CRUD endpoints for each entity + custom endpoints for features
- **Expand endpoint**: Show request/response schemas
- **Change auth strategy**: Update auth config, regenerate auth-related endpoints
- **Add integration**: Open integration form with URL, events, payload fields

## SDP Section Reference

Full specification available at: `context/sdp-source/sections/`

```json
{
  "name": "API Designer",
  "route": "/projects/:id/stage/4",
  "parentSection": "Pipeline View",
  "description": "Stage 4 editor. AI generates API endpoints from entities and features. Configure auth strategy, pagination, error format, and external integrations.",
  "components": [
    {
      "name": "EndpointList",
      "description": "Grouped list of endpoints organized by resource (entity). Each row shows method badge (GET/POST/PUT/DELETE with color coding), path, description, and expand arrow for request/response schema.",
      "props": [
        "endpoints: Endpoint[]",
        "onChange"
      ]
    },
    {
      "name": "EndpointDetail",
      "description": "Expanded view of a single endpoint showing request body schema, response schema, query parameters, path parameters, and example curl command.",
      "props": [
        "endpoint: Endpoint"
      ]
    },
    {
      "name": "AuthConfigPanel",
      "description": "Configuration panel for auth strategy: JWT (with token expiry config), API Key, OAuth, Session. Shows relevant fields based on selection.",
      "props": [
        "auth: AuthConfig",
        "onChange"
      ]
    },
    {
      "name": "IntegrationsList",
      "description": "List of external integrations with webhook definitions. Add integration with URL, events, and payload format.",
      "props": [
        "integrations: Integration[]",
        "onChange"
      ]
    },
    {
      "name": "DualViewToggle",
      "description": "Toggle between Structured List, OpenAPI YAML preview, and JSON.",
      "props": [
        "mode: structured|openapi|json"
      ]
    }
  ],
  "dataRequirements": [
    "Stage (stageNumber=4)",
    "Stage 2 data (entities)",
    "Stage 1 data (features)"
  ],
  "interactions": [
    {
      "trigger": "Generate",
      "behavior": "AI creates CRUD endpoints for each entity + custom endpoints for features"
    },
    {
      "trigger": "Expand endpoint",
      "behavior": "Show request/response schemas"
    },
    {
      "trigger": "Change auth strategy",
      "behavior": "Update auth config, regenerate auth-related endpoints"
    },
    {
      "trigger": "Add integration",
      "behavior": "Open integration form with URL, events, payload fields"
    }
  ]
}
```
