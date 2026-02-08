# Projects

This directory contains active project instances. Each project is self-contained with its own context, goals, memory, and source code.

## Active Projects

| Project | Stack | Status | Description |
|---------|-------|--------|-------------|
| [new-day-learning](new-day-learning/) | Orbit | Planning | Mobile-first ERP for DDD services |

## Creating a New Project

```bash
python tools/init/init_project.py --name my-project --stack nextjs --description "Short description"
```

This scaffolds a project directory with all the standard files from `templates/project/`.

## Project Structure

Every project follows this layout:

```
projects/<name>/
├── project.yaml       # Config (name, stack, status)
├── .gitignore         # Project-level ignores
├── context/           # Company, product, brand info
├── goals/             # Goal files and manifest
├── memory/            # Persistent memory and session logs
├── src/               # Source code
└── docs/              # Documentation
```

## Naming Convention

Use `kebab-case` for project names (e.g., `client-portal`, `marketing-dashboard`).
