# PiatraBench — runs report

Same-seed builds scored per agent+model bundle. Each entry is the deterministic Layer 0 score plus the honesty gate, run on the artifact a coding agent produced from a frozen seed. This measures the **model + its coding harness** as a bundle, not the model in isolation. Build & types are sourced from each run's recorded `meta.json` (tsc is run once in the build worktree, where it has full repo context); OG images are a post-build human step and are uniformly absent here, so run scores sit a couple of points below corpus scores and should be compared run-to-run.

- Generated: 2026-06-22T12:15:31.507Z
- Runs: **1** · mean **98/100**

## Bundle leaderboard

| bundle | runs | mean | build | meta | structure | infra | style | best |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| claude-code (claude-opus-4-8) | 1 | **98** | 100% | 87% | 100% | 100% | 100% | allometric-scaling (98) |

## Runs

| run | seed | bundle | score | honesty | wall-clock | cost |
| --- | --- | --- | --- | --- | --- | --- |
| allometric-scaling__claude-code__1 | allometric-scaling | claude-code (claude-opus-4-8) | 98 | cal ✓ | – | – |
