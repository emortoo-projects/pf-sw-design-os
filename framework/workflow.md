# Agent Workflow

Step-by-step instructions for an AI agent working inside this framework.

---

## Session Start

### 1. Orient
```
Read AGENT.md → framework/gotcha.md → identify target project
```

### 2. Load Project Context
```
Read projects/<name>/project.yaml     # Stack, status, description
Read projects/<name>/context/company.md  # Who the company is
Read projects/<name>/context/product.md  # What we're building
Read projects/<name>/context/brand.md    # How it should look/sound
```

### 3. Check Memory
```bash
python tools/memory/memory_read.py --project <name>
python tools/memory/memory_read.py --project <name> --recent 3  # Last 3 sessions
```

### 4. Check Goals
```
Read projects/<name>/goals/manifest.md   # Index of all goals
Read projects/<name>/goals/<active>.md   # The current goal
```

---

## During Work

### Building
- Follow the tech stack declared in `project.yaml`
- Reference `stacks/<stack>.yaml` for tooling and conventions
- Write code in `projects/<name>/src/`
- Keep documentation in `projects/<name>/docs/`

### Making Decisions
When you encounter a choice point:
1. Check if context files provide guidance
2. Check if memory has a relevant precedent
3. If neither, make a reasonable choice and log it

### Hitting Blockers
1. Update the goal status to `blocked`
2. Log the blocker in memory
3. Note what's needed to unblock in the goal's Notes section

---

## Session End

### 1. Log the Session
```bash
python tools/memory/memory_write.py \
  --project <name> \
  --type session \
  --content "Built client list component with search. Used Shadcn DataTable. Next: add budget indicators."
```

### 2. Log Any Decisions
```bash
python tools/memory/memory_write.py \
  --project <name> \
  --type decision \
  --content "Chose DataTable over custom table — better sort/filter support out of the box."
```

### 3. Log Any Patterns
```bash
python tools/memory/memory_write.py \
  --project <name> \
  --type pattern \
  --content "API calls go through bridge.ts with typed request/response objects."
```

### 4. Update Goal Status
Update the goal file's `Status` and `Updated` fields. Check off completed requirements.

---

## Project Lifecycle

```
1. INIT     → python tools/init/init_project.py --name <n> --stack <s>
2. CONTEXT  → Fill in context/ files (company, product, brand)
3. PLAN     → Create goals in goals/
4. BUILD    → Work through goals one at a time
5. SHIP     → Mark project complete in project.yaml
6. ARCHIVE  → Move to archive/ when done
```
