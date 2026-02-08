# Conventions

Naming, structure, and commit conventions used across all projects.

---

## Naming

| Thing | Convention | Example |
|-------|-----------|---------|
| Project directories | kebab-case | `my-cool-app` |
| Goal files | snake_case with leading underscore for templates | `build_dashboard.md`, `_example.md` |
| Python tools | snake_case | `memory_read.py` |
| Stack files | kebab-case | `python-fastapi.yaml` |
| Context files | lowercase single word | `company.md`, `product.md`, `brand.md` |

## Directory Structure (Per Project)

Every project under `projects/` follows this layout:

```
projects/<name>/
├── project.yaml           # Project config (name, stack, status, description)
├── .gitignore             # Project-level ignores
├── context/
│   ├── company.md         # Company information
│   ├── product.md         # Product requirements
│   ├── brand.md           # Brand guidelines
│   ├── assets/            # Logos, images, design files
│   └── secrets/           # API keys, credentials (gitignored)
├── goals/
│   ├── manifest.md        # Index of all goals
│   └── <goal_name>.md     # Individual goal files
├── memory/
│   ├── memory.md          # Persistent knowledge
│   └── logs/              # Timestamped session logs
├── src/                   # Source code
└── docs/                  # Documentation
```

## Goal Statuses

| Status | Meaning |
|--------|---------|
| `draft` | Defined but not started |
| `active` | Currently being worked on |
| `blocked` | Waiting on external input or dependency |
| `done` | Completed and verified |

## Project Statuses

| Status | Meaning |
|--------|---------|
| `planning` | Context being gathered, goals being defined |
| `active` | Under active development |
| `paused` | Temporarily on hold |
| `complete` | Done, ready for archive |
| `archived` | Moved to `archive/` |

## Commit Messages

Use conventional commit format:

```
<type>(<scope>): <description>

Types: feat, fix, docs, refactor, test, chore
Scope: project name or framework area
```

Examples:
```
feat(new-day-learning): add client dashboard
fix(tools): handle missing memory file gracefully
docs(framework): update goal schema with priority field
chore(stacks): add python-fastapi stack definition
```

## File Sizes

- Goal files: Keep under 200 lines. If longer, split into sub-goals.
- Context files: No hard limit, but prefer concise over exhaustive.
- Memory entries: One entry per session/decision/pattern. Keep entries focused.
