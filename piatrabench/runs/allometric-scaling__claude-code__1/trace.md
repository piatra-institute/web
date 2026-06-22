# Implementation trace: allometric-scaling by claude-code (Opus 4.8)

This is the trajectory of the build, captured for the future
conformance-under-build axis. The deterministic score comes from the artifact in
`output/`; this trace records how it was produced.

## Inputs

- Kickoff: `piatrabench/runs/KICKOFF.md` (the identical prompt every agent gets).
- Spec: `CLAUDE.md` at the repo root.
- Seed: `piatrabench/seeds/allometric-scaling/info.md` (Kleiber's law concept).

## Steps taken

1. Read `CLAUDE.md` for the template and the named reference implementation
   (`pettini-tensor-networks`), then read the 100-scoring `arithmetic-dynamics`
   playground in full as a concrete structural reference: `page.tsx`,
   `playground.tsx`, `components/Settings`, `components/Viewer`, `calibration.ts`,
   `versions.ts`, `assumptions.ts`, `research/page.tsx`. No other playground
   concept was opened.
2. Designed a small but complete model in `logic/index.ts`: the power law
   B = B0 * M^a, a ten-animal mass/BMR dataset, pure-function metrics (log RMSE,
   MAPE, log R squared), an ordinary-least-squares best-fit exponent, an exponent
   sweep, four presets (Kleiber 3/4, surface 2/3, isometric, best fit), and a
   narrative generator. All derived values are pure functions of params, so the
   playground computes them with useMemo and stores no derived state.
3. Wrote the scientific infrastructure: `assumptions.ts` (six entries separating
   the robust steeper-than-2/3 pattern from the contested 3/4 mechanism, each
   with a confidence level and a falsifiability condition), `calibration.ts`
   (predicted BMR computed by `metabolicRate`, compared to measured values for
   mouse, human, cow, elephant), `versions.ts`, and a `research/` companion.
4. Wrote the UI: `page.tsx` (metadata, defaultOpenGraph, sourceContext),
   `playground.tsx` (PlaygroundLayout, intro/canvas/outro, Equation blocks,
   ModelChangelog, ResearchPromptButton), `components/Settings` (preset grid,
   exponent and coefficient sliders, snapshot + MetricDelta), and
   `components/Viewer` (a log-log ComposedChart of measured points plus the model
   line, an exponent-error sweep with 2/3, 3/4, and current reference lines,
   VersionSelector, CalibrationPanel, AssumptionPanel).
5. Registered the playground in `app/playgrounds/data.ts` with topics
   [biology, physics], operations [symmetry, tension], date "June 2026" matching
   the `(2026)/(06)` path.
6. Ran `./node_modules/.bin/tsc --noEmit -p tsconfig.json`: clean, no errors.
7. Grepped the new files for em-dashes: none.

## Self-checks against the done criteria

- tsc clean: yes.
- registered with valid topics/operations and a date matching the path: yes.
- house rules (no any, no em-dashes, lime palette, no rounded main containers):
  followed.
- calibration genuinely computes predicted (not hardcoded): predicted is
  `Number(metabolicRate(...).toFixed(2))`, computed from the model.

## Not done

- OG image not generated (`pnpm og`); that is a post-build human step. The runs
  scorer treats OG as uniformly absent, so the run sits about two points below a
  corpus score for this reason alone.
