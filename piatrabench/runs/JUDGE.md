# PiatraBench arena: the pairwise judging prompt

This is the manual, no-API quality layer. Conformance (Layer 0) only gates
eligibility; this is what actually ranks models on intelligence, quality,
prompt-following, and creativity.

You compare two playgrounds built from the **same seed** by two different
agents, blind, and judge which is better on five axes. Repeat across pairs and
seeds; `piatrabench/arena.mjs` turns the recorded verdicts into a per-axis
rating per model.

## How to run one comparison (cheap, manual)

1. Pick a seed and two runs of it, e.g. `allometric-scaling__claude-code__1`
   (call it **A**) and `allometric-scaling__codex__1` (**B**). Keep track of
   which is A and which is B; the judge must not be told which model made which.
2. Open a fresh chat with any capable model (ideally **not** the same model
   family as either contestant, to avoid self-preference). Paste, in order:
   - this rubric (everything under "Judge instructions" below),
   - the seed: `piatrabench/seeds/<seed>/info.md`,
   - **A**: a screenshot of the rendered playground, plus the key source files
     (`playground.tsx`, `components/Viewer`, `logic`, and the science files
     `assumptions.ts` / `calibration.ts`),
   - **B**: the same for the other run.
   The screenshot matters for `design` and `creativity`; the code matters for
   `fidelity`, `depth`, and `instruction`. Text-only judging works but weakens
   the two visual axes, so include screenshots when you can.
3. Copy the JSON the judge returns, wrap it into one line in
   `piatrabench/runs/verdicts.jsonl` (format below), mapping A to `a` and B to `b`.
4. When you have some verdicts, run `node piatrabench/arena.mjs`.

## Judge instructions (paste from here down)

You are judging two interactive science "playgrounds", A and B, built from the
same one-paragraph idea seed. You do not know which model built which; do not
guess or factor it in. Judge only what is in front of you.

Compare A and B on each of these five axes independently. For each, answer
exactly `A`, `B`, or `tie`, and give a one-line reason:

- **fidelity** — did it build what the seed actually asked, completely and
  correctly? Missing the core idea, or getting the model wrong, loses here.
- **depth** — is the science substantive and non-trivial, and is it honest about
  its own assumptions and limits? Reward correct, well-chosen modelling; punish
  hand-waving and fake precision.
- **design** — is the visualization legible and are the controls meaningful?
  Judge the rendered result, not the code. Clarity beats decoration.
- **creativity** — did it find a non-obvious framing, a good visual metaphor, or
  a clever interaction the seed did not spell out?
- **instruction** — did it honor the spirit of the brief and the specifics of
  the seed (the right scope, the asked-for controls and comparisons)?

Rules:
- Judge substance, not length. A longer or more elaborate playground is not
  automatically better; resist verbosity and decoration bias.
- If the two are genuinely indistinguishable on an axis, answer `tie`. Do not
  force a winner.
- Position is random; do not favour A or B by order.

Return only this JSON, nothing else:

```json
{"fidelity":"A","depth":"A","design":"tie","creativity":"B","instruction":"A","notes":"one sentence on the decisive difference"}
```

## verdicts.jsonl format

One JSON object per line. `a` and `b` are the run folder names; the axis values
are `a` / `b` / `tie` (map the judge's A to `a`, B to `b`):

```json
{"seed":"allometric-scaling","a":"allometric-scaling__claude-code__1","b":"allometric-scaling__codex__1","judge":"gemini-3.1-pro","axes":{"fidelity":"a","depth":"a","design":"tie","creativity":"b","instruction":"a"},"notes":"..."}
```

Record both orderings or just one per pair; the aggregator treats each line as
one game per axis. More verdicts (more judges, more pairs, more seeds) means a
more stable rating, so add as many as is cheap.
