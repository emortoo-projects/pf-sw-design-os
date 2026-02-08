# Goal File Schema

Every goal file follows this structure. Use it when creating new goals in `projects/<name>/goals/`.

---

## Required Fields

```markdown
# Goal: <Title>

**Status:** draft | active | blocked | done
**Priority:** high | medium | low
**Created:** YYYY-MM-DD
**Updated:** YYYY-MM-DD

## Objective
What are we building or fixing? One clear sentence.

## Context
Why does this matter? What problem does it solve?

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

## Acceptance Criteria
How do we know this is done?
- [ ] Criterion 1
- [ ] Criterion 2

## Notes
Any additional context, links, or references.
```

---

## Field Definitions

| Field | Type | Description |
|-------|------|-------------|
| **Status** | enum | `draft` = not started, `active` = in progress, `blocked` = waiting on something, `done` = completed |
| **Priority** | enum | `high` = do first, `medium` = do soon, `low` = do when possible |
| **Created** | date | When the goal was created |
| **Updated** | date | Last modification date |
| **Objective** | text | Single-sentence summary of what this goal achieves |
| **Context** | text | Background and motivation |
| **Requirements** | checklist | Specific tasks that must be completed |
| **Acceptance Criteria** | checklist | How to verify the goal is truly done |
| **Notes** | text | Optional additional context |

---

## Example

```markdown
# Goal: Build Client Dashboard

**Status:** active
**Priority:** high
**Created:** 2025-01-15
**Updated:** 2025-01-20

## Objective
Build a responsive client management dashboard showing active clients and their budget status.

## Context
The admin currently tracks clients in a spreadsheet. A dashboard will reduce errors and save 2 hours/week.

## Requirements
- [ ] Client list with search and filter
- [ ] Budget status indicators (green/yellow/red)
- [ ] Click-through to client detail view
- [ ] Mobile-responsive layout

## Acceptance Criteria
- [ ] Dashboard loads in under 2 seconds
- [ ] All active clients visible with correct budget data
- [ ] Works on mobile (375px+) and desktop

## Notes
See `context/product.md` for full client data schema.
```

---

## Validation

Run `python tools/validate/validate_goal.py <path-to-goal.md>` to check a goal file against this schema.
