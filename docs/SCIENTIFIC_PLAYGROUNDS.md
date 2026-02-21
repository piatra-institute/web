# Scientific Playgrounds

Ideas for increasing the scientific rigor of playground implementations.


## 1. Claude / ChatGPT Version Selector

A top-bar toggle that switches between implementations of the same playground produced by different LLMs (Claude, ChatGPT, Gemini).

Each playground would have parallel implementations — e.g. `components/Viewer.claude.tsx` and `components/Viewer.chatgpt.tsx` — and the selector swaps them at runtime. The value is not attribution but surfacing divergent modeling choices: different weight structures, interaction terms, posture thresholds. A diff panel could highlight where the models disagree on structure.

**Implementation:** shared `logic/` interface with multiple implementations behind it; a `VersionSelector` component in the playground layout; playground-level state controlling which implementation is active.


## 2. Research Pipeline (Successive LLM Calls)

A build-time pipeline where successive LLM calls (ChatGPT Pro, Gemini Pro, Claude) analyze the playground topic and produce a structured research artifact.

Pipeline stages: (a) one model proposes the theoretical framework, (b) another critiques it against literature, (c) a third synthesizes and writes up findings. Output lives in an `analysis/` folder alongside each playground. Human curation of the final artifact is required.

**Implementation:** a CLI script (`pnpm research <playground-name>`) that orchestrates API calls; output stored as versioned markdown; rendered in an expandable "Research" panel in the playground outro.


## 3. Explicit Assumption Registry

Each playground exports a structured `assumptions.ts` file listing every modeling assumption with:

- A citation (author, year, concept)
- A confidence level (established, contested, speculative)
- A falsifiability condition (what empirical observation would invalidate this assumption)

The Viewer renders these as an expandable "Assumptions" panel. This forces rigor at authoring time — no weight ships without documented justification.


## 4. Sensitivity Analysis Panel

A standard component that automatically sweeps each input variable +/-2 while holding others constant and shows how the output changes. Standard practice in computational social science.

Reveals which parameters the model is most sensitive to, and whether the sensitivity matches what the literature predicts. If the model is most sensitive to a parameter the literature considers secondary, that signals a calibration problem.

**Implementation:** a `SensitivityAnalysis` component that takes the model's compute function, current inputs, and parameter metadata; renders a tornado chart (horizontal bars showing output range per parameter).


## 5. Calibration Against Empirical Cases

For playgrounds with real-world referents, add a dataset of known cases with expert-consensus inputs and expected outputs. Show where the model places them vs. where experts would place them.

For example, the trust-transaction spectrum could include Estonia, Singapore, Qatar, Iceland with known geopolitical parameters. The gap between model prediction and expert consensus is the model's calibration error.

**Implementation:** a `calibration.ts` file per playground with case data; a "Calibration" panel in the Viewer showing predicted vs. expected with error magnitude.


## 6. Versioned Model Changelog

Each playground maintains a changelog tracking structural changes to the model (not code changes — model changes).

Example entries:
- v2: added interaction terms per Walt's balance-of-threat theory
- v2: corrected crisis regime to align with Thorhallsson (shelter weight increases during crisis)
- v2: elevated domestic cohesion weight 0.08 to 0.12 per Kuik's hedging framework

**Implementation:** a `CHANGELOG.md` per playground or a structured `versions.ts` with entries rendered in the playground outro.
