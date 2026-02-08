# Tech Stacks

Stack definitions tell agents what technologies to use when building a project.

Each project declares its stack in `project.yaml`. The agent then reads the corresponding stack file for tooling details, conventions, and project structure.

## Available Stacks

| Stack | File | Best For |
|-------|------|----------|
| **Orbit** | `orbit.yaml` | Google Workspace apps with React UI |
| **Next.js** | `nextjs.yaml` | Full-stack web applications |
| **Python + FastAPI** | `python-fastapi.yaml` | API backends and data services |
| **Static** | `static.yaml` | Simple sites, landing pages, prototypes |

## Stack File Format

Each YAML file defines:

- **name** — Human-readable stack name
- **description** — When to use this stack
- **languages** — Programming languages used
- **frontend** — Framework, bundler, styling, component library
- **backend** — Runtime, framework, database
- **tooling** — Package manager, linter, formatter, test runner
- **structure** — Expected directory layout within `src/`
- **conventions** — Stack-specific coding conventions

## Adding a New Stack

1. Create a new YAML file in `stacks/` (e.g., `django.yaml`)
2. Follow the format of existing stack files
3. Reference it in new projects via `project.yaml`
