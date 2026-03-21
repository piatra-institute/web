## Playground Structure

The playground must use the playground layout like the other playgrounds and must have a similar file structure, it must use the black and lime color palette like the rest of the app, if a ui component is needed check if it doesn't exist in ./components, make sure the playground is registered in the index, app/playgrounds/page.tsx

Playgrounds are organized into year- and month-based route groups:
```
app/playgrounds/
├── (2024)/
│   └── (MM)/
│       └── [playground-name]/
├── (2025)/
│   └── (MM)/
│       └── [playground-name]/
├── (2026)/
│   └── (MM)/
│       └── [playground-name]/
├── data.ts             # Playground registry
└── page.tsx            # Playgrounds index page
```

Note: The parenthesized directories `(YYYY)` and `(MM)` are Next.js route groups that organize files without affecting URLs. A playground at `app/playgrounds/(2025)/(07)/entropy-cafe/` is accessed at `/playgrounds/entropy-cafe`.

Each playground follows this structure:
```
app/playgrounds/(year)/[playground-name]/
├── ideation/           # Initial concept (if provided)
│   ├── demo.xtsx       # Original demo/prototype code in TypeScript/React, with xtsx extension to avoid being treated as a TypeScript file
│   └── info.md        # Concept documentation
├── components/         # Playground-specific components
│   ├── Settings/      # Control panel component
│   │   └── index.tsx
│   └── Viewer/        # Visualization component
│       └── index.tsx
├── research/          # Optional: deep research companion page
│   ├── page.tsx       # Server component reading content.md at build time
│   └── content.md     # Long-form research article in Markdown
├── logic/             # Optional: Complex logic/algorithms
│   └── [logic].ts
├── assumptions.ts     # Optional: Modeling assumptions with citations and confidence levels
├── calibration.ts     # Optional: Known empirical cases for model validation
├── versions.ts        # Optional: LLM version metadata and model changelog
├── page.tsx           # Next.js page with metadata
└── playground.tsx     # Main playground component
```

**Reference implementation:** `app/playgrounds/(2026)/(03)/pettini-tensor-networks/` implements every pattern documented below — presets, animation, snapshot comparison, parameter sweep, sensitivity analysis, narrative generation, all scientific panels, a custom domain-specific visualization, and a research companion page. Use it as the concrete model for how these pieces fit together.

## Creating a New Playground from Ideation

When an ideation folder exists with demo.tsx and/or info.md:

1. **Analyze the ideation materials** to understand the concept, algorithms, and visualization requirements
2. **Create the playground structure**:
   - `page.tsx`: Export metadata and Playground component
   - `playground.tsx`: Main component using PlaygroundLayout
   - `components/Settings`: Controls using existing UI components (SliderInput, Button, Toggle)
   - `components/Viewer`: Visualization using canvas/recharts/other appropriate libraries
3. **Follow design patterns**:
   - Use the color palette defined below
   - No rounded corners on main containers or buttons
   - Use existing components from `/components` directory
   - Keep all state at the playground.tsx level (Settings and Viewer are controlled components)
   - Use useImperativeHandle for Viewer methods (e.g., updateMosaic)
   - Use the `Equation` component for mathematical notation instead of plain text
   - Derive all computed values via `useMemo` from params — never store derived state (metrics, distributions, sweeps) in `useState`
4. **Register in index**: Add entry to `/app/playgrounds/data.ts` with name, link, description, date, topics, and operations (see Playground Classification below)
5. **Add scientific infrastructure** (optional but recommended):
   - `assumptions.ts`: List modeling assumptions with citations, confidence levels (established/contested/speculative), and falsifiability conditions. Render via `AssumptionPanel` in Viewer.
   - `calibration.ts`: Known empirical cases with expected outputs. Render via `CalibrationPanel` in Viewer.
   - `versions.ts`: LLM version metadata and model changelog. Render `VersionSelector` in Viewer and `ModelChangelog` in outro.
   - Add `computeSensitivity` to `logic/` to generate tornado chart data. Render via `SensitivityAnalysis` in Viewer.
   - `research/`: Optional deep research companion page. See [Research Companion Page](#research-companion-page).
   - Custom domain-specific visualization components go in `components/` alongside Settings and Viewer (e.g., `MPSDiagram/index.tsx`).
   - See [Advanced Playground Patterns](#advanced-playground-patterns) for presets, animation, snapshots, sweep, and narrative generation.
6. **Ensure functionality**:
   - Convert ideation algorithms to React hooks
   - Add proper TypeScript types (avoid `any`)
   - Handle responsive sizing (typically 90% viewport)
   - Format numbers appropriately in visualizations


## Playground Classification

When registering a playground in `app/playgrounds/data.ts`, assign three classification dimensions:

### Date
- Format: `"Month YYYY"` (e.g., `"February 2026"`)
- Use the current month at the time of creation
- The directory path must match: `app/playgrounds/(YYYY)/(MM)/playground-name/`

### Topics (1-3)
Choose from: mathematics, physics, chemistry, biology, neuroscience, computer-science, economics, political-science, psychology, sociology, philosophy, aesthetics

- Pick the most specific disciplines, not the broadest
- Cross-disciplinary work gets 2-3 topics (e.g., biology + economics for Coase theorem applied to cells)
- Never more than 3 topics

### Operations (1-2)
Choose from: landscape, threshold, symmetry, morphogenesis, anatomy, tension

- **landscape**: maps a possibility/state/configuration space — "what does the terrain look like?"
- **threshold**: finds where a system changes regime — "when does it flip?"
- **symmetry**: identifies invariance under transformation — "what is preserved?"
- **morphogenesis**: shows macro pattern arising from micro process — "how does form arise?"
- **anatomy**: reveals internal structure by decomposition — "what's inside?"
- **tension**: shows opposing forces acting on a system — "what pulls against what?"

Ask: "what intellectual move does this playground make?" — not "what field is it in?"
Most playgrounds get 1-2 operations. Primary operation listed first.

See `docs/PLAYGROUND_CLASSIFICATION.md` for the full rationale and mapping of all playgrounds.


## Page Metadata

Always use `defaultOpenGraph` from `@/data/metadata` and provide full URLs for OG images:

```tsx
import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import Playground from './playground';

export const metadata: Metadata = {
    title: 'playground name · playgrounds',
    description: 'short description',

    openGraph: {
        ...defaultOpenGraph,
        title: 'playground name · playgrounds · piatra.institute',
        description: 'short description',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/playground-name.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground />;
}
```

Generate OG images with `pnpm og` (only missing) or `pnpm og:force` (all).


## Playground Components

All playground-related UI components live in `/components`. Always check here before creating new ones.

### PlaygroundLayout

The top-level layout for every playground. Manages intro/canvas/outro sections, settings panel (toggled with `s` key or gear icon), and section navigation dots.

```tsx
import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';

const sections: PlaygroundSection[] = [
    { id: 'intro', type: 'intro' },
    { id: 'canvas', type: 'canvas', content: (<PlaygroundViewer>...</PlaygroundViewer>) },
    { id: 'outro', type: 'outro', content: (<div className="space-y-8 text-gray-300">...</div>) },
];

<PlaygroundLayout
    title="playground name"
    subtitle="short description of the concept"
    description={
        <a href="https://doi.org/..." className="underline" target="_blank" rel="noopener noreferrer">
            2022, Author et al., Paper Title
        </a>
    }
    sections={sections}
    settings={<Settings params={params} onParamsChange={setParams} />}
    researchUrl="/playgrounds/playground-name/research"  // optional link to research companion
/>
```

Props:
- `title`: string - displayed as uppercase heading on intro screen
- `subtitle`: string - centered description below title (max-w-[650px])
- `description`: ReactNode - "based on {description}" text below subtitle (max-w-[650px]), typically an `<a>` linking to the source paper
- `sections`: PlaygroundSection[] - array of `{ id, type: 'intro'|'canvas'|'outro', content?, className? }`
- `settings`: ReactNode - settings panel content, rendered in a slide-in overlay from the left
- `onSettingsToggle`: (isOpen: boolean) => void - callback when settings open/close
- `researchUrl`: string - adds "read the research companion" link at the bottom of the outro section

### Outro Section Styling

The outro section wrapper and headers follow a specific pattern — do not use `font-serif` or `font-sans`:

```tsx
// Wrapper div:
<div className="space-y-8 text-gray-300">

// Section headers:
<h3 className="text-lime-400 font-semibold mb-3">Section Title</h3>

// Body text:
<p className="leading-relaxed text-sm">Content here</p>

// Highlighted blocks (equations, callouts):
<div className="border-l-2 border-lime-500/40 pl-4">
    <p className="text-lime-200/80 mb-2">Callout text</p>
</div>
```

**Do not** use `font-serif`, `font-sans`, `text-lime-100`, or `text-lg` on outro elements. Headers are `text-lime-400 font-semibold mb-3`. Body text inherits from the wrapper's `text-gray-300`.

### PlaygroundViewer

Wrapper for the canvas/visualization section. Centers children and optionally adds controls below.

```tsx
import PlaygroundViewer from '@/components/PlaygroundViewer';

<PlaygroundViewer>
    <Viewer ref={viewerRef} ... />
</PlaygroundViewer>

// With controls below the viewer:
<PlaygroundViewer controls={<Button label="Reset" onClick={reset} />}>
    <Viewer ref={viewerRef} ... />
</PlaygroundViewer>
```

Props:
- `children`: ReactNode - the visualization component
- `controls`: ReactNode - optional controls rendered below the viewer with `mt-12 mb-8` spacing

### PlaygroundSettings

Structured settings panel with titled sections.

```tsx
import PlaygroundSettings from '@/components/PlaygroundSettings';

<PlaygroundSettings
    title="Settings"
    sections={[
        { title: 'Parameters', content: (<>..sliders, toggles..</>) },
        { title: 'Display', content: (<>..toggles..</>) },
    ]}
/>
```

Props:
- `title`: string (default: "Settings")
- `sections`: `{ title?: string, content: ReactNode }[]`

### SliderInput

Labeled range slider with value display.

```tsx
import SliderInput from '@/components/SliderInput';

<SliderInput
    label="decay rate"
    value={params.decay}
    onChange={(v) => setParams({ ...params, decay: v })}
    min={0} max={1} step={0.01}
    showDecimals
/>
```

Props:
- `label`: string (supports HTML via dangerouslySetInnerHTML)
- `value`: number
- `onChange`: (value: number) => void
- `min`, `max`, `step`: number (defaults: 0, 100, 1)
- `disabled`: boolean
- `colorClass`: string (default: "text-lime-200") - color for the value display
- `showDecimals`: boolean - show decimal places based on step size

### Button

Lime-on-black action button with size variants.

```tsx
import Button from '@/components/Button';

<Button label="Run" onClick={handleRun} size="sm" />
```

Props:
- `label`: string
- `onClick`: () => void
- `disabled`: boolean
- `size`: 'xs' | 'sm' | 'md' | 'lg' (default: 'md')
- `className`: string
- `style`: CSSProperties

### Toggle

Boolean toggle switch with optional tooltip.

```tsx
import Toggle from '@/components/Toggle';

<Toggle
    text="show grid"
    value={params.showGrid}
    toggle={() => setParams({ ...params, showGrid: !params.showGrid })}
    tooltip="Display background grid lines"
/>
```

Props:
- `text`: string
- `value`: boolean
- `toggle`: () => void
- `tooltip`: ReactNode - shows a "?" icon that reveals the tooltip on hover

### Input

Text/number/range input with layout options.

```tsx
import Input from '@/components/Input';

<Input value={name} onChange={setName} placeholder="enter value" compact />
<Input type="number" value={count} onChange={(v) => setCount(+v)} min={0} max={100} compact />
```

Props:
- `value`: string | number
- `onChange`: (value: string) => void
- `type`: 'text' | 'number' | 'range' (default: 'text')
- `placeholder`, `label`: string
- `compact`: boolean - inline layout with smaller width
- `fullWidth`: boolean - takes full container width
- `centered`: boolean - center-align text
- `min`, `max`, `step`: number (for number/range types)
- `disabled`: boolean

### Dropdown

Select from a list of string options with a dark-themed dropdown.

```tsx
import Dropdown from '@/components/Dropdown';

<Dropdown
    name="preset"
    selected={params.preset}
    selectables={['option1', 'option2', 'option3']}
    atSelect={(v) => setParams({ ...params, preset: v })}
    tooltip="Choose a preset configuration"
/>
```

Props:
- `name`: string - label shown to the left
- `selected`: string - currently selected value
- `selectables`: string[] - available options
- `atSelect`: (selected: string) => void
- `tooltip`: ReactNode

### Tooltip

Hover tooltip wrapper using flowbite-react.

```tsx
import Tooltip from '@/components/Tooltip';

<Tooltip content={<div className="max-w-[250px] p-2">Help text here</div>}>
    <span className="text-gray-400 cursor-pointer">?</span>
</Tooltip>
```

### ScrollArrow

Animated bouncing arrow at the bottom of a section, scrolls to a target element.

```tsx
import ScrollArrow from '@/components/ScrollArrow';

<ScrollArrow targetId="canvas" label="Go to playground" />
```

Props:
- `targetId`: string - id of the element to scroll to
- `onClick`: () => void - alternative to targetId
- `label`: string (default: "Scroll down") - aria-label

### Equation

LaTeX math rendering using react-katex. See [Mathematical Notation](#mathematical-notation) below for usage.

### SettingsContainer

Legacy fixed-position settings box (top-right corner). Prefer `PlaygroundLayout`'s built-in settings panel for new playgrounds.

```tsx
import SettingsContainer from '@/components/SettingsContainer';

<SettingsContainer>
    <SliderInput ... />
    <Toggle ... />
</SettingsContainer>
```

### LinkButton

Button styled as a link, with optional icon (string URL or ReactNode).

```tsx
import LinkButton from '@/components/LinkButton';

<LinkButton text="view source" icon={githubIcon} onClick={handleClick} centered />
```


### AssumptionPanel

Expandable panel listing modeling assumptions with confidence levels and falsifiability conditions. Color-coded: lime for established, yellow for contested, orange for speculative. Each playground provides assumptions via an `assumptions.ts` file.

```tsx
import AssumptionPanel, { Assumption } from '@/components/AssumptionPanel';

const assumptions: Assumption[] = [
    {
        id: 'unique-id',
        statement: 'The assumption in plain language.',
        citation: 'Author, Year — supporting evidence',
        confidence: 'established',  // | 'contested' | 'speculative'
        falsifiability: 'What observation would invalidate this.',
    },
];

<AssumptionPanel assumptions={assumptions} />
```

Props:
- `assumptions`: `Assumption[]` - array of `{ id, statement, citation, confidence, falsifiability }`

### SensitivityAnalysis

Tornado chart showing how an output metric changes when each input parameter is swept min→max while others are held constant. Bars sorted by range (most sensitive at top). Pre-computed bars are passed as props.

```tsx
import SensitivityAnalysis, { SensitivityBar } from '@/components/SensitivityAnalysis';

<SensitivityAnalysis
    bars={sensitivityBars}
    baseline={metrics.searchTime}
    outputLabel="search time"
/>
```

Props:
- `bars`: `SensitivityBar[]` - array of `{ label, low, high }` sorted by range
- `baseline`: number - current output value (shown as vertical line)
- `outputLabel`: string - label for the output metric

### CalibrationPanel

Expandable table comparing model predictions against known empirical cases. Shows predicted vs. expected values with error percentages. Color-coded: lime for <15% error, yellow for <35%, orange for larger.

```tsx
import CalibrationPanel, { CalibrationResult } from '@/components/CalibrationPanel';

<CalibrationPanel results={calibrationResults} outputLabel="search time" />
```

Props:
- `results`: `CalibrationResult[]` - array of `{ name, description, predicted, expected, source }`
- `outputLabel`: string - label for the output metric

### VersionSelector

Shows which LLM generated the current playground implementation. Compact info label for single version; clickable tabs for multiple versions.

```tsx
import VersionSelector, { ModelVersion } from '@/components/VersionSelector';

<VersionSelector versions={versions} active="claude-v1" onSelect={setActiveVersion} />
```

Props:
- `versions`: `ModelVersion[]` - array of `{ id, llm, date, description }`
- `active`: string - id of the active version
- `onSelect`: `(id: string) => void` - optional callback when version changes

### ModelChangelog

Renders structural model changes (not code changes) as a versioned list. Typically placed in the outro section.

```tsx
import ModelChangelog, { ChangelogEntry } from '@/components/ModelChangelog';

<ModelChangelog entries={changelog} />
```

Props:
- `entries`: `ChangelogEntry[]` - array of `{ version, date, changes: string[] }`

### ResearchPromptButton

Expandable section in the outro that generates structured deep research prompts. Each prompt includes the full playground source code as context. 6 steps: historical context, scientific accuracy, related concepts, pedagogical framing, assumption validation, synthesis. Optional focus field lets users steer the research angle. No API keys needed — user copies prompts into ChatGPT Deep Research / Gemini manually.

Requires `sourceContext` from `readPlaygroundSource()` (server-side utility that reads source files at build time).

```tsx
// In page.tsx (server component):
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(03)/playground-name',
    { name: 'playground-name', title: 'Title', description: '...', topics: [...], operations: [...] },
);

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
```

```tsx
// In playground.tsx outro section:
import ResearchPromptButton from '@/components/ResearchPromptButton';
import { PlaygroundSourceContext } from '@/lib/readPlaygroundSource';

{sourceContext && (
    <div className="border-t border-lime-500/20 pt-8">
        <ResearchPromptButton context={sourceContext} />
    </div>
)}
```

Props:
- `context`: `PlaygroundSourceContext` - bundled source code and metadata from `readPlaygroundSource()`


## Color Palette

Use the black and lime color scheme consistently:

**Backgrounds:**
- Primary background: `#000000` (black)
- Canvas/chart background: `#0a0a0a` (near-black)
- Overlay (dimming): `bg-black/50` to `bg-black/80`

**Lime accents (primary brand color):**
- Primary lime: `#84cc16` / `lime-500` / `rgb(132, 204, 22)`
- Borders: `border-lime-500`, `border-lime-500/30` (muted), `border-lime-500/20` (subtle)
- Text highlights: `text-lime-400`, `text-lime-500`
- Backgrounds: `bg-lime-500/10` (selected states)

**Text colors:**
- Primary text: `text-lime-100` (whitish-lime, high contrast)
- Secondary text: `text-lime-200/70` (descriptions, labels)
- Muted text: `text-lime-200/60` (help text, hints)
- Highlights: `text-lime-400` (values, emphasis)
- Body text in outro sections: `text-gray-300`

**Avoid:**
- Pure gray text in settings panels (use lime-tinted whites instead)
- Rounded corners on main containers or buttons

## State Management

All simulation/visualization state must be managed at the `playground.tsx` level:

```tsx
// playground.tsx - owns all state
const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
const [stats, setStats] = useState<Stats | null>(null);

// Settings is a controlled component
<Settings params={params} onParamsChange={setParams} />

// Viewer receives data, exposes methods via ref
<Viewer ref={viewerRef} colorMode={params.colorMode} ... />
```

This pattern prevents state reset when toggling the settings panel open/closed.


## Advanced Playground Patterns

These patterns are optional but recommended for feature-rich playgrounds. All are demonstrated in the reference implementation (`pettini-tensor-networks`).

### Preset System

Define a `PresetKey` union type and a `PRESET_DESCRIPTIONS` record in `logic/`. A `presetParams()` function returns a full `Params` object for each key.

```tsx
// logic/index.ts
export type PresetKey = 'baseline' | 'enhanced' | 'extreme';

export const PRESET_DESCRIPTIONS: Record<PresetKey, { label: string; question: string; expectation: string }> = {
    'baseline': {
        label: 'baseline',
        question: 'What happens with default parameters?',
        expectation: 'Standard behavior with no special effects.',
    },
    // ...
};

export function presetParams(key: PresetKey): Params {
    switch (key) {
        case 'baseline': return { ...DEFAULT_PARAMS, preset: 'baseline' };
        // ...
    }
}
```

Render preset buttons in Settings as a grid. Active preset: `border-lime-500 bg-lime-500/10 text-lime-400`. Inactive: `border-lime-500/20 text-lime-200/60`. Display the selected preset's `question` and `expectation` in a bordered box below the buttons.

### Animation / Interpolation

Animate transitions between initial and steady-state distributions when parameters change.

```tsx
// playground.tsx
const [animPlaying, setAnimPlaying] = useState(false);
const [animTime, setAnimTime] = useState(1); // 1 = steady state shown on load
const animFrameRef = useRef<number | null>(null);

// Auto-play on param change (skip first render)
const isFirstRender = useRef(true);
useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setAnimTime(0);
    setAnimPlaying(true);
}, [params]);

// Animation loop
useEffect(() => {
    if (!animPlaying) { /* cancel frame, return */ }
    const step = () => {
        setAnimTime(prev => {
            const next = prev + 1 / ANIMATION_TOTAL_FRAMES;
            if (next >= 1) { setAnimPlaying(false); return 1; }
            return next;
        });
        animFrameRef.current = requestAnimationFrame(step);
    };
    animFrameRef.current = requestAnimationFrame(step);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
}, [animPlaying]);

// Interpolated display data
const displayDistribution = useMemo(
    () => interpolateDistribution(initialDist, steadyStateDist, easeInOutCubic(animTime)),
    [initialDist, steadyStateDist, animTime],
);
```

Put `interpolateDistribution`, `easeInOutCubic`, and `ANIMATION_TOTAL_FRAMES` (typically 70) in `logic/`. Render play/pause/replay buttons and a scrub slider via PlaygroundViewer's `controls` prop.

### Snapshot Comparison

Allow users to save current state and compare against it after changing parameters.

```tsx
// logic/index.ts
export interface Snapshot {
    params: Params;
    metrics: Metrics;
    distribution: SiteDatum[];
    label: string;
}

// playground.tsx
const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

const saveSnapshot = useCallback(() => {
    setSnapshot({ params, metrics, distribution, label: params.preset });
}, [params, metrics, distribution]);
```

In Settings, show a `MetricDelta` component when a snapshot exists — displays current vs. saved values with delta arrows. Color-code: lime for improvements, orange for regressions, muted for unchanged.

```tsx
function MetricDelta({ label, current, saved }: { label: string; current: number; saved: number }) {
    const delta = current - saved;
    const arrow = delta > 0.005 ? '↑' : delta < -0.005 ? '↓' : '=';
    // Color logic depends on whether higher is better for this metric
    return (
        <div className="text-lime-200/60 text-xs font-mono">
            {label}: <span className="text-lime-400">{(current * 100).toFixed(1)}%</span>
            {' '}<span className={color}>{arrow} {Math.abs(delta * 100).toFixed(1)}%</span>
        </div>
    );
}
```

In Viewer, overlay the snapshot distribution as a dashed orange line (`stroke="#f97316"`, `strokeDasharray="6 3"`, `fill="none"`).

### Parameter Sweep

Sweep one parameter across its range while holding others constant, showing how output metrics respond.

```tsx
// logic/index.ts
export type SweepableParam = keyof Omit<Params, 'preset'>;

export const PARAM_SPECS: { key: SweepableParam; label: string; min: number; max: number }[] = [
    { key: 'paramA', label: 'param A', min: 0, max: 100 },
    // ...
];

export function computeSweep(params: Params, sweepKey: SweepableParam): SweepDatum[] {
    const spec = PARAM_SPECS.find(s => s.key === sweepKey)!;
    const data: SweepDatum[] = [];
    for (let i = 0; i < 51; i++) {
        const v = spec.min + (spec.max - spec.min) * (i / 50);
        const m = computeMetrics({ ...params, [sweepKey]: v });
        data.push({ sweepValue: v, ...m });
    }
    return data;
}

// playground.tsx
const [sweepParam, setSweepParam] = useState<SweepableParam>('paramA');
const sweep = useMemo(() => computeSweep(params, sweepParam), [params, sweepParam]);
```

In Viewer, render param-selector buttons above a `LineChart` with one line per output metric.

### Narrative Generation

Generate a plain-language interpretation of the current state by comparing metrics against a baseline.

```tsx
// logic/index.ts
export function computeNarrative(metrics: Metrics, params: Params): string {
    const baseline = computeMetrics({ ...params, /* disable special effects */ });
    const speedup = baseline.primaryMetric / metrics.primaryMetric;

    if (metrics.effectStrength < THRESHOLD_LOW) {
        return `No significant effect. ...`;
    }
    const parts: string[] = [];
    parts.push(`The system is ${speedup.toFixed(1)}× faster than baseline.`);
    // Add conditional clauses based on parameter regimes
    return parts.join(' ');
}

// playground.tsx
const narrative = useMemo(() => computeNarrative(metrics, params), [metrics, params]);
```

Display the narrative in Settings inside a bordered box: `border border-lime-500/20 p-3` with `text-xs text-lime-200/70 leading-relaxed`.

### Custom Domain-Specific Visualizations

Place custom SVG or canvas components in `components/` alongside Settings and Viewer (e.g., `MPSDiagram/index.tsx`). These should:

- Accept computed data as props (no internal state)
- Use lime palette with varying opacity for data encoding
- Be responsive via SVG `viewBox` (no fixed pixel dimensions)
- Highlight special elements (targets, start positions) with distinct styling


## Research Companion Page

A playground can include a long-form research companion accessible at `/playgrounds/playground-name/research`.

### File structure

```
research/
├── page.tsx       # Server component
└── content.md     # Markdown research article
```

### page.tsx template

```tsx
import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import ResearchRenderer from '@/components/ResearchRenderer';

const content = fs.readFileSync(
    path.join(process.cwd(), 'app/playgrounds/(YYYY)/(MM)/playground-name/research/content.md'),
    'utf-8',
);

export const metadata: Metadata = {
    title: 'playground name · research · playgrounds',
    description: 'research companion for playground name',
    openGraph: {
        ...defaultOpenGraph,
        title: 'playground name · research · playgrounds · piatra.institute',
        description: 'research companion for playground name',
    },
};

export default function ResearchPage() {
    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
                <ResearchRenderer content={content} title="playground name" />
            </div>
        </div>
    );
}
```

### content.md guidelines

- Standard Markdown with GFM (tables, task lists, footnotes)
- Structure as a research document: abstract, background, model description, results, limitations, references
- Keep inline with the playground's assumptions and calibration data

### Linking from the playground

Pass the `researchUrl` prop to `PlaygroundLayout`:

```tsx
<PlaygroundLayout
    researchUrl="/playgrounds/playground-name/research"
    ...
/>
```

This adds a "read the research companion" link at the bottom of the outro section.


## Viewer / Recharts Patterns

### ResponsiveContainer sizing

`ResponsiveContainer` measures its parent to determine width/height. If the parent has no explicit dimensions it returns -1, causing `width(-1) and height(-1)` console errors.

Fix:
- Outer Viewer `<div>` must have explicit dimensions: `className="w-[90vw] h-[90vh] overflow-y-auto"`
- The wrapper `<div>` around `ResponsiveContainer` needs an explicit pixel height: `style={{ width: '100%', height: 460 }}`
- `ResponsiveContainer` needs `minWidth={0}` to prevent negative-width edge cases: `<ResponsiveContainer width="100%" height={460} minWidth={0}>`

### Focus outlines on canvas/SVG elements

Recharts SVG elements and canvas containers receive browser focus outlines on click. Suppress with `outline-none [&_*]:outline-none` on the outer Viewer div.

### Settings input styling

Global CSS (`globals.css`) overrides `input::placeholder` with `background-color` and `color: black !important`. For dark-themed settings inputs, override with:
- `[&::placeholder]:!bg-transparent [&::placeholder]:!text-lime-200/40` on the input element
- `style={{ backgroundColor: '#000' }}` and `appearance-none` for fully dark inputs


## Mathematical Notation

When displaying mathematical equations in playgrounds, use the `Equation` component from `/components/Equation`:

- **Inline equations** (within text): `<Equation math="w = \frac{\Pi_p}{\Pi_p + \Pi_y}" />`
- **Block equations** (centered on own line): `<Equation mode="block" math="\text{Net} = \text{Analgesia} - \text{Nocebo}" />`
- Use LaTeX syntax for all mathematical notation
- Import the component: `import Equation from '@/components/Equation';`

Example usage:
```tsx
<p className="text-gray-300">
    The prior weight{' '}
    <Equation math="w = \frac{\Pi_p}{\Pi_p + \Pi_y}" />
    {' '}determines the relative influence...
</p>

<Equation mode="block" math="\text{saturate}(x) = \frac{x}{1+|x|}" />
```

## TypeScript

+ always use `pnpm` for package management
+ avoid using `any`, prefer specific types or generics
