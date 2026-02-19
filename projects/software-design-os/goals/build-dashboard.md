---
title: Build Dashboard
status: complete
priority: medium
created: 2026-02-18
source: sdp-import
skills:
- frontend-design
- react-state
- api
- data-visualization
- ai-integration
- database
- ci-cd
skill_paths: []
skills_assigned: '2026-02-18'
---

# Build Dashboard

Landing page showing all projects with pipeline completion status. Grid of project cards with creation, status, and progress indicators. Entry point for the entire application.

## Acceptance Criteria

- [ ] ProjectGrid is implemented and functional — Responsive grid of ProjectCard components. Shows all active projects sorted by last updated. Empty state with illustration when no projects exist.
- [ ] ProjectCard is implemented and functional — Card showing project name, description snippet, creation date, 9-stage progress bar (mini), and overall completion percentage. Clicking navigates to PipelineView for that project.
- [ ] CreateProjectButton is implemented and functional — Prominent button that opens CreateProjectModal. Positioned at the top-right of the dashboard or as a special card in the grid.
- [ ] CreateProjectModal is implemented and functional — Modal dialog for creating a new project. Fields: name (required), description (optional), template selection (optional grid of template cards), AI provider override (optional dropdown). On submit, creates project with 9 stages and navigates to Stage 1.
- [ ] DashboardStats is implemented and functional — Summary bar above the project grid showing total projects, projects in progress, completed projects, and total AI spend this month.

## Data Requirements

Reference: `context/data-model.md`

- Project
- Stage
- Template
- AIGeneration (for cost stats)

## Interactions & Behaviors

- **Click project card**: Navigate to /projects/:id (PipelineView)
- **Click create button**: Open CreateProjectModal
- **Submit create form**: POST /api/projects → navigate to new project pipeline
- **Search/filter**: Filter project grid by name or status (client-side for now)

## SDP Section Reference

Full specification available at: `context/sdp-source/sections/`

```json
{
  "name": "Dashboard",
  "route": "/",
  "description": "Landing page showing all projects with pipeline completion status. Grid of project cards with creation, status, and progress indicators. Entry point for the entire application.",
  "components": [
    {
      "name": "ProjectGrid",
      "description": "Responsive grid of ProjectCard components. Shows all active projects sorted by last updated. Empty state with illustration when no projects exist.",
      "children": [
        "ProjectCard"
      ]
    },
    {
      "name": "ProjectCard",
      "description": "Card showing project name, description snippet, creation date, 9-stage progress bar (mini), and overall completion percentage. Clicking navigates to PipelineView for that project.",
      "props": [
        "project: Project",
        "stages: Stage[]"
      ]
    },
    {
      "name": "CreateProjectButton",
      "description": "Prominent button that opens CreateProjectModal. Positioned at the top-right of the dashboard or as a special card in the grid.",
      "children": [
        "CreateProjectModal"
      ]
    },
    {
      "name": "CreateProjectModal",
      "description": "Modal dialog for creating a new project. Fields: name (required), description (optional), template selection (optional grid of template cards), AI provider override (optional dropdown). On submit, creates project with 9 stages and navigates to Stage 1.",
      "fields": [
        "name: string",
        "description?: string",
        "templateId?: uuid",
        "aiProviderId?: uuid"
      ]
    },
    {
      "name": "DashboardStats",
      "description": "Summary bar above the project grid showing total projects, projects in progress, completed projects, and total AI spend this month.",
      "dataRequirements": [
        "Project count by status",
        "Aggregate AI generation costs"
      ]
    }
  ],
  "dataRequirements": [
    "Project",
    "Stage",
    "Template",
    "AIGeneration (for cost stats)"
  ],
  "interactions": [
    {
      "trigger": "Click project card",
      "behavior": "Navigate to /projects/:id (PipelineView)"
    },
    {
      "trigger": "Click create button",
      "behavior": "Open CreateProjectModal"
    },
    {
      "trigger": "Submit create form",
      "behavior": "POST /api/projects \u2192 navigate to new project pipeline"
    },
    {
      "trigger": "Search/filter",
      "behavior": "Filter project grid by name or status (client-side for now)"
    }
  ],
  "stateManagement": {
    "serverState": "useQuery to fetch projects list with stages",
    "clientState": "Modal open/close, search filter text"
  }
}
```
