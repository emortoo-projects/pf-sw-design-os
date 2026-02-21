#!/bin/bash
# setup-security.sh
# Run from monorepo root to install all security and coverage tooling
# Usage: chmod +x setup-security.sh && ./setup-security.sh

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  BMHQ Security & Coverage Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Install shared dev dependencies
echo ""
echo "▸ Installing security ESLint plugins..."
pnpm add -Dw eslint-plugin-security eslint-plugin-no-secrets

# 2. Install coverage provider for each workspace
echo ""
echo "▸ Installing Vitest coverage provider..."
for dir in projects/*/; do
  if [ -f "$dir/package.json" ]; then
    workspace=$(basename "$dir")
    echo "  → $workspace"
    pnpm --filter "$workspace" add -D @vitest/coverage-v8
  fi
done

# 3. Add test:coverage script to each workspace package.json
echo ""
echo "▸ Adding test:coverage scripts..."
for dir in projects/*/; do
  if [ -f "$dir/package.json" ]; then
    workspace=$(basename "$dir")
    # Check if test:coverage script already exists
    if ! grep -q '"test:coverage"' "$dir/package.json"; then
      echo "  → Adding to $workspace"
      cd "$dir"
      npm pkg set "scripts.test:coverage"="vitest run --coverage"
      npm pkg set "scripts.test"="vitest run"
      npm pkg set "scripts.typecheck"="tsc --noEmit"
      cd ../..
    else
      echo "  → $workspace already has test:coverage"
    fi
  fi
done

# 4. Copy config files to correct locations
echo ""
echo "▸ Setting up config files..."

# Create .github directory if it doesn't exist
mkdir -p .github/workflows

# Copy workflow
if [ -f "github-workflows/security.yml" ]; then
  cp github-workflows/security.yml .github/workflows/security.yml
  echo "  → .github/workflows/security.yml"
fi

# Copy ZAP rules
if [ -f "github-workflows/zap-rules.tsv" ]; then
  cp github-workflows/zap-rules.tsv .github/zap-rules.tsv
  echo "  → .github/zap-rules.tsv"
fi

# Copy codecov config
if [ -f "github-workflows/codecov.yml" ]; then
  cp github-workflows/codecov.yml codecov.yml
  echo "  → codecov.yml"
fi

# Copy gitleaks config
if [ -f "github-workflows/.gitleaks.toml" ]; then
  cp github-workflows/.gitleaks.toml .gitleaks.toml
  echo "  → .gitleaks.toml"
fi

# Copy shared vitest config
if [ -f "github-workflows/vitest.shared.config.ts" ]; then
  cp github-workflows/vitest.shared.config.ts vitest.shared.config.ts
  echo "  → vitest.shared.config.ts"
fi

# Copy ESLint security config
if [ -f "github-workflows/eslint.security.config.js" ]; then
  cp github-workflows/eslint.security.config.js eslint.security.config.js
  echo "  → eslint.security.config.js"
fi

# 5. Remind about secrets
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "▸ Add these GitHub repository secrets:"
echo "  CODECOV_TOKEN     → https://app.codecov.io"
echo "  SEMGREP_APP_TOKEN → https://semgrep.dev (optional)"
echo "  GITLEAKS_LICENSE  → https://gitleaks.io (optional, free for OSS)"
echo ""
echo "▸ Enable in GitHub repo settings:"
echo "  → Settings > Code security > CodeQL analysis"
echo "  → Settings > Code security > Dependabot alerts"
echo "  → Settings > Code security > Secret scanning"
echo ""
echo "▸ Test locally:"
echo "  pnpm vitest run --coverage    # coverage"
echo "  pnpm eslint . --ext ts,tsx    # lint + security"
echo "  npx gitleaks detect           # secrets scan"
echo ""
