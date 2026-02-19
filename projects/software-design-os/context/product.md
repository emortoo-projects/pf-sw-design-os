# Product Context

## Overview

**Product:** Software Design OS

Software Design OS is a hybrid human-AI tool that transforms software ideas into complete, machine-readable blueprints called Software Design Packages (SDPs). It provides a structured 9-stage pipeline that guides users from initial product vision through data modeling, API design, infrastructure planning, and UI specification, producing dual-format outputs (JSON for AI agents, Markdown for humans) at every stage.


## Problems & Solutions

**Problem:** Unstructured handoff between product thinking and AI code generation
**Solution:** A 9-stage guided pipeline that captures every critical design decision in a structured format before any code is written

**Problem:** No standard machine-readable format for describing a complete software product
**Solution:** The Software Design Package (SDP) format — a portable, queryable specification with JSON for machines and Markdown for humans

**Problem:** Design decisions live in the developer's head instead of a shared document
**Solution:** Each pipeline stage explicitly captures decisions about database, API, stack, design tokens, and component architecture

**Problem:** Repetitive specification work for every new project
**Solution:** Template system for common product types that pre-fills pipeline stages, plus reusable design patterns

**Problem:** Context scattered across Notion, Figma, dbdiagram, and Terraform
**Solution:** Single unified SDP that contains everything — product context, data models, API contracts, design tokens, component specs, and infrastructure config


## Key Features

- **9-Stage Pipeline**: Guided progression through Product Definition, Data Model, Database Design, API Design, Programming Stack, Design System, Sections, Infrastructure, and Export — each stage validates before unlocking the next
- **AI-Powered Generation**: Each pipeline stage uses AI to expand user input into structured specifications. Supports Claude, OpenAI, and any OpenAI-compatible provider
- **Dual-Format Output**: Every artifact exists as both structured JSON/YAML (for AI agents) and clean Markdown (for human review) simultaneously
- **Software Design Package Export**: Assembles all stage outputs into a portable SDP folder with manifest, cross-reference validation, and downloadable archive
- **MCP Server Interface**: Exposes SDP contents as queryable MCP tools so AI coding agents can pull exactly the context they need during development
- **Template System**: Reusable starting points for common product types (SaaS dashboard, API service, landing page) that pre-fill pipeline stages
- **Cross-Reference Validation**: Export validates that all entity references, API endpoints, design tokens, and section specs are internally consistent
- **Cost Tracking**: Every AI generation call is tracked with token counts, cost estimates, and model info — surfaced per-project and in aggregate

## Target Users

- **Solo AI Builder**: Technical entrepreneur using AI coding agents (Claude Code, Cursor) to build products. Has strong product intuition but needs a structured way to communicate vision to AI agents.
- **Technical Product Manager**: PM at a startup writing PRDs that engineering teams or AI agents interpret inconsistently. Wants a structured format bridging product thinking and implementation.
- **AI Agent Orchestrator**: Developer managing multiple AI agents across platforms. Needs a single source of truth (SDP) that any agent can consume regardless of the coding platform.


---
*Imported from SDP on 2026-02-18 18:56*
