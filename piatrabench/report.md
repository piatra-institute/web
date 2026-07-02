# PiatraBench — Layer 0 report

Deterministic conformance of all playgrounds to the current template (CLAUDE.md). No model judgement.

- Generated: 2026-07-02T04:26:17.847Z
- Playgrounds: **101**
- Mean score: **98.6/100**
- Build check: enabled (tsc --noEmit, attributed per-playground)
- Citation resolution: disabled (run with --links)

Scoring categories (weights): build & types 25, registration & metadata 15, structure 20, scientific infrastructure 25, style & house rules 15. Infra weight is deliberately high because it is the main thing that "needs updating" in older playgrounds; the era column shows that older work predates that part of the template.

## Spec drift by era

| era | playgrounds | mean score | mean infra (/4) |
| --- | --- | --- | --- |
| 2024 | 13 | 91.7 | 3.4 |
| 2025 | 39 | 99.4 | 4.0 |
| 2026 | 49 | 99.8 | 4.0 |

## Model leaderboard

Mean Layer 0 conformance per generating model (from each playground's versions.ts). Deterministic quality only; subjective judge and Elo scores are future layers. Models are self-declared and the corpus is currently almost entirely Claude, so this compares Claude versions more than vendors.

| model | playgrounds | mean score | build | meta | structure | infra | style | best |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Claude Opus 4.8 | 99 | **99.7** | 100% | 100% | 98.4% | 100% | 100% | self-sorted-arrays (100) |
| _(unattributed)_ | 2 | – | | | | | | |

## Honesty

Honesty is a gate, not a deduction: a failed check caps the headline score so polish cannot buy back fabrication. Calibration is executed headlessly; **verified** means the displayed `predicted` values are genuinely computed by the engine, not hardcoded to match `expected`. Fit (predicted vs expected error) is reported but never gates, because an honest playground may deliberately show a poorly-fitting model (e.g. lexical-liar).

- calibration verified (reproduces): **85**
- not auto-verifiable (no calibration, or prediction computed in-component): 16
- failed (dead citation or hardcoded calibration): 0
- flagged for review: 0
- citations: not checked (run with --links)

Calibration fit, where `predicted` is verifiable (high error is not necessarily dishonest):

| playground | pairs | mean error | worst error |
| --- | --- | --- | --- |
| lexical-liar | 10 | 275.0% | 900.0% |
| arithmetic-dynamics | 6 | 5.6% | 26.9% |
| hsp90-canalization | 5 | 4.6% | 20.0% |
| fracqunx | 5 | 4.5% | 15.7% |
| morphologies-of-stability | 5 | 0.2% | 0.8% |
| coordination-under-complementarity | 5 | 0.1% | 0.4% |
| trisquare | 4 | 0.1% | 0.1% |
| entropy-cafe | 6 | 0.0% | 0.0% |
| everything-relevant | 4 | 0.0% | 0.0% |
| self-sorted-arrays | 5 | 0.0% | 0.0% |
| cpt-variance | 6 | 0.0% | 0.0% |
| eyevolution | 5 | 0.0% | 0.0% |
| lifesong | 5 | 0.0% | 0.0% |
| metamaterials | 6 | 0.0% | 0.0% |
| pacemaker-accumulator | 5 | 0.0% | 0.0% |
| refractive-computation | 6 | 0.0% | 0.0% |
| vote-no | 5 | 0.0% | 0.0% |
| estigrade | 4 | 0.0% | 0.0% |
| coasellular-morphogenesis | 5 | 0.0% | 0.0% |
| halley-window | 5 | 0.0% | 0.0% |
| raupian-morphospace | 4 | 0.0% | 0.0% |
| bifurcation-speciation | 4 | 0.0% | 0.0% |
| lefebvrian-conscience | 5 | 0.0% | 0.0% |
| debt-singularity | 5 | 0.0% | 0.0% |
| open-source-sustainability | 6 | 0.0% | 0.0% |
| resentment-against-desire | 6 | 0.0% | 0.0% |
| stochastic-justice | 6 | 0.0% | 0.0% |
| trauma-eustress-dynamics | 5 | 0.0% | 0.0% |
| agency-erosion | 4 | 0.0% | 0.0% |
| criticality | 5 | 0.0% | 0.0% |
| crystallographic-groups | 7 | 0.0% | 0.0% |
| expected-free-energy | 5 | 0.0% | 0.0% |
| geometry-becoming-topology | 5 | 0.0% | 0.0% |
| meaning-autogenesis | 5 | 0.0% | 0.0% |
| ramsey-ports | 5 | 0.0% | 0.0% |
| story-suffering-coherence | 4 | 0.0% | 0.0% |
| authoritarian-paternalism | 5 | 0.0% | 0.0% |
| berkshire-engine | 5 | 0.0% | 0.0% |
| neural-cellular-automaton | 5 | 0.0% | 0.0% |
| truth-violence-dynamics | 4 | 0.0% | 0.0% |
| tuition-resentment | 5 | 0.0% | 0.0% |
| plr-harmony | 5 | 0.0% | 0.0% |
| scarcity-over-technology | 4 | 0.0% | 0.0% |
| ownership-parity-rule | 5 | 0.0% | 0.0% |
| placebo-nocebo-dynamics | 5 | 0.0% | 0.0% |
| social-propagation | 7 | 0.0% | 0.0% |
| subconscious-state-space | 5 | 0.0% | 0.0% |
| algorithmic-monodominance | 4 | 0.0% | 0.0% |
| closedness-adverse-selection | 5 | 0.0% | 0.0% |
| space-between-algorithms | 4 | 0.0% | 0.0% |
| chladni-generator | 5 | 0.0% | 0.0% |
| cipolla-quadrant | 5 | 0.0% | 0.0% |
| do-calculus | 6 | 0.0% | 0.0% |
| logical-morphogenesis | 5 | 0.0% | 0.0% |
| unknot-studio | 6 | 0.0% | 0.0% |
| activation-functions-lab | 5 | 0.0% | 0.0% |
| descent-and-closure | 6 | 0.0% | 0.0% |
| geometry-of-fragmentation | 6 | 0.0% | 0.0% |
| kernel-smoothing | 5 | 0.0% | 0.0% |
| nested-observer-windows | 7 | 0.0% | 0.0% |
| author-function-atlas | 5 | 0.0% | 0.0% |
| bordism-to-action | 5 | 0.0% | 0.0% |
| gait-gambit | 5 | 0.0% | 0.0% |
| hydride-anomaly | 5 | 0.0% | 0.0% |
| order-theoretic-ontology | 6 | 0.0% | 0.0% |
| polity-coalition-attractors | 5 | 0.0% | 0.0% |
| trust-transaction-spectrum | 5 | 0.0% | 0.0% |
| co2-metabolism-hypothesis | 5 | 0.0% | 0.0% |
| cost-of-chaos | 6 | 0.0% | 0.0% |
| greimas-square-dynamics | 5 | 0.0% | 0.0% |
| lithic-grammar | 7 | 0.0% | 0.0% |
| modes-of-combination | 5 | 0.0% | 0.0% |
| north-south-divergence | 5 | 0.0% | 0.0% |
| periodic-table-of-state-spaces | 5 | 0.0% | 0.0% |
| trainable-gene-circuits | 6 | 0.0% | 0.0% |
| counterfactual-growth-engine | 5 | 0.0% | 0.0% |
| moral-phase-space | 5 | 0.0% | 0.0% |
| morphospace-engine | 5 | 0.0% | 0.0% |
| ontogenic-engine | 5 | 0.0% | 0.0% |
| ontometrics | 6 | 0.0% | 0.0% |
| photosynthetic-state-space | 6 | 0.0% | 0.0% |
| societal-harm-topology | 5 | 0.0% | 0.0% |
| aura-space | 5 | 0.0% | 0.0% |
| ideological-bent | 5 | 0.0% | 0.0% |
| political-autoimmunity | 6 | 0.0% | 0.0% |

## Data integrity

- **Unregistered** (folder exists, not in data.ts): `artificial-death`, `byte-birth`

## Needs updating

Sorted by ascending conformance. "Top losses" are the highest-weight failing checks — the fastest points to recover.

- **artificial-death** — 46/100 · June 2024 · assumptions.ts; calibration.ts; research companion; in data.ts (not registered); lime palette; valid topics/operations (no registry entry) · 1 `rounded` className(s) — verify none are on main containers/buttons
- **byte-birth** — 46/100 · June 2024 · assumptions.ts; calibration.ts; research companion; in data.ts (not registered); lime palette; valid topics/operations (no registry entry) · 1 `rounded` className(s) — verify none are on main containers/buttons
- **halley-window** — 94/100 · February 2025 · PlaygroundViewer; Settings + Viewer split (no Viewer) · 2 `rounded` className(s) — verify none are on main containers/buttons
- **crystallographic-groups** — 94/100 · July 2025 · PlaygroundViewer; Settings + Viewer split (no Viewer)
- **hsp90-canalization** — 96/100 · April 2025 · PlaygroundViewer · 1 `rounded` className(s) — verify none are on main containers/buttons
- **raupian-morphospace** — 96/100 · April 2025 · PlaygroundViewer
- **logical-morphogenesis** — 96/100 · December 2025 · PlaygroundViewer
- **descent-and-closure** — 96/100 · January 2026 · PlaygroundViewer
- **geometry-of-fragmentation** — 96/100 · January 2026 · PlaygroundViewer

## Full scorecard

| playground | score | honesty | build | meta | structure | infra | style | date |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| self-sorted-arrays | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | February 2024 |
| cpt-variance | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | March 2024 |
| everything-relevant | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | March 2024 |
| eyevolution | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | March 2024 |
| lifesong | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | March 2024 |
| metamaterials | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | March 2024 |
| pacemaker-accumulator | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | March 2024 |
| refractive-computation | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | March 2024 |
| vote-no | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | March 2024 |
| estigrade | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | September 2024 |
| coasellular-morphogenesis | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | November 2024 |
| fracqunx | 100 | cal ✓ (fit 16%) | 100% | 100% | 100% | 100% | 100% | February 2025 |
| bifurcation-speciation | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | May 2025 |
| lefebvrian-conscience | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | May 2025 |
| debt-singularity | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | June 2025 |
| open-source-sustainability | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | June 2025 |
| resentment-against-desire | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | June 2025 |
| stochastic-justice | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | June 2025 |
| trauma-eustress-dynamics | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | June 2025 |
| agency-erosion | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | July 2025 |
| criticality | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | July 2025 |
| entropy-cafe | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | July 2025 |
| expected-free-energy | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | July 2025 |
| geometry-becoming-topology | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | July 2025 |
| meaning-autogenesis | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | July 2025 |
| ramsey-ports | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | July 2025 |
| story-suffering-coherence | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | July 2025 |
| authoritarian-paternalism | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | August 2025 |
| berkshire-engine | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | August 2025 |
| neural-cellular-automaton | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | August 2025 |
| truth-violence-dynamics | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | August 2025 |
| tuition-resentment | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | August 2025 |
| plr-harmony | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | September 2025 |
| scarcity-over-technology | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | September 2025 |
| ownership-parity-rule | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | October 2025 |
| placebo-nocebo-dynamics | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | October 2025 |
| social-propagation | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | October 2025 |
| subconscious-state-space | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | October 2025 |
| algorithmic-monodominance | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | November 2025 |
| closedness-adverse-selection | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | November 2025 |
| space-between-algorithms | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | November 2025 |
| chladni-generator | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | December 2025 |
| cipolla-quadrant | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | December 2025 |
| do-calculus | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | December 2025 |
| unknot-studio | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | December 2025 |
| activation-functions-lab | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | January 2026 |
| kernel-smoothing | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | January 2026 |
| nested-observer-windows | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | January 2026 |
| author-function-atlas | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | February 2026 |
| bordism-to-action | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | February 2026 |
| gait-gambit | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | February 2026 |
| hydride-anomaly | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | February 2026 |
| order-theoretic-ontology | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | February 2026 |
| polity-coalition-attractors | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | February 2026 |
| trust-transaction-spectrum | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | February 2026 |
| co2-metabolism-hypothesis | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | March 2026 |
| cost-of-chaos | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | March 2026 |
| frontier-governance | 100 | – | 100% | 100% | 100% | 100% | 100% | March 2026 |
| geometries-of-action | 100 | – | 100% | 100% | 100% | 100% | 100% | March 2026 |
| greimas-square-dynamics | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | March 2026 |
| lithic-grammar | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | March 2026 |
| modes-of-combination | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | March 2026 |
| north-south-divergence | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | March 2026 |
| periodic-table-of-state-spaces | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | March 2026 |
| pettini-tensor-networks | 100 | – | 100% | 100% | 100% | 100% | 100% | March 2026 |
| trainable-gene-circuits | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | March 2026 |
| coordination-under-complementarity | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | April 2026 |
| counterfactual-growth-engine | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | April 2026 |
| epistemic-lensing | 100 | – | 100% | 100% | 100% | 100% | 100% | April 2026 |
| moral-phase-space | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | April 2026 |
| morphologies-of-stability | 100 | cal ✓ (fit 1%) | 100% | 100% | 100% | 100% | 100% | April 2026 |
| morphospace-engine | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | April 2026 |
| ontogenic-engine | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | April 2026 |
| ontometrics | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | April 2026 |
| photosynthetic-state-space | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | April 2026 |
| societal-harm-topology | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | April 2026 |
| audience-attractor | 100 | – | 100% | 100% | 100% | 100% | 100% | May 2026 |
| aura-space | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | May 2026 |
| fiscal-compass | 100 | – | 100% | 100% | 100% | 100% | 100% | May 2026 |
| forbidden-edges | 100 | – | 100% | 100% | 100% | 100% | 100% | May 2026 |
| kerr-causality | 100 | – | 100% | 100% | 100% | 100% | 100% | May 2026 |
| knife-edge | 100 | – | 100% | 100% | 100% | 100% | 100% | May 2026 |
| no-global-section | 100 | – | 100% | 100% | 100% | 100% | 100% | May 2026 |
| salience-engine | 100 | – | 100% | 100% | 100% | 100% | 100% | May 2026 |
| uncare-engine | 100 | – | 100% | 100% | 100% | 100% | 100% | May 2026 |
| arithmetic-dynamics | 100 | cal ✓ (fit 27%) | 100% | 100% | 100% | 100% | 100% | June 2026 |
| family-threshold | 100 | – | 100% | 100% | 100% | 100% | 100% | June 2026 |
| ideological-bent | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | June 2026 |
| lexical-liar | 100 | cal ✓ (fit 900%) | 100% | 100% | 100% | 100% | 100% | June 2026 |
| political-autoimmunity | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | June 2026 |
| rotary-fields | 100 | – | 100% | 100% | 100% | 100% | 100% | June 2026 |
| trisquare | 100 | cal ✓ (fit 0%) | 100% | 100% | 100% | 100% | 100% | June 2026 |
| hsp90-canalization | 96 | cal ✓ (fit 20%) | 100% | 100% | 80% | 100% | 100% | April 2025 |
| raupian-morphospace | 96 | cal ✓ (fit 0%) | 100% | 100% | 80% | 100% | 100% | April 2025 |
| logical-morphogenesis | 96 | cal ✓ (fit 0%) | 100% | 100% | 80% | 100% | 100% | December 2025 |
| descent-and-closure | 96 | cal ✓ (fit 0%) | 100% | 100% | 80% | 100% | 100% | January 2026 |
| geometry-of-fragmentation | 96 | cal ✓ (fit 0%) | 100% | 100% | 80% | 100% | 100% | January 2026 |
| halley-window | 94 | cal ✓ (fit 0%) | 100% | 100% | 70% | 100% | 100% | February 2025 |
| crystallographic-groups | 94 | cal ✓ (fit 0%) | 100% | 100% | 70% | 100% | 100% | July 2025 |
| artificial-death | 46 | – | 100% | 13% | 65% | 0% | 40% | June 2024 |
| byte-birth | 46 | – | 100% | 13% | 65% | 0% | 40% | June 2024 |
