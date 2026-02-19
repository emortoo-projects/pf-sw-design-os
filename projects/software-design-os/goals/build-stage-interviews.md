---
title: Build Stage Interviews
status: complete
priority: high
created: 2026-02-18
source: sdp-import
skills:
- frontend-design
- react-state
- ai-integration
skill_paths: []
skills_assigned: '2026-02-18'
---

# Build Stage Interviews

A guided interview flow that walks users through structured questions before AI generation. Each pipeline stage has its own set of questions tailored to what that stage produces. The interview replaces the blank editor with an intelligent, step-by-step intake process that feeds into AI generation.

## Acceptance Criteria

- [ ] StageInterviewWrapper wraps every stage editor — if stage has no data, shows the interview; if stage has data, shows the structured editor with a "Re-interview" button
- [ ] InterviewModeSelector shows three cards: Guided (step-by-step wizard), Quick (all questions on one page), Conversational (chat with AI). Start with Guided mode only.
- [ ] GuidedWizard implements step-by-step interview with one question per screen, progress bar, Previous/Next buttons
- [ ] WizardProgressBar shows horizontal step indicator with current/completed/remaining state
- [ ] InterviewStep renders the appropriate input type per question: textarea, multi-input, checkbox, single-select, checkbox-and-textarea
- [ ] InterviewSummary shows all collected answers before generation with edit capability and "Generate" button
- [ ] Stage 1 (Product Definition) interview is fully functional with 7 questions from the SDP spec
- [ ] All 8 interview-able stages (1-8) have their question configs defined; Stage 9 has no interview
- [ ] Interview answers are serialized to pipeline store's `userInput` for generation

## Data Requirements

- Stage interviews config from `context/sdp-source/sections/stage-interviews.json`
- Product interview detail from `context/sdp-source/sections/product-interview.json`

## SDP Section Reference

Full specification available at: `context/sdp-source/sections/product-interview.json` and `context/sdp-source/sections/stage-interviews.json`
