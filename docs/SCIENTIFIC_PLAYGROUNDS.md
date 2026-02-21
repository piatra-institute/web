# Scientific Playgrounds

The goal: every playground should be interesting, historically and scientifically accurate, playful, useful for learning, and useful for exploring new concepts. A playground is not a paper and not a textbook — it's an interactive environment where you can build intuition about a real idea by manipulating it. But the idea has to be *right*, or at least honestly positioned relative to what's known.

The central mechanism for achieving this is the **playground researcher** — a tool that uses deep research APIs to investigate the science behind a playground, produces a companion research document, and suggests improvements to the playground itself.


## Playground Researcher

A Python script (run with `uv`) that takes a playground name, researches the topic using deep research APIs (Gemini Deep Research, ChatGPT Deep Research), and produces two outputs: a companion research document and a list of improvement suggestions.

### What it does

1. **Reads the playground** — parses the ideation folder (`info.md`, `demo.xtsx`), the logic files, the outro content, and the assumptions to understand what the playground models and how.
2. **Researches the topic** — sends structured queries to deep research APIs that do extended web browsing and literature review. The queries are constructed from the playground's content, not generic.
3. **Produces a research document** — a 5-10 page HTML document covering historical context, the science, key figures, what the playground simplifies, and what you can learn from it. Served as a Next.js page at `/playgrounds/[name]/research` with optional PDF export.
4. **Produces improvement suggestions** — a structured file listing specific, actionable changes to make the playground more accurate or interesting. Never auto-applied.

### Script interface

```
uv run scripts/researcher.py <playground-name> [options]

Options:
  --providers gemini,chatgpt    Which deep research APIs to use (default: both)
  --focus "historical context"  Steer the research toward specific aspects
  --skip-document               Only produce suggestions, skip the research document
  --skip-suggestions            Only produce the document, skip suggestions
  --output-dir                  Override default output location
```

The script is interactive where it matters — after reading the playground, it shows what it plans to research and lets you adjust the queries before sending them to the APIs. Deep research calls are expensive and slow (minutes, not seconds), so you should see what you're asking for.

### Deep research queries

The script constructs queries from the playground content. For a playground like "Hsp90 canalization," the queries might be:

- **Historical context**: "The history of genetic canalization from Waddington's 1942 paper through Rutherford and Lindquist's 1998 Hsp90 experiments to current understanding. Key figures, debates, turning points."
- **Scientific accuracy**: "Current consensus on Hsp90's role in buffering genetic variation. What do recent papers (2020-2025) say about the canalization model? Where is the model contested?"
- **Related concepts**: "How does Hsp90 canalization connect to evolvability, robustness-evolvability tradeoff, and developmental plasticity? What other molecular chaperones play similar roles?"
- **Pedagogical framing**: "What are the most common misconceptions about genetic canalization? What analogies work well for teaching it?"

Each provider (Gemini Deep Research, ChatGPT Deep Research) receives the same queries and returns extended research reports with citations. The script then synthesizes across providers — where they agree, that's likely solid; where they disagree, that's worth flagging.

### Research document structure

The output is a Next.js page at `app/playgrounds/(YYYY)/(MM)/playground-name/research/page.tsx`. The document follows a consistent structure:

1. **Overview** — what this playground models, in one paragraph
2. **Historical context** — who developed these ideas, when, why, what problem they were solving
3. **The science** — the actual theory/mechanism the playground is based on, explained accessibly but accurately
4. **Key figures and papers** — the people and works that matter, with enough context to understand why
5. **What the playground simplifies** — honest accounting of where the interactive model departs from the full science, and why those simplifications were made
6. **What you can learn** — specific things to try in the playground and what they teach you
7. **Further reading** — 5-10 references for going deeper, annotated with one sentence each

The document should read like a well-written magazine article, not an academic paper. No jargon without explanation. No citation dumps. The tone is curious and direct — the same tone as the playgrounds themselves.

Styling follows the playground aesthetic: black background, lime accents, serif body text in `text-gray-300`. A "Read the research" link appears in the playground's outro section. A PDF export button on the research page uses browser print styling.

### Improvement suggestions

The second output is a markdown file at `playground-name/research/suggestions.md` with structured improvement recommendations:

```markdown
## Parameter corrections
- The default Hsp90 buffering capacity (currently 0.7) should be closer to 0.85
  based on Jarosz & Lindquist 2010 quantitative measurements
  Confidence: high (direct experimental data)

## Missing features
- Add a "stress duration" parameter — Hsp90 inhibition effects are time-dependent,
  not instantaneous. Sangster et al. 2004 showed threshold effects at ~5 generations.
  Confidence: medium (established but model-dependent)

## Conceptual corrections
- The current model treats canalization as binary (buffered/released).
  The literature describes a continuum — partial release under moderate stress.
  Consider a graded release curve.
  Confidence: high (broad consensus)

## Interesting additions
- Hsp90 also buffers epigenetic variation (Sollars et al. 2003).
  A toggle between genetic and epigenetic canalization would make the
  playground more complete and more interesting.
  Confidence: medium (established but less studied)
```

Each suggestion has a confidence level (high/medium/speculative) and a citation. The human decides what to act on.


## Supporting Infrastructure

The researcher is the core tool. The following complement it by adding scientific rigor to the playground itself, not just the companion document.


### Explicit Assumption Registry

Each playground exports a structured `assumptions.ts` file listing every modeling assumption with:

- A citation (author, year, concept)
- A confidence level (established, contested, speculative)
- A falsifiability condition (what empirical observation would invalidate this assumption)

The Viewer renders these as an expandable "Assumptions" panel. This forces rigor at authoring time — no weight ships without documented justification. The researcher's suggestions can feed directly into this registry.


### Sensitivity Analysis Panel

A standard component that automatically sweeps each input variable +/-2 while holding others constant and shows how the output changes. Standard practice in computational social science.

Reveals which parameters the model is most sensitive to, and whether the sensitivity matches what the literature predicts. If the model is most sensitive to a parameter the literature considers secondary, that signals a calibration problem.

**Implementation:** a `SensitivityAnalysis` component that takes the model's compute function, current inputs, and parameter metadata; renders a tornado chart (horizontal bars showing output range per parameter).


### Calibration Against Empirical Cases

For playgrounds with real-world referents, add a dataset of known cases with expert-consensus inputs and expected outputs. Show where the model places them vs. where experts would place them.

For example, the trust-transaction spectrum could include Estonia, Singapore, Qatar, Iceland with known geopolitical parameters. The gap between model prediction and expert consensus is the model's calibration error.

**Implementation:** a `calibration.ts` file per playground with case data; a "Calibration" panel in the Viewer showing predicted vs. expected with error magnitude.


## Deferred

The following ideas are valid but not the current priority.


### LLM Version Selector

A top-bar toggle that switches between implementations of the same playground produced by different LLMs (Claude, ChatGPT, Gemini).

Each playground would have parallel implementations — e.g. `components/Viewer.claude.tsx` and `components/Viewer.chatgpt.tsx` — and the selector swaps them at runtime. The value is not attribution but surfacing divergent modeling choices: different weight structures, interaction terms, posture thresholds. A diff panel could highlight where the models disagree on structure.

**Implementation:** shared `logic/` interface with multiple implementations behind it; a `VersionSelector` component in the playground layout; playground-level state controlling which implementation is active.


### Versioned Model Changelog

Each playground maintains a changelog tracking structural changes to the model (not code changes — model changes).

Example entries:
- v2: added interaction terms per Walt's balance-of-threat theory
- v2: corrected crisis regime to align with Thorhallsson (shelter weight increases during crisis)
- v2: elevated domestic cohesion weight 0.08 to 0.12 per Kuik's hedging framework

**Implementation:** a `CHANGELOG.md` per playground or a structured `versions.ts` with entries rendered in the playground outro.
