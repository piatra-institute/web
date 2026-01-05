## Playground Structure

The playground must use the playground layout like the other playgrounds and must have a similar file structure, it must use the black and lime color palette like the rest of the app, if a ui component is needed check if it doesn't exist in ./components, make sure the playground is registered in the index, app/playgrounds/page.tsx

Playgrounds are organized into year-based route groups:
```
app/playgrounds/
├── (2024)/             # Route group for 2024 playgrounds
│   └── [playground-name]/
├── (2025)/             # Route group for 2025 playgrounds
│   └── [playground-name]/
├── (2026)/             # Route group for 2026 playgrounds
│   └── [playground-name]/
├── data.ts             # Playground registry
└── page.tsx            # Playgrounds index page
```

Note: The parentheses `(year)` create Next.js route groups that organize files without affecting URLs. A playground at `app/playgrounds/(2025)/my-playground/` is accessed at `/playgrounds/my-playground`.

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
├── logic/             # Optional: Complex logic/algorithms
│   └── [logic].ts
├── page.tsx           # Next.js page with metadata
└── playground.tsx     # Main playground component
```

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
4. **Register in index**: Add entry to `/app/playgrounds/data.ts`
5. **Ensure functionality**:
   - Convert ideation algorithms to React hooks
   - Add proper TypeScript types (avoid `any`)
   - Handle responsive sizing (typically 90% viewport)
   - Format numbers appropriately in visualizations


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
