# Project Memory

**Last Updated:** 2026-02-18

## User Preferences
<!-- Agent-learned preferences go here -->

## Domain Knowledge
<!-- Key domain concepts the agent has learned -->

## Learned Insights
<!-- Patterns, decisions, and lessons learned -->
* [Decision 2026-02-18] Imported SDP from Software Design OS. Product: Software Design OS — AI-native blueprint engine for building software. Stack: sdos (React 19 + Vite + Hono + PostgreSQL + Drizzle). 12 SDP sections mapped to 12 goals: build-dashboard, build-pipeline, build-product-definition, build-data-model-editor, build-database-designer, build-api-designer, build-stack-selector, build-design-system-editor, build-section-builder, build-infrastructure-config, build-export-preview, build-settings. Skills auto-assigned to all goals (87 total assignments across 12 goals). Skills registry created with 13 skills + 2 composites.
* [Session 2026-02-18] Completed build-pipeline goal. Built full monorepo scaffold (~70 files): pnpm workspace root, shared types/constants/schemas, Hono API stub with mock data, React 19 frontend with Vite + Tailwind 4 + shadcn-style components. Pipeline view with 9-stage progress bar, stage editor container, action bar, navigation, revert dialog, skeleton, and error states. All stages use stub editors initially.
* [Session 2026-02-18] Completed build-product-definition goal. Skills used: frontend-design, react-state, ai-integration. Built 9 new files at features/stages/product-definition/: ProductDefinitionEditor (orchestrator), ProductIdeaInput (textarea), ProductOverviewCard (name/tagline/description inline edit), ProblemSolutionEditor (pairs with reorder), FeatureList (add/remove/edit), PersonaCards (grid), DualViewToggle (structured/raw), RawJsonEditor (JSON textarea with validation). Extended pipeline store with editorData/userInput for data flow. Updated mock data with realistic product definition from SDP. Wired editor into stage-editor-map for stage 1.
* [Session 2026-02-18] Completed build-data-model-editor goal. Skills used: frontend-design, database, react-state. Built 10 new files at features/stages/data-model/: DataModelEditor (orchestrator with drawing mode state), EntityCanvas (responsive grid of cards), EntityCard (name/description/field list with add/remove), FieldEditor (inline type dropdown with string/text/integer/decimal/boolean/uuid/datetime/enum/jsonb, required toggle, description), RelationshipPanel (connection list with type badges and FK labels), AddRelationshipDialog (modal for connecting entities with type/FK selection), TypeScriptView (generates TS interfaces from entities), DataModelViewToggle (visual/typescript modes). Drawing mode: click source entity → click target → dialog opens. Relationships auto-cleaned when entities deleted. Mock data includes 4 entities (User, Project, Stage, StageOutput) with 3 relationships from SDP.
