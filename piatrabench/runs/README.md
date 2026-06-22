# PiatraBench runs — manual build protocol

This is the cheap, manual half of PiatraBench. Instead of an API harness that
pays per token, you run the same frozen seed through each coding agent you have
(Claude Code, Codex, the GLM agent), each on its own plan, then score every
output on the exact same rubric with one command.

The scorer (`piatrabench/scorer.mjs`) already grades the live corpus. Running it
with `--runs` points it at the artifacts you collect here instead.

```
node piatrabench/scorer.mjs --runs        # score everything under runs/
node piatrabench/scorer.mjs --runs --links # also resolve external citations
```

Output: `piatrabench/runs-report.md` and `runs-report.json`, grouped by bundle.

## What this measures (read this first)

Running each model inside its own coding agent means you are comparing
**model + harness bundles**, not models in isolation. Claude Code, Codex, and
the GLM agent have different system prompts, tools, context management, and
self-verification habits. That is the exact confound the GLM-vs-Opus article had
(Opus in Claude Code, GLM in Pi/OpenRouter). It is a legitimate thing to measure
(it is what a user actually experiences), as long as the entries are labelled as
bundles, which they are: `claude-code (claude-opus-4-8)`, `codex (gpt-5.x)`,
`glm-agent (glm-5.2)`.

One move buys back a clean model comparison for free: if your GLM agent is
Claude Code pointed at z.ai's Anthropic-compatible endpoint
(`ANTHROPIC_BASE_URL`), then Claude-vs-GLM is same-harness / swap-model, and only
Codex is a separate bundle. Note that asymmetry in any writeup.

## Directory layout

```
piatrabench/runs/
├── README.md                       # this file
└── <seed>__<agent>__<run>/         # one folder per build, e.g. entropy-cafe__claude-code__1
    ├── output/<slug>/             # the produced playground folder, BY NAME (page.tsx, playground.tsx, ...)
    ├── data.ts                     # the worktree's app/playgrounds/data.ts (for the registration check)
    ├── transcript.jsonl            # the agent's session log (you own the trajectory now)
    └── meta.json                   # what you ran, plus the recorded build result
```

Seeds live in `piatrabench/seeds/<seed>/` (`info.md` plus optional `demo.xtsx`),
mirroring the `ideation/` convention.

## meta.json

```json
{
  "seed": "entropy-cafe",
  "agent": "claude-code",
  "model": "claude-opus-4-8",
  "run": 1,
  "slug": "entropy-cafe",
  "date": "June 2026",
  "wallClockMin": 34,
  "cost": null,
  "build": { "ran": true, "tscClean": true, "errors": 0 },
  "notes": ""
}
```

- `agent` + `model` form the bundle label on the leaderboard. They are
  authoritative for attribution (the scorer ignores the artifact's own
  `versions.ts` self-report in runs mode).
- `slug` is the playground folder name the agent created. It must match
  `output/<slug>/` and is what the registration and OG checks key on. If you
  dump the folder *contents* into `output/` instead of the folder itself, the
  slug resolves to `"output"` and registration silently fails.
- `date` is the intended `Month YYYY`; it must match the `date` the agent wrote
  into `data.ts` for the date-conformance check to pass.
- `build` is the recorded result of running the project typecheck once, in the
  build worktree (see step 4). tsc needs the full repo, which a copied `output/`
  folder lacks, so the scorer trusts this recorded value. **Omitting `build`
  drops the 25-point build category for that run and makes it non-comparable.**

## Per-run protocol

Same steps for every agent. Run by hand.

1. **Isolate.** From the repo root:
   `git worktree add ../pb-<seed>-<agent> -b pb/<seed>/<agent>`
   so each agent works on its own copy and never sees another's output.

2. **Prepare the worktree.** Drop the seed into a fresh
   `app/playgrounds/(YYYY)/(MM)/<slug>/ideation/`. If a playground for that seed
   already exists, **delete that folder** so the agent cannot copy the answer.
   Leave `CLAUDE.md` and `app/playgrounds/(2026)/(03)/pettini-tensor-networks/`
   in place — they are the spec, fair to every agent.

3. **Kick off.** Open the agent in that worktree and paste **one identical
   kickoff prompt** into each (write it once, reuse verbatim). For example:

   > Read CLAUDE.md. Build a playground from the seed in
   > `app/playgrounds/.../ideation/`, conforming to the template. Done when it
   > builds clean, is registered in data.ts, and passes the house rules.

   No hints and no follow-ups beyond what the agent asks in order to proceed.

4. **Let it finish, then typecheck once.** Do not rescue it. When it stops, run
   the project typecheck in the worktree
   (`./node_modules/.bin/tsc --noEmit -p tsconfig.json`) and note pass/fail and
   the error count for `meta.json`.

5. **Collect.** Into `piatrabench/runs/<seed>__<agent>__<run>/` (in the MAIN
   repo, not the worktree):
   - copy the produced playground folder **by name** into `output/`, so that
     `output/<slug>/page.tsx` exists (not the folder's contents directly), and
     set `slug` in `meta.json` to match,
   - copy the worktree's `app/playgrounds/data.ts` to `data.ts`,
   - copy the agent's session transcript to `transcript.jsonl`,
   - write `meta.json`.

6. **Tear down.** `git worktree remove ../pb-<seed>-<agent>` (and delete the
   branch if you want).

7. **Score.** `node piatrabench/scorer.mjs --runs`.

## Where each agent's transcript lives

You own the trajectory going forward, so the "conformance-under-build" signals
(turns-to-conformance, guardrail violations introduced then fixed, whether it
screenshotted and acted, drift) are recoverable from these.

- **Claude Code:** `~/.claude/projects/<project-hash>/<session>.jsonl`.
- **Codex / GLM agent:** check each one's session-log location the first time
  you run it (`--help` or its config dir) and standardize copying it in.

Transcript formats differ per agent, so treat the **artifact** score (Layer 0 +
honesty gate) as the comparable core, and trajectory metrics as best-effort
per agent.

## What runs mode scores vs the live corpus

Identical rubric and honesty gate, with three deliberate differences:

- **Build & types** comes from `meta.json.build` (recorded in the worktree),
  not a re-run of tsc.
- **OG image** is a post-build human step (`pnpm og`) that agents do not do, so
  it is uniformly absent. Run scores therefore sit ~2 points below corpus
  scores; compare runs to each other, not to the corpus.
- **Model attribution** is the bundle you ran (`agent` + `model` from
  `meta.json`), not the artifact's `versions.ts`.

## Minimal first run

One seed with a solid `info.md`, three agents (Claude Code, Codex, GLM), one run
each. Three builds, an afternoon, near-zero marginal cost. Score them, read the
three transcripts side by side, and you will see whether the bundle differences
(verification habits, spec adherence) dominate the model differences — which
tells you whether the z.ai-through-Claude-Code clean comparison is worth setting
up next.
