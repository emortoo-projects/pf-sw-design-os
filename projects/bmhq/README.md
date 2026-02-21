# BMHQ Security & Coverage CI

## What's Included

```
.github/
  workflows/
    security.yml          ← Main CI pipeline (9 jobs)
  zap-rules.tsv           ← OWASP ZAP false-positive suppressions
.gitleaks.toml            ← Secret detection config
codecov.yml               ← Per-workspace coverage thresholds
vitest.shared.config.ts   ← Shared test + coverage config
eslint.security.config.js ← Security-focused lint rules
setup-security.sh         ← One-command installer
```

## Pipeline Overview

```
Push/PR
  │
  ├─ test-coverage ──→ Vitest + v8 coverage per workspace ──→ Codecov
  ├─ codeql ─────────→ GitHub CodeQL SAST (JS/TS)
  ├─ semgrep ────────→ Semgrep SAST (XSS, SQLi, secrets, React, Node)
  ├─ secrets-scan ───→ Gitleaks (full git history)
  ├─ dependency-audit → pnpm audit (known CVEs)
  ├─ lint ───────────→ ESLint security plugins + TypeScript check
  │
  └─ Main branch only / Weekly:
      ├─ dast-zap ───→ OWASP ZAP full scan (BMHQ on :3000)
      └─ dast-nuclei ─→ Nuclei API scan (Agent OS API on :4000)
              │
              └─ security-summary → GitHub Step Summary table
```

## Setup

```bash
chmod +x setup-security.sh
./setup-security.sh
```

Then add GitHub secrets:
- `CODECOV_TOKEN` — from codecov.io
- `SEMGREP_APP_TOKEN` — from semgrep.dev (optional)
- `GITLEAKS_LICENSE` — from gitleaks.io (optional)

## Running Locally

```bash
# Coverage
pnpm --filter bmhq-platform run test:coverage

# Lint with security rules
pnpm eslint . --ext ts,tsx

# Secret scan
npx gitleaks detect --source .

# Dependency audit
pnpm audit --audit-level=high
```

## Coverage Thresholds

| Workspace | Lines | Functions | Branches |
|-----------|-------|-----------|----------|
| All       | 60%   | 55%       | 50%      |
| Patch     | 70%   | —         | —        |

## What Each Tool Catches

| Tool | Catches | Runs On |
|------|---------|---------|
| **CodeQL** | SQL injection, XSS, path traversal, code injection | Every push |
| **Semgrep** | XSS, SQLi, hardcoded secrets, insecure patterns, React anti-patterns | Every push |
| **Gitleaks** | API keys, tokens, passwords, connection strings in git history | Every push |
| **ESLint Security** | eval(), innerHTML, unsafe regex, timing attacks, hardcoded secrets | Every push |
| **pnpm audit** | Known CVEs in npm dependencies | Every push |
| **OWASP ZAP** | XSS, SQLi, CSRF, missing headers, cookie issues, info disclosure | Main + weekly |
| **Nuclei** | API misconfigurations, exposed endpoints, token issues | Main + weekly |

## Adding a New Module

1. Add workspace name to `test-coverage` matrix in `security.yml`
2. Add coverage flag in `codecov.yml`
3. Add `test:coverage` script to the module's `package.json`
4. Optionally add DAST target in `dast-zap` or `dast-nuclei` jobs
