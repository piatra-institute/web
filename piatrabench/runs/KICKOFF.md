# PiatraBench kickoff — the prompt every agent receives

Paste this verbatim into each coding agent (Claude Code, Codex, the GLM agent),
running in the prepared worktree. Do not add hints or follow-ups beyond what the
agent asks in order to proceed. The detailed specification is `CLAUDE.md`; this
is just the task.

---

Read `CLAUDE.md` at the repo root. It is the full specification for a playground.

Build a new playground from the concept seed in
`app/playgrounds/<year>/<month>/<slug>/ideation/` (an `info.md`, plus a
`demo.xtsx` if one is present). Implement it to conform to the template described
in `CLAUDE.md`: the playground layout and shared components, the black-and-lime
palette, the scientific infrastructure (`assumptions.ts`, `calibration.ts`,
`versions.ts`, and a research companion), and the house rules. Register it in
`app/playgrounds/data.ts`.

You are done when:

- `./node_modules/.bin/tsc --noEmit` is clean,
- the playground is registered in `data.ts` with valid topics and operations and
  a date matching its path,
- it follows the house rules: no `any`, no em-dashes in rendered content, the
  lime palette, no rounded corners on main containers or buttons,
- `calibration.ts` genuinely computes its predicted values. The honesty gate
  executes it headlessly and checks the predicted numbers are not hardcoded to
  match the expected ones.

Consult the reference implementation named in `CLAUDE.md` for structural
patterns. Do not open or copy any other existing playground's concept.

---
