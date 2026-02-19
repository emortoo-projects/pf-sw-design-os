---
title: Build Settings
status: not-started
priority: medium
created: 2026-02-18
source: sdp-import
skills:
- data-visualization
- frontend-design
- api
- ai-integration
- react-state
- mcp
- auth
- design-tokens
- ci-cd
- database
skill_paths: []
skills_assigned: '2026-02-18'
---

# Build Settings

User preferences, AI provider management, MCP token configuration, and aggregate usage statistics.

## Acceptance Criteria

- [ ] SettingsTabs is implemented and functional — Tab navigation for settings categories: Profile, AI Providers, MCP Access, Usage & Costs.
- [ ] ProfileSettings is implemented and functional — User profile form: name, email, avatar. Default project preferences: preferred DB engine, default stack, default AI provider.
- [ ] AIProviderManager is implemented and functional — List of configured AI providers with add/edit/delete/test buttons. Each provider card shows label, provider type, model, and connection status. Test button validates the API key. One provider is marked as default.
- [ ] MCPTokenManager is implemented and functional — List of MCP access tokens per project. Create new tokens (shows plaintext once), revoke existing tokens. Each token shows label, project scope, creation date, last used, and expiry.
- [ ] UsageStats is implemented and functional — Aggregate usage dashboard: total tokens used, total cost, breakdown by project (pie chart), breakdown by model (bar chart), trend over time (line chart). Period selector: 7d/30d/90d/all.
- [ ] CostAlertConfig is implemented and functional — Set monthly cost budget with warning thresholds. Email notification toggle.

## Data Requirements

Reference: `context/data-model.md`

- User
- AIProviderConfig
- MCPToken
- Project
- AIGeneration (aggregated)

## Interactions & Behaviors

- **Update profile**: PUT /api/users/me
- **Add AI provider**: Open form → POST /api/ai-providers → show in list
- **Test provider**: POST /api/ai-providers/:id/test → show success/failure
- **Create MCP token**: POST → show plaintext token once → add to list
- **Revoke MCP token**: Confirm → DELETE → remove from list
- **Change period**: Reload usage charts for selected period

## SDP Section Reference

Full specification available at: `context/sdp-source/sections/`

```json
{
  "name": "Settings",
  "route": "/settings",
  "description": "User preferences, AI provider management, MCP token configuration, and aggregate usage statistics.",
  "components": [
    {
      "name": "SettingsTabs",
      "description": "Tab navigation for settings categories: Profile, AI Providers, MCP Access, Usage & Costs.",
      "props": [
        "activeTab: string",
        "onSelect"
      ]
    },
    {
      "name": "ProfileSettings",
      "description": "User profile form: name, email, avatar. Default project preferences: preferred DB engine, default stack, default AI provider.",
      "props": [
        "user: User",
        "onChange"
      ]
    },
    {
      "name": "AIProviderManager",
      "description": "List of configured AI providers with add/edit/delete/test buttons. Each provider card shows label, provider type, model, and connection status. Test button validates the API key. One provider is marked as default.",
      "props": [
        "providers: AIProviderConfig[]",
        "onChange"
      ]
    },
    {
      "name": "MCPTokenManager",
      "description": "List of MCP access tokens per project. Create new tokens (shows plaintext once), revoke existing tokens. Each token shows label, project scope, creation date, last used, and expiry.",
      "props": [
        "tokens: MCPToken[]",
        "projects: Project[]",
        "onChange"
      ]
    },
    {
      "name": "UsageStats",
      "description": "Aggregate usage dashboard: total tokens used, total cost, breakdown by project (pie chart), breakdown by model (bar chart), trend over time (line chart). Period selector: 7d/30d/90d/all.",
      "props": [
        "usage: UsageData"
      ]
    },
    {
      "name": "CostAlertConfig",
      "description": "Set monthly cost budget with warning thresholds. Email notification toggle.",
      "props": [
        "alerts: AlertConfig",
        "onChange"
      ]
    }
  ],
  "dataRequirements": [
    "User",
    "AIProviderConfig",
    "MCPToken",
    "Project",
    "AIGeneration (aggregated)"
  ],
  "interactions": [
    {
      "trigger": "Update profile",
      "behavior": "PUT /api/users/me"
    },
    {
      "trigger": "Add AI provider",
      "behavior": "Open form \u2192 POST /api/ai-providers \u2192 show in list"
    },
    {
      "trigger": "Test provider",
      "behavior": "POST /api/ai-providers/:id/test \u2192 show success/failure"
    },
    {
      "trigger": "Create MCP token",
      "behavior": "POST \u2192 show plaintext token once \u2192 add to list"
    },
    {
      "trigger": "Revoke MCP token",
      "behavior": "Confirm \u2192 DELETE \u2192 remove from list"
    },
    {
      "trigger": "Change period",
      "behavior": "Reload usage charts for selected period"
    }
  ]
}
```
