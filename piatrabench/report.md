# PiatraBench — Layer 0 report

Deterministic conformance of all playgrounds to the current template (CLAUDE.md). No model judgement.

- Generated: 2026-06-22T13:00:08.394Z
- Playgrounds: **101**
- Mean score: **72.6/100**
- Build check: enabled (tsc --noEmit, attributed per-playground)
- Citation resolution: disabled (run with --links)

Scoring categories (weights): build & types 25, registration & metadata 15, structure 20, scientific infrastructure 25, style & house rules 15. Infra weight is deliberately high because it is the main thing that "needs updating" in older playgrounds; the era column shows that older work predates that part of the template.

## Spec drift by era

| era | playgrounds | mean score | mean infra (/4) |
| --- | --- | --- | --- |
| 2024 | 13 | 61.1 | 0.0 |
| 2025 | 39 | 64.3 | 0.1 |
| 2026 | 49 | 82.4 | 1.9 |

## Model leaderboard

Mean Layer 0 conformance per generating model (from each playground's versions.ts). Deterministic quality only; subjective judge and Elo scores are future layers. Models are self-declared and the corpus is currently almost entirely Claude, so this compares Claude versions more than vendors.

| model | playgrounds | mean score | build | meta | structure | infra | style | best |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Claude Opus 4.8 | 31 | **90.5** | 98.7% | 100% | 100% | 72% | 85.8% | kerr-causality (100) |
| _(unattributed)_ | 70 | – | | | | | | |

## Honesty

Honesty is a gate, not a deduction: a failed check caps the headline score so polish cannot buy back fabrication. Calibration is executed headlessly; **verified** means the displayed `predicted` values are genuinely computed by the engine, not hardcoded to match `expected`. Fit (predicted vs expected error) is reported but never gates, because an honest playground may deliberately show a poorly-fitting model (e.g. lexical-liar).

- calibration verified (reproduces): **5**
- not auto-verifiable (no calibration, or prediction computed in-component): 96
- failed (dead citation or hardcoded calibration): 0
- flagged for review: 0
- citations: not checked (run with --links)

Calibration fit, where `predicted` is verifiable (high error is not necessarily dishonest):

| playground | pairs | mean error | worst error |
| --- | --- | --- | --- |
| lexical-liar | 10 | 275.0% | 900.0% |
| arithmetic-dynamics | 6 | 5.6% | 26.9% |
| trisquare | 4 | 0.1% | 0.1% |
| ideological-bent | 5 | 0.0% | 0.0% |
| political-autoimmunity | 6 | 0.0% | 0.0% |

## Data integrity

- **Unregistered** (folder exists, not in data.ts): `artificial-death`, `byte-birth`

## Needs updating

Sorted by ascending conformance. "Top losses" are the highest-weight failing checks — the fastest points to recover.

- **artificial-death** — 46/100 · June 2024 · assumptions.ts; calibration.ts; research companion; in data.ts (not registered); lime palette; valid topics/operations (no registry entry) · 1 `rounded` className(s) — verify none are on main containers/buttons
- **byte-birth** — 46/100 · June 2024 · assumptions.ts; calibration.ts; research companion; in data.ts (not registered); lime palette; valid topics/operations (no registry entry) · 1 `rounded` className(s) — verify none are on main containers/buttons
- **fracqunx** — 57/100 · February 2025 · assumptions.ts; calibration.ts; research companion; no `any` (10 occurrence(s)); PlaygroundViewer; versions.ts · 2 `rounded` className(s) — verify none are on main containers/buttons
- **halley-window** — 57/100 · February 2025 · assumptions.ts; calibration.ts; research companion; lime palette; PlaygroundViewer; versions.ts · 2 `rounded` className(s) — verify none are on main containers/buttons
- **authoritarian-paternalism** — 57/100 · August 2025 · assumptions.ts; calibration.ts; research companion; no em-dashes (in components/Viewer/index.tsx); no `any` (7 occurrence(s)); versions.ts · 1 `rounded` className(s) — verify none are on main containers/buttons
- **truth-violence-dynamics** — 57/100 · August 2025 · assumptions.ts; calibration.ts; research companion; no em-dashes (in playground.tsx); no `any` (7 occurrence(s)); versions.ts · 1 `rounded` className(s) — verify none are on main containers/buttons
- **algorithmic-monodominance** — 57/100 · November 2025 · assumptions.ts; calibration.ts; research companion; no em-dashes (in playground.tsx); no `any` (1 occurrence(s)); PlaygroundViewer · 1 `rounded` className(s) — verify none are on main containers/buttons
- **estigrade** — 59/100 · September 2024 · assumptions.ts; calibration.ts; research companion; lime palette; Settings + Viewer split (no Settings, no Viewer); versions.ts
- **raupian-morphospace** — 59/100 · April 2025 · assumptions.ts; calibration.ts; research companion; lime palette; PlaygroundViewer; versions.ts
- **agency-erosion** — 60/100 · July 2025 · assumptions.ts; calibration.ts; research companion; no em-dashes (in components/Viewer/index.tsx); no `any` (3 occurrence(s)); versions.ts
- **meaning-autogenesis** — 60/100 · July 2025 · assumptions.ts; calibration.ts; research companion; no em-dashes (in components/Settings/index.tsx); no `any` (1 occurrence(s)); versions.ts
- **story-suffering-coherence** — 60/100 · July 2025 · assumptions.ts; calibration.ts; research companion; no em-dashes (in playground.tsx); lime palette; PlaygroundViewer
- **bifurcation-speciation** — 61/100 · May 2025 · assumptions.ts; calibration.ts; research companion; no `any` (2 occurrence(s)); lime palette; versions.ts
- **scarcity-over-technology** — 61/100 · September 2025 · assumptions.ts; calibration.ts; research companion; no em-dashes (in playground.tsx); no `any` (1 occurrence(s)); versions.ts
- **everything-relevant** — 62/100 · March 2024 · assumptions.ts; calibration.ts; research companion; no em-dashes (in playground.tsx); versions.ts; no font-serif/sans (font-serif/sans present) · 1 `rounded` className(s) — verify none are on main containers/buttons
- **lifesong** — 62/100 · March 2024 · assumptions.ts; calibration.ts; research companion; no em-dashes (in playground.tsx); versions.ts; no font-serif/sans (font-serif/sans present)
- **vote-no** — 62/100 · March 2024 · assumptions.ts; calibration.ts; research companion; no em-dashes (in playground.tsx); versions.ts; no font-serif/sans (font-serif/sans present) · 1 `rounded` className(s) — verify none are on main containers/buttons
- **geometry-becoming-topology** — 62/100 · July 2025 · assumptions.ts; calibration.ts; research companion; no em-dashes (in playground.tsx); versions.ts; no font-serif/sans (font-serif/sans present)
- **plr-harmony** — 62/100 · September 2025 · assumptions.ts; calibration.ts; research companion; no em-dashes (in playground.tsx); PlaygroundViewer; versions.ts
- **subconscious-state-space** — 62/100 · October 2025 · assumptions.ts; calibration.ts; research companion; no em-dashes (in components/Viewer/index.tsx, playground.tsx); PlaygroundViewer; versions.ts
- **closedness-adverse-selection** — 62/100 · November 2025 · assumptions.ts; calibration.ts; research companion; no em-dashes (in components/Viewer/index.tsx, playground.tsx); PlaygroundViewer; versions.ts
- **space-between-algorithms** — 62/100 · November 2025 · assumptions.ts; calibration.ts; research companion; no em-dashes (in components/Settings/index.tsx, components/Viewer/index.tsx, playground.tsx); PlaygroundViewer; versions.ts
- **logical-morphogenesis** — 62/100 · December 2025 · assumptions.ts; calibration.ts; research companion; no em-dashes (in playground.tsx); PlaygroundViewer; versions.ts
- **self-sorted-arrays** — 63/100 · February 2024 · assumptions.ts; calibration.ts; research companion; no `any` (5 occurrence(s)); lime palette; versions.ts
- **eyevolution** — 63/100 · March 2024 · assumptions.ts; calibration.ts; research companion; no `any` (2 occurrence(s)); versions.ts; no font-serif/sans (font-serif/sans present) · 6 `rounded` className(s) — verify none are on main containers/buttons
- **pacemaker-accumulator** — 63/100 · March 2024 · assumptions.ts; calibration.ts; research companion; no `any` (2 occurrence(s)); versions.ts; no font-serif/sans (font-serif/sans present) · 2 `rounded` className(s) — verify none are on main containers/buttons
- **lefebvrian-conscience** — 63/100 · May 2025 · assumptions.ts; calibration.ts; research companion; no `any` (2 occurrence(s)); versions.ts; no font-serif/sans (font-serif/sans present) · 17 `rounded` className(s) — verify none are on main containers/buttons
- **tuition-resentment** — 63/100 · August 2025 · assumptions.ts; calibration.ts; research companion; no `any` (2 occurrence(s)); versions.ts; no font-serif/sans (font-serif/sans present) · 6 `rounded` className(s) — verify none are on main containers/buttons
- **coasellular-morphogenesis** — 64/100 · November 2024 · assumptions.ts; calibration.ts; research companion; lime palette; versions.ts; no font-serif/sans (font-serif/sans present)
- **hsp90-canalization** — 64/100 · April 2025 · assumptions.ts; calibration.ts; research companion; PlaygroundViewer; versions.ts; no font-serif/sans (font-serif/sans present) · 1 `rounded` className(s) — verify none are on main containers/buttons
- **periodic-table-of-state-spaces** — 64/100 · March 2026 · assumptions.ts; calibration.ts; research companion; no em-dashes (in components/Viewer/index.tsx, logic/data.ts, playground.tsx); no `any` (1 occurrence(s)); versions.ts
- **debt-singularity** — 65/100 · June 2025 · assumptions.ts; calibration.ts; research companion; no em-dashes (in logic/index.ts); versions.ts; no font-serif/sans (font-serif/sans present)
- **resentment-against-desire** — 65/100 · June 2025 · assumptions.ts; calibration.ts; research companion; no em-dashes (in playground.tsx); versions.ts; no font-serif/sans (font-serif/sans present)
- **ownership-parity-rule** — 65/100 · October 2025 · assumptions.ts; calibration.ts; research companion; no em-dashes (in playground.tsx); PlaygroundViewer; versions.ts
- **chladni-generator** — 65/100 · December 2025 · assumptions.ts; calibration.ts; research companion; no em-dashes (in playground.tsx); PlaygroundViewer; versions.ts
- **cipolla-quadrant** — 65/100 · December 2025 · assumptions.ts; calibration.ts; research companion; no em-dashes (in logic/index.ts, playground.tsx); PlaygroundViewer; versions.ts
- **do-calculus** — 65/100 · December 2025 · assumptions.ts; calibration.ts; research companion; no em-dashes (in logic/index.ts, playground.tsx); PlaygroundViewer; versions.ts
- **descent-and-closure** — 65/100 · January 2026 · assumptions.ts; calibration.ts; research companion; no em-dashes (in components/Viewer/index.tsx); PlaygroundViewer; versions.ts
- **kernel-smoothing** — 65/100 · January 2026 · assumptions.ts; calibration.ts; research companion; no em-dashes (in logic/index.ts); PlaygroundViewer; versions.ts
- **bordism-to-action** — 65/100 · February 2026 · assumptions.ts; calibration.ts; research companion; no em-dashes (in components/Viewer/index.tsx); PlaygroundViewer; versions.ts
- **gait-gambit** — 65/100 · February 2026 · assumptions.ts; calibration.ts; research companion; no em-dashes (in components/Settings/index.tsx, components/Viewer/index.tsx); PlaygroundViewer; versions.ts · 3 `rounded` className(s) — verify none are on main containers/buttons
- **hydride-anomaly** — 65/100 · February 2026 · assumptions.ts; calibration.ts; research companion; no em-dashes (in logic/index.ts, playground.tsx); versions.ts; no font-serif/sans (font-serif/sans present)
- **polity-coalition-attractors** — 65/100 · February 2026 · assumptions.ts; calibration.ts; research companion; no em-dashes (in components/Viewer/index.tsx, playground.tsx); PlaygroundViewer; versions.ts
- **criticality** — 66/100 · July 2025 · assumptions.ts; calibration.ts; research companion; no `any` (1 occurrence(s)); versions.ts; no font-serif/sans (font-serif/sans present)
- **crystallographic-groups** — 66/100 · July 2025 · assumptions.ts; calibration.ts; research companion; PlaygroundViewer; versions.ts; logic/ module
- **expected-free-energy** — 66/100 · July 2025 · assumptions.ts; calibration.ts; research companion; no `any` (1 occurrence(s)); versions.ts; no font-serif/sans (font-serif/sans present)
- **ramsey-ports** — 66/100 · July 2025 · assumptions.ts; calibration.ts; research companion; no `any` (2 occurrence(s)); versions.ts; no font-serif/sans (font-serif/sans present)
- **berkshire-engine** — 66/100 · August 2025 · assumptions.ts; calibration.ts; research companion; no em-dashes (in playground.tsx); versions.ts; logic/ module · 6 `rounded` className(s) — verify none are on main containers/buttons
- **cpt-variance** — 68/100 · March 2024 · assumptions.ts; calibration.ts; research companion; versions.ts; no font-serif/sans (font-serif/sans present); logic/ module · 1 `rounded` className(s) — verify none are on main containers/buttons
- **metamaterials** — 68/100 · March 2024 · assumptions.ts; calibration.ts; research companion; versions.ts; no font-serif/sans (font-serif/sans present); logic/ module · 6 `rounded` className(s) — verify none are on main containers/buttons
- **refractive-computation** — 68/100 · March 2024 · assumptions.ts; calibration.ts; research companion; versions.ts; no font-serif/sans (font-serif/sans present); logic/ module
- **placebo-nocebo-dynamics** — 68/100 · October 2025 · assumptions.ts; calibration.ts; research companion; PlaygroundViewer; versions.ts; logic/ module
- **social-propagation** — 68/100 · October 2025 · assumptions.ts; calibration.ts; research companion; PlaygroundViewer; versions.ts; logic/ module
- **open-source-sustainability** — 69/100 · June 2025 · assumptions.ts; calibration.ts; research companion; no em-dashes (in playground.tsx); versions.ts · 2 `rounded` className(s) — verify none are on main containers/buttons
- **unknot-studio** — 69/100 · December 2025 · assumptions.ts; calibration.ts; research companion; no em-dashes (in components/Settings/index.tsx, logic/knot.ts); versions.ts
- **co2-metabolism-hypothesis** — 69/100 · March 2026 · assumptions.ts; calibration.ts; research companion; no em-dashes (in components/Viewer/index.tsx, playground.tsx); versions.ts
- **lithic-grammar** — 69/100 · March 2026 · assumptions.ts; calibration.ts; research companion; no em-dashes (in components/Viewer/index.tsx, logic/classify.ts, logic/data.ts); versions.ts
- **stochastic-justice** — 70/100 · June 2025 · assumptions.ts; calibration.ts; research companion; lime palette; versions.ts · 6 `rounded` className(s) — verify none are on main containers/buttons
- **trauma-eustress-dynamics** — 70/100 · June 2025 · assumptions.ts; calibration.ts; research companion; lime palette; versions.ts · 19 `rounded` className(s) — verify none are on main containers/buttons
- **neural-cellular-automaton** — 71/100 · August 2025 · assumptions.ts; calibration.ts; research companion; versions.ts; no font-serif/sans (font-serif/sans present)
- **activation-functions-lab** — 71/100 · January 2026 · assumptions.ts; calibration.ts; research companion; PlaygroundViewer; versions.ts
- **geometry-of-fragmentation** — 71/100 · January 2026 · assumptions.ts; calibration.ts; research companion; PlaygroundViewer; versions.ts
- **nested-observer-windows** — 71/100 · January 2026 · assumptions.ts; calibration.ts; research companion; PlaygroundViewer; versions.ts
- **order-theoretic-ontology** — 71/100 · February 2026 · assumptions.ts; calibration.ts; research companion; PlaygroundViewer; versions.ts
- **trust-transaction-spectrum** — 72/100 · February 2026 · assumptions.ts; calibration.ts; no em-dashes (in logic/index.ts, playground.tsx, research/content.md); PlaygroundViewer; versions.ts
- **author-function-atlas** — 75/100 · February 2026 · assumptions.ts; calibration.ts; research companion; versions.ts · 2 `rounded` className(s) — verify none are on main containers/buttons
- **cost-of-chaos** — 75/100 · March 2026 · assumptions.ts; calibration.ts; research companion; versions.ts
- **greimas-square-dynamics** — 75/100 · March 2026 · assumptions.ts; calibration.ts; research companion; versions.ts
- **modes-of-combination** — 75/100 · March 2026 · calibration.ts; research companion; no em-dashes (in assumptions.ts, logic/index.ts, page.tsx); no `any` (1 occurrence(s))
- **north-south-divergence** — 75/100 · March 2026 · assumptions.ts; calibration.ts; research companion; versions.ts
- **trainable-gene-circuits** — 75/100 · March 2026 · assumptions.ts; calibration.ts; research companion; versions.ts
- **counterfactual-growth-engine** — 80/100 · April 2026 · calibration.ts; research companion; no em-dashes (in assumptions.ts, components/Settings/index.tsx, components/Viewer/index.tsx)
- **morphologies-of-stability** — 80/100 · April 2026 · calibration.ts; research companion; no em-dashes (in assumptions.ts, components/Viewer/index.tsx, logic/index.ts)
- **ontogenic-engine** — 80/100 · April 2026 · calibration.ts; research companion; no em-dashes (in assumptions.ts, logic/index.ts, playground.tsx)
- **photosynthetic-state-space** — 80/100 · April 2026 · calibration.ts; research companion; no em-dashes (in assumptions.ts, logic/index.ts, playground.tsx)
- **societal-harm-topology** — 80/100 · April 2026 · calibration.ts; research companion; no em-dashes (in assumptions.ts, logic/index.ts, playground.tsx)
- **aura-space** — 80/100 · May 2026 · calibration.ts; research companion; no em-dashes (in assumptions.ts, components/Viewer/index.tsx, logic/index.ts)
- **coordination-under-complementarity** — 86/100 · April 2026 · calibration.ts; research companion
- **moral-phase-space** — 86/100 · April 2026 · calibration.ts; research companion
- **morphospace-engine** — 86/100 · April 2026 · calibration.ts; research companion
- **ontometrics** — 86/100 · April 2026 · calibration.ts; research companion
- **frontier-governance** — 87/100 · March 2026 · research companion; no em-dashes (in assumptions.ts)
- **rotary-fields** — 87/100 · June 2026 · research companion; no em-dashes (in components/AttentionHeatmap/index.tsx)
- **entropy-cafe** — 93/100 · July 2025 · calibration.ts
- **geometries-of-action** — 93/100 · March 2026 · research companion
- **fiscal-compass** — 93/100 · May 2026 · research companion
- **forbidden-edges** — 93/100 · May 2026 · research companion
- **knife-edge** — 93/100 · May 2026 · research companion
- **no-global-section** — 93/100 · May 2026 · research companion
- **uncare-engine** — 93/100 · May 2026 · research companion
- **pettini-tensor-networks** — 94/100 · March 2026 · no em-dashes (in assumptions.ts, calibration.ts, components/Viewer/index.tsx)
- **epistemic-lensing** — 94/100 · April 2026 · no em-dashes (in assumptions.ts, calibration.ts, logic/index.ts)
- **audience-attractor** — 95/100 · May 2026 · no `any` (1 occurrence(s))

## Full scorecard

| playground | score | honesty | build | meta | structure | infra | style | date |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| kerr-causality | 100 | – | 100% | 100% | 100% | 100% | 100% | May 2026 |
| salience-engine | 100 | – | 100% | 100% | 100% | 100% | 100% | May 2026 |
| arithmetic-dynamics | 100 | cal ✓ (fit 27%) | 100% | 100% | 100% | 100% | 100% | June 2026 |
| family-threshold | 100 | – | 100% | 100% | 100% | 100% | 100% | June 2026 |
| ideological-bent | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | June 2026 |
| lexical-liar | 100 | cal ✓ (fit 900%) | 100% | 100% | 100% | 100% | 100% | June 2026 |
| political-autoimmunity | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | June 2026 |
| trisquare | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | June 2026 |
| audience-attractor | 95 | – | 80% | 100% | 100% | 100% | 100% | May 2026 |
| pettini-tensor-networks | 94 | – | 100% | 100% | 100% | 100% | 60% | March 2026 |
| epistemic-lensing | 94 | – | 100% | 100% | 100% | 100% | 60% | April 2026 |
| entropy-cafe | 93 | – | 100% | 100% | 100% | 72% | 100% | July 2025 |
| geometries-of-action | 93 | – | 100% | 100% | 100% | 72% | 100% | March 2026 |
| fiscal-compass | 93 | – | 100% | 100% | 100% | 72% | 100% | May 2026 |
| forbidden-edges | 93 | – | 100% | 100% | 100% | 72% | 100% | May 2026 |
| knife-edge | 93 | – | 100% | 100% | 100% | 72% | 100% | May 2026 |
| no-global-section | 93 | – | 100% | 100% | 100% | 72% | 100% | May 2026 |
| uncare-engine | 93 | – | 100% | 100% | 100% | 72% | 100% | May 2026 |
| frontier-governance | 87 | – | 100% | 100% | 100% | 72% | 60% | March 2026 |
| rotary-fields | 87 | – | 100% | 100% | 100% | 72% | 60% | June 2026 |
| coordination-under-complementarity | 86 | – | 100% | 100% | 100% | 44% | 100% | April 2026 |
| moral-phase-space | 86 | – | 100% | 100% | 100% | 44% | 100% | April 2026 |
| morphospace-engine | 86 | – | 100% | 100% | 100% | 44% | 100% | April 2026 |
| ontometrics | 86 | – | 100% | 100% | 100% | 44% | 100% | April 2026 |
| counterfactual-growth-engine | 80 | – | 100% | 100% | 100% | 44% | 60% | April 2026 |
| morphologies-of-stability | 80 | – | 100% | 100% | 100% | 44% | 60% | April 2026 |
| ontogenic-engine | 80 | – | 100% | 100% | 100% | 44% | 60% | April 2026 |
| photosynthetic-state-space | 80 | – | 100% | 100% | 100% | 44% | 60% | April 2026 |
| societal-harm-topology | 80 | – | 100% | 100% | 100% | 44% | 60% | April 2026 |
| aura-space | 80 | – | 100% | 100% | 100% | 44% | 60% | May 2026 |
| author-function-atlas | 75 | – | 100% | 100% | 100% | 0% | 100% | February 2026 |
| cost-of-chaos | 75 | – | 100% | 100% | 100% | 0% | 100% | March 2026 |
| greimas-square-dynamics | 75 | – | 100% | 100% | 100% | 0% | 100% | March 2026 |
| modes-of-combination | 75 | – | 80% | 100% | 100% | 44% | 60% | March 2026 |
| north-south-divergence | 75 | – | 100% | 100% | 100% | 0% | 100% | March 2026 |
| trainable-gene-circuits | 75 | – | 100% | 100% | 100% | 0% | 100% | March 2026 |
| trust-transaction-spectrum | 72 | – | 100% | 100% | 80% | 28% | 60% | February 2026 |
| neural-cellular-automaton | 71 | – | 100% | 100% | 100% | 0% | 73% | August 2025 |
| activation-functions-lab | 71 | – | 100% | 100% | 80% | 0% | 100% | January 2026 |
| geometry-of-fragmentation | 71 | – | 100% | 100% | 80% | 0% | 100% | January 2026 |
| nested-observer-windows | 71 | – | 100% | 100% | 80% | 0% | 100% | January 2026 |
| order-theoretic-ontology | 71 | – | 100% | 100% | 80% | 0% | 100% | February 2026 |
| stochastic-justice | 70 | – | 100% | 100% | 100% | 0% | 67% | June 2025 |
| trauma-eustress-dynamics | 70 | – | 100% | 100% | 100% | 0% | 67% | June 2025 |
| open-source-sustainability | 69 | – | 100% | 100% | 100% | 0% | 60% | June 2025 |
| unknot-studio | 69 | – | 100% | 100% | 100% | 0% | 60% | December 2025 |
| co2-metabolism-hypothesis | 69 | – | 100% | 100% | 100% | 0% | 60% | March 2026 |
| lithic-grammar | 69 | – | 100% | 100% | 100% | 0% | 60% | March 2026 |
| cpt-variance | 68 | – | 100% | 100% | 85% | 0% | 73% | March 2024 |
| metamaterials | 68 | – | 100% | 100% | 85% | 0% | 73% | March 2024 |
| refractive-computation | 68 | – | 100% | 100% | 85% | 0% | 73% | March 2024 |
| placebo-nocebo-dynamics | 68 | – | 100% | 100% | 65% | 0% | 100% | October 2025 |
| social-propagation | 68 | – | 100% | 100% | 65% | 0% | 100% | October 2025 |
| criticality | 66 | – | 80% | 100% | 100% | 0% | 73% | July 2025 |
| crystallographic-groups | 66 | – | 100% | 100% | 55% | 0% | 100% | July 2025 |
| expected-free-energy | 66 | – | 80% | 100% | 100% | 0% | 73% | July 2025 |
| ramsey-ports | 66 | – | 80% | 100% | 100% | 0% | 73% | July 2025 |
| berkshire-engine | 66 | – | 100% | 100% | 85% | 0% | 60% | August 2025 |
| debt-singularity | 65 | – | 100% | 100% | 100% | 0% | 33% | June 2025 |
| resentment-against-desire | 65 | – | 100% | 100% | 100% | 0% | 33% | June 2025 |
| ownership-parity-rule | 65 | – | 100% | 100% | 80% | 0% | 60% | October 2025 |
| chladni-generator | 65 | – | 100% | 100% | 80% | 0% | 60% | December 2025 |
| cipolla-quadrant | 65 | – | 100% | 100% | 80% | 0% | 60% | December 2025 |
| do-calculus | 65 | – | 100% | 100% | 80% | 0% | 60% | December 2025 |
| descent-and-closure | 65 | – | 100% | 100% | 80% | 0% | 60% | January 2026 |
| kernel-smoothing | 65 | – | 100% | 100% | 80% | 0% | 60% | January 2026 |
| bordism-to-action | 65 | – | 100% | 100% | 80% | 0% | 60% | February 2026 |
| gait-gambit | 65 | – | 100% | 100% | 80% | 0% | 60% | February 2026 |
| hydride-anomaly | 65 | – | 100% | 100% | 100% | 0% | 33% | February 2026 |
| polity-coalition-attractors | 65 | – | 100% | 100% | 80% | 0% | 60% | February 2026 |
| coasellular-morphogenesis | 64 | – | 100% | 100% | 90% | 0% | 40% | November 2024 |
| hsp90-canalization | 64 | – | 100% | 100% | 65% | 0% | 73% | April 2025 |
| periodic-table-of-state-spaces | 64 | – | 80% | 100% | 100% | 0% | 60% | March 2026 |
| self-sorted-arrays | 63 | – | 80% | 100% | 90% | 0% | 67% | February 2024 |
| eyevolution | 63 | – | 80% | 100% | 85% | 0% | 73% | March 2024 |
| pacemaker-accumulator | 63 | – | 80% | 100% | 85% | 0% | 73% | March 2024 |
| lefebvrian-conscience | 63 | – | 80% | 100% | 85% | 0% | 73% | May 2025 |
| tuition-resentment | 63 | – | 80% | 100% | 85% | 0% | 73% | August 2025 |
| everything-relevant | 62 | – | 100% | 100% | 85% | 0% | 33% | March 2024 |
| lifesong | 62 | – | 100% | 100% | 85% | 0% | 33% | March 2024 |
| vote-no | 62 | – | 100% | 100% | 85% | 0% | 33% | March 2024 |
| geometry-becoming-topology | 62 | – | 100% | 100% | 85% | 0% | 33% | July 2025 |
| plr-harmony | 62 | – | 100% | 100% | 65% | 0% | 60% | September 2025 |
| subconscious-state-space | 62 | – | 100% | 100% | 65% | 0% | 60% | October 2025 |
| closedness-adverse-selection | 62 | – | 100% | 100% | 65% | 0% | 60% | November 2025 |
| space-between-algorithms | 62 | – | 100% | 100% | 65% | 0% | 60% | November 2025 |
| logical-morphogenesis | 62 | – | 100% | 100% | 65% | 0% | 60% | December 2025 |
| bifurcation-speciation | 61 | – | 80% | 100% | 100% | 0% | 40% | May 2025 |
| scarcity-over-technology | 61 | – | 80% | 100% | 85% | 0% | 60% | September 2025 |
| agency-erosion | 60 | – | 80% | 100% | 100% | 0% | 33% | July 2025 |
| meaning-autogenesis | 60 | – | 80% | 100% | 100% | 0% | 33% | July 2025 |
| story-suffering-coherence | 60 | – | 100% | 100% | 80% | 0% | 27% | July 2025 |
| estigrade | 59 | – | 100% | 100% | 65% | 0% | 40% | September 2024 |
| raupian-morphospace | 59 | – | 100% | 100% | 65% | 0% | 40% | April 2025 |
| fracqunx | 57 | – | 80% | 100% | 55% | 0% | 73% | February 2025 |
| halley-window | 57 | – | 100% | 100% | 55% | 0% | 40% | February 2025 |
| authoritarian-paternalism | 57 | – | 80% | 100% | 85% | 0% | 33% | August 2025 |
| truth-violence-dynamics | 57 | – | 80% | 100% | 85% | 0% | 33% | August 2025 |
| algorithmic-monodominance | 57 | – | 80% | 100% | 65% | 0% | 60% | November 2025 |
| artificial-death | 46 | – | 100% | 13% | 65% | 0% | 40% | June 2024 |
| byte-birth | 46 | – | 100% | 13% | 65% | 0% | 40% | June 2024 |
