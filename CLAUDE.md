# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state

The repository contains no source code yet, and it isn't a git repository. It holds a single UI mockup, `UX/CompareRxMedicineRiskEvaluationUI.png`, a `README.md`, and planning docs in `docs/`. There are no build, lint, or test commands and no package manifest. When the stack is chosen, update this file with the real commands and architecture.

## Planning docs

- `docs/prd.md`: product requirements.
- `docs/roadmap.md`: PoC, Version 1, 2 and 3 increments with exit criteria.
- `docs/architecture.md`: PoC request flow and where each product promise is enforced.
- `docs/design-decisions.md`: decision log with reasons. Add a new entry to change a decision.
- `docs/poc-system-prompt.md`: the system prompt, output schema and verification checks for the LLM step.
- `docs/evals.md`: the evals to run for each roadmap increment.

## Design rules for the LLM step

Read `docs/design-decisions.md` before changing any of these.

- The model sees only passages our code retrieved, each with an ID. It must cite an ID and an exact quote for every claim.
- Code verifies every cited ID and quote before anything is shown. Unverified claims become "I am unable to find the answer". Never show unsourced model output.
- Titles and URLs shown to users come from our own source records, never from model output.
- The disclaimer is added by code. The model never says medicines are "safe" and never recommends starting, stopping or changing a dose.
- PoC model is `claude-opus-5-5` with `output_config.effort` set explicitly. Forced `tool_choice` and assistant prefill are rejected by this model. The API's built-in citations can't be combined with `output_config.format`, so we use our own source IDs.

## Product intent (from the mockup)

MedsCheck is a medicine interaction and risk checker. It is labelled "Prototype" in the header.

- **Frontend**: a single-page UI with nav (Home, About, How It Works, FAQ). The main card is a "Your medicine list" editor with these parts:
  - Each entry has a name and an optional strength, e.g. "Metformin 500 mg".
  - Entries can be removed, and an "Add another medicine" action adds more.
  - A "Before evaluating" notice says names alone may not be enough. Strength, formulation, age, and medical conditions can change the assessment.
  - An "Evaluate medicines" button submits the list to the backend.
- **Backend (planned)**: receives the medicine list, checks it against trusted drug information and interaction databases, and uses an LLM to produce the analysis.
- **Results**: potential risks, explanations, suggested next steps, and links to reliable sources.

## Constraints stated in the UI copy

These are product promises. Don't violate them in the implementation.

- **No data stored**: the medicine list is not saved on the servers. Don't add persistence or logging of user medicine lists. A later, opt-in "save medicines per user" phase is planned (`docs/design-decisions.md`, D11), but it is not scheduled. Don't build any storage until that decision is accepted.
- **Disclaimer**: the tool gives general information and is not a substitute for professional medical advice. Results must stay framed that way and must always direct users to a healthcare provider or pharmacist.
- **Sourcing**: results should cite and link reliable sources, not rely on LLM output alone.
- **Palette**: the visual style is a teal/green palette with dark-green primary buttons.
