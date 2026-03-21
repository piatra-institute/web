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


### Manual Research via ResearchPromptButton

For users without API keys or who want more control over the research process, each playground can include a `ResearchPromptButton` in its outro section. This generates structured deep research prompts that include the full playground source code as context. The user copies each prompt into ChatGPT Deep Research, Gemini Deep Research, or any capable AI manually.

The button produces 6 research steps (matching the same intellectual categories as the automated script):

1. **Historical context & intellectual lineage** — origins, key figures, foundational papers
2. **Scientific accuracy & empirical evidence** — claims vs published evidence, parameter validation
3. **Related concepts & cross-disciplinary connections** — adjacent fields, structural analogies
4. **Pedagogical framing & learning design** — teaching effectiveness, misconceptions, improvements
5. **Assumption validation & sensitivity** — scrutinize each assumption's confidence and falsifiability
6. **Synthesis & suggested improvements** — produce a research companion document + improvement list

Each prompt includes: playground metadata, full logic/index.ts, assumptions.ts, calibration.ts, versions.ts, and playground.tsx source code. An optional focus field lets users steer the research angle (analogous to `--focus` in the CLI).

**Implementation**: The `readPlaygroundSource()` utility in `lib/readPlaygroundSource.ts` reads source files at build time (server component). The source context is passed as a prop through `page.tsx` → `playground.tsx` → `ResearchPromptButton` (client component). Prompt templates live in `components/ResearchPromptButton/prompts.ts`.

| Aspect | researcher.py (CLI) | ResearchPromptButton (browser) |
|--------|---------------------|-------------------------------|
| Runs | Developer machine | Any user in browser |
| API keys | Required | None needed |
| Research | Automated multi-provider | User copies to AI manually |
| Output | Writes content.md + page.tsx | User gets raw markdown back |
| Queries | LLM-generated, interactive | Fixed 6-step structure |
| Focus | `--focus` CLI flag | Text field in UI |


## Supporting Infrastructure

The researcher is the core tool. The following complement it by adding scientific rigor to the playground itself, not just the companion document. All three are implemented as shared components in `/components/` and integrated per-playground via data files.


### Explicit Assumption Registry

Each playground exports a structured `assumptions.ts` file listing every modeling assumption with:

- A citation (author, year, concept)
- A confidence level (established, contested, speculative)
- A falsifiability condition (what empirical observation would invalidate this assumption)

The `AssumptionPanel` component (`/components/AssumptionPanel`) renders these as an expandable panel in the Viewer. Confidence levels are color-coded: lime for established, yellow for contested, orange for speculative. This forces rigor at authoring time — no assumption ships without documented justification. The researcher's suggestions can feed directly into this registry.

```tsx
// assumptions.ts
import { Assumption } from '@/components/AssumptionPanel';

export const assumptions: Assumption[] = [
    {
        id: 'unique-id',
        statement: 'The modeling assumption in plain language.',
        citation: 'Author, Year — brief description of supporting evidence',
        confidence: 'established',  // | 'contested' | 'speculative'
        falsifiability: 'What observation would invalidate this assumption.',
    },
];
```

```tsx
// In Viewer:
import AssumptionPanel from '@/components/AssumptionPanel';
<AssumptionPanel assumptions={assumptions} />
```


### Sensitivity Analysis Panel

The `SensitivityAnalysis` component (`/components/SensitivityAnalysis`) renders a tornado chart showing how a chosen output metric changes when each input parameter is swept from min to max while all others are held constant. Bars are sorted by range (most sensitive parameter at top).

Standard practice in computational social science. Reveals which parameters the model is most sensitive to, and whether the sensitivity matches what the literature predicts. If the model is most sensitive to a parameter the literature considers secondary, that signals a calibration problem.

The playground's `logic/` file exports a `computeSensitivity` function that sweeps parameters and returns pre-computed bars. The component receives these bars plus the baseline value.

```tsx
// logic/index.ts
export function computeSensitivity(params: Params): SensitivityBar[] {
    return PARAM_SPECS.map(spec => {
        const atMin = computeMetrics({ ...params, [spec.key]: spec.min }).searchTime;
        const atMax = computeMetrics({ ...params, [spec.key]: spec.max }).searchTime;
        return { label: spec.label, low: Math.min(atMin, atMax), high: Math.max(atMin, atMax) };
    }).sort((a, b) => (b.high - b.low) - (a.high - a.low));
}
```

```tsx
// In Viewer:
import SensitivityAnalysis from '@/components/SensitivityAnalysis';
<SensitivityAnalysis bars={sensitivityBars} baseline={metrics.searchTime} outputLabel="search time" />
```


### Calibration Against Empirical Cases

For playgrounds with real-world referents, a `calibration.ts` file exports known cases with expert-consensus parameter inputs and expected output values. The `CalibrationPanel` component (`/components/CalibrationPanel`) renders an expandable table showing predicted vs. expected values with error percentages. Color-coded: lime for <15% error, yellow for <35%, orange for larger deviations.

The `playground.tsx` maps calibration cases to results by running each case's parameters through the compute function:

```tsx
// calibration.ts
export interface CalibrationCase {
    name: string;
    description: string;
    params: { /* playground-specific parameter values */ };
    expected: number;
    source: string;
}
export const calibrationCases: CalibrationCase[] = [ /* ... */ ];
```

```tsx
// In playground.tsx:
const calibrationResults = useMemo(() => calibrationCases.map(c => ({
    name: c.name,
    description: c.description,
    predicted: computeMetrics({ ...c.params, preset: 'default' }).outputMetric,
    expected: c.expected,
    source: c.source,
})), []);
```

```tsx
// In Viewer:
import CalibrationPanel from '@/components/CalibrationPanel';
<CalibrationPanel results={calibrationResults} outputLabel="search time" />
```


### LLM Version Selector

The `VersionSelector` component (`/components/VersionSelector`) shows which LLM generated the current playground implementation. When multiple versions exist, it renders clickable tabs to switch between them. When only one version exists (the common case), it displays version info as a compact label.

Each playground exports a `versions.ts` file with version metadata. The full swapping mechanism — where different LLMs produce parallel implementations (e.g. `Viewer.claude.tsx`, `Viewer.chatgpt.tsx`) behind a shared `logic/` interface — is ready for use when parallel implementations exist.

```tsx
// versions.ts
import { ModelVersion } from '@/components/VersionSelector';

export const versions: ModelVersion[] = [
    { id: 'claude-v1', llm: 'Claude', date: 'March 2026', description: 'initial implementation' },
];
```

```tsx
// In Viewer:
import VersionSelector from '@/components/VersionSelector';
<VersionSelector versions={versions} active={versions[0]?.id ?? ''} onSelect={setActiveVersion} />
```


### Versioned Model Changelog

The `ModelChangelog` component (`/components/ModelChangelog`) renders a list of structural model changes (not code changes — model changes). Each entry has a version tag, date, and list of changes. Rendered in the playground's outro section.

```tsx
// versions.ts
import { ChangelogEntry } from '@/components/ModelChangelog';

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1',
        date: 'March 2026',
        changes: [
            'Initial 6-parameter toy model with diffusion, sliding, and resonance terms',
            'Probability distribution visualization over 80 DNA sites',
        ],
    },
];
```

```tsx
// In outro section:
import ModelChangelog from '@/components/ModelChangelog';
<ModelChangelog entries={changelog} />
```
