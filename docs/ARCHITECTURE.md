# Architecture

## Overview

piatra.institute is a Next.js 16 application using the App Router. The site serves as a platform for interactive research playgrounds that explore scientific and philosophical concepts through visualization and simulation.

## Core Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App                          │
├─────────────────────────────────────────────────────────────┤
│  app/                                                       │
│  ├── layout.tsx          Root layout with fonts/metadata    │
│  ├── (primary)/          Home page route group              │
│  ├── playgrounds/        Interactive simulations            │
│  ├── papers/             Research papers                    │
│  ├── platforms/          Platform descriptions              │
│  ├── press/              Press coverage                     │
│  └── provocations/       Thought pieces                     │
├─────────────────────────────────────────────────────────────┤
│  components/             Shared UI components               │
│  data/                   Shared configuration               │
│  logic/                  Shared utilities                   │
└─────────────────────────────────────────────────────────────┘
```

## Route Groups

Next.js route groups (parentheses folders) organize code without affecting URLs:

- `(primary)/` - Home page
- `(2024)/`, `(2025)/`, `(2026)/` - Organize playgrounds by year

A playground at `app/playgrounds/(2025)/my-playground/` is accessed at `/playgrounds/my-playground`.

## Playground Architecture

Each playground is a self-contained module with:

```
playground-name/
├── ideation/           # Original concept (optional)
│   ├── demo.xtsx       # Prototype code
│   └── info.md         # Concept documentation
├── components/
│   ├── Settings/       # Control panel (controlled component)
│   │   └── index.tsx
│   └── Viewer/         # Visualization (refs for methods)
│       └── index.tsx
├── logic/              # Simulation algorithms (optional)
│   └── index.ts
├── page.tsx            # Next.js page with metadata
└── playground.tsx      # Main component (owns all state)
```

### State Management Pattern

All state lives in `playground.tsx` to prevent reset when toggling settings:

```tsx
// playground.tsx - single source of truth
const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);

// Settings is controlled - receives props, calls callbacks
<Settings params={params} onParamsChange={setParams} />

// Viewer receives display props, exposes methods via ref
<Viewer ref={viewerRef} showEdges={params.showEdges} />
```

### PlaygroundLayout Component

`PlaygroundLayout` provides the standard three-section structure:

1. **Intro section** - Title, subtitle, reference link
2. **Canvas section** - Main visualization with settings toggle
3. **Outro section** - Scientific explanation

Features:
- Scroll-snap navigation between sections
- Keyboard shortcuts (`s` for settings, `Escape` to close)
- Settings panel overlay with backdrop blur
- Section indicators (bottom-right dots)

## Shared Components

| Component | Purpose |
|-----------|---------|
| `PlaygroundLayout` | Standard playground wrapper with sections |
| `SliderInput` | Numeric slider with label and value display |
| `Button` | Styled button with lime accent |
| `Toggle` | Boolean toggle switch |
| `Equation` | KaTeX-rendered mathematical notation |
| `Header` | Site header with logo |

## Data Flow

```
┌──────────────────┐     ┌──────────────────┐
│   playground.tsx │────▶│     Settings     │
│   (state owner)  │◀────│   (controlled)   │
└────────┬─────────┘     └──────────────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐
│      logic/      │────▶│      Viewer      │
│   (algorithms)   │     │  (visualization) │
└──────────────────┘     └──────────────────┘
```

## Build Process

1. **Prebuild** (`prebuild.js`): Fetches external data (provocations, papers, press)
2. **Next.js Build**: Static generation with ISR for dynamic routes
3. **OG Generation** (`scripts/generate-og-images.js`): Creates social images

## Database

Uses Drizzle ORM with libSQL (Turso) for persistent storage when needed.

## Styling

- **Tailwind CSS 4.1** with custom configuration
- **Design tokens** in `data/styles.ts`
- **Color palette**: Black background, lime accents, lime-tinted text
- **Typography**: Libre Baskerville (serif) for titles

## Performance Considerations

- Static generation for most pages
- Canvas-based rendering for complex visualizations
- History sampling in simulations (configurable `storeEvery`)
- Device pixel ratio limiting (`Math.min(dpr, 2)`)
