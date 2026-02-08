# Agent Entry Point

You are an AI agent working inside a **project framework** powered by the GOTCHA methodology.

This file is your starting point. Read it fully before doing anything.

---

## How This Framework Works

```
project-framework/
├── framework/          # HOW to work (methodology, schemas, conventions)
├── stacks/             # WHAT to build with (tech stack definitions)
├── templates/          # Scaffolding for new projects
├── tools/              # Python scripts you can run
├── projects/           # WHERE work happens (active project instances)
└── archive/            # Completed or paused projects
```

## Your Startup Sequence

1. **Read the framework** — Start with `framework/gotcha.md` to understand the methodology.
2. **Identify the project** — Check `projects/` for the active project you're working on.
3. **Load project context** — Read the project's `project.yaml`, then its `context/` files.
4. **Check memory** — Run `python tools/memory/memory_read.py --project <name>` for recent history.
5. **Check goals** — Read the project's `goals/manifest.md` to understand current objectives.
6. **Work** — Build, fix, or extend according to the goal.
7. **Log your work** — Run `python tools/memory/memory_write.py --project <name> --type session --content "..."`.

## Key Rules

- **Never commit secrets.** API keys, credentials, and PII go in `context/secrets/` (gitignored).
- **Follow the stack.** Each project declares its tech stack in `project.yaml`. Use it.
- **Log your work.** Write to memory after every meaningful session.
- **Respect the goal schema.** Goals follow a specific format defined in `framework/goal-schema.md`.
- **One project at a time.** Focus on the project specified by the user.

## Quick Reference

| Need to...                  | Do this                                                      |
|-----------------------------|--------------------------------------------------------------|
| Understand the methodology  | Read `framework/gotcha.md`                                   |
| See available tech stacks   | Read `stacks/README.md`                                      |
| Start a new project         | Run `python tools/init/init_project.py --name <n> --stack <s>` |
| Read project memory         | Run `python tools/memory/memory_read.py --project <name>`    |
| Write to memory             | Run `python tools/memory/memory_write.py --project <name> --type <type> --content "..."` |
| Validate a goal file        | Run `python tools/validate/validate_goal.py <path>`          |
| Check goal format           | Read `framework/goal-schema.md`                              |
| Check naming conventions    | Read `framework/conventions.md`                              |
