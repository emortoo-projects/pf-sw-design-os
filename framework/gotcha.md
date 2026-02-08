# GOTCHA Methodology

**G**oals, **O**ps, **T**ools, **C**ontext, **H**istory, **A**ction

GOTCHA is a structured methodology for AI agents building production software. It ensures agents have the right information, follow consistent processes, and leave a trail of their work.

---

## The Five Pillars

### 1. Goals
Every task starts with a goal. Goals define **what** to build, **why** it matters, and **how** to verify completion.

- Goals live in `projects/<name>/goals/`
- Each goal follows the schema defined in `framework/goal-schema.md`
- The `manifest.md` file indexes all goals for a project
- Goals have statuses: `draft`, `active`, `blocked`, `done`

### 2. Tools
Agents have access to Python scripts that extend their capabilities.

| Tool | Purpose |
|------|---------|
| `tools/memory/memory_read.py` | Read from project memory |
| `tools/memory/memory_write.py` | Write session logs, decisions, patterns |
| `tools/init/init_project.py` | Scaffold a new project from template |
| `tools/validate/validate_goal.py` | Validate goal files against schema |

### 3. Context
Context is the knowledge base that informs the agent's work. Each project carries its own context.

| File | Contains |
|------|----------|
| `context/company.md` | Company mission, structure, audience |
| `context/product.md` | Product requirements (PRD) |
| `context/brand.md` | Visual identity, voice, UI guidelines |
| `context/assets/` | Logos, images, design files |
| `context/secrets/` | API keys, credentials (gitignored) |

### 4. History (Memory)
Agents log their work so future sessions can pick up where they left off.

- `memory/memory.md` — Persistent knowledge (preferences, patterns, decisions)
- `memory/logs/` — Timestamped session logs

### 5. Action
Action is the actual work: writing code, creating files, running builds. The methodology ensures action is always informed by the other four pillars.

---

## The Workflow

```
1. READ the goal
2. LOAD context (company, product, brand)
3. CHECK memory (what happened last session?)
4. DO the work (build, fix, test)
5. LOG the session (write to memory)
6. UPDATE the goal status
```

---

## Principles

- **Context before code.** Always read the project's context before writing anything.
- **One goal at a time.** Focus on a single goal per session.
- **Log everything meaningful.** Decisions, blockers, and patterns go into memory.
- **Respect the stack.** Each project declares its tech stack. Don't deviate without reason.
- **Never commit secrets.** Credentials and PII stay in `context/secrets/`.
