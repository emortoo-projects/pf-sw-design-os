# Project Framework

A reusable, stack-agnostic framework for AI agents building production applications.

## What is this?

This framework gives AI agents a structured way to build software projects. It provides:

- **GOTCHA Methodology** — A workflow for Goals, Tools, Context, History, and Action
- **Pluggable Tech Stacks** — Define your stack once, reference it everywhere
- **Working Memory** — Python tools for persistent session logging and recall
- **Project Scaffolding** — One command to bootstrap a new project with all the right structure
- **Multi-Project Support** — Run multiple projects side by side, each with its own context

## Quick Start

### 1. Create a new project

```bash
python tools/init/init_project.py --name my-app --stack nextjs --description "My new project"
```

### 2. Point your AI agent at AGENT.md

The `AGENT.md` file is the single entry point. Any AI agent that reads it will understand how to navigate and use the framework.

### 3. Fill in project context

Edit the files in `projects/my-app/context/` with your company, product, and brand information.

### 4. Define goals

Create goal files in `projects/my-app/goals/` following the schema in `framework/goal-schema.md`.

### 5. Build

Let the agent work. It will follow the methodology, respect your context, and log its progress.

## Directory Structure

```
project-framework/
├── AGENT.md              # AI agent entry point
├── framework/            # GOTCHA methodology (read-only reference)
├── stacks/               # Tech stack definitions (orbit, nextjs, etc.)
├── templates/            # Scaffolding templates for new projects
├── tools/                # Python scripts (memory, init, validate)
├── projects/             # Active project instances
└── archive/              # Completed or paused projects
```

## Available Stacks

| Stack            | File                      | Description                          |
|------------------|---------------------------|--------------------------------------|
| Orbit            | `stacks/orbit.yaml`       | React + Vite + TS + Tailwind + GAS   |
| Next.js          | `stacks/nextjs.yaml`      | Next.js full-stack                   |
| Python + FastAPI | `stacks/python-fastapi.yaml` | Python backend + FastAPI          |
| Static           | `stacks/static.yaml`      | Simple HTML/CSS/JS                   |

## Tools

| Tool                        | Description                                   |
|-----------------------------|-----------------------------------------------|
| `tools/init/init_project.py`    | Scaffold a new project from template      |
| `tools/memory/memory_read.py`   | Read from project memory                  |
| `tools/memory/memory_write.py`  | Write session logs, decisions, patterns   |
| `tools/validate/validate_goal.py` | Validate goal files against schema      |

## License

Private — for internal use.
