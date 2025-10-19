## Playground Structure

The playground must use the playground layout like the other playgrounds and must have a similar file structure, it must use the black and lime color palette like the rest of the app, if a ui component is needed check if it doesn't exist in ./components, make sure the playground is registered in the index, app/playgrounds/page.tsx

Each playground follows this structure:
```
app/playgrounds/[playground-name]/
├── ideation/           # Initial concept (if provided)
│   ├── demo.tsx       # Original demo/prototype code
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
   - Use black (#000000) background and lime (#84cc16) accents
   - No rounded corners on main containers or buttons
   - Use existing components from `/components` directory
   - Implement useImperativeHandle pattern for Settings → Viewer communication
   - Use the `Equation` component for mathematical notation instead of plain text
4. **Register in index**: Add entry to `/app/playgrounds/data.ts`
5. **Ensure functionality**:
   - Convert ideation algorithms to React hooks
   - Add proper TypeScript types (avoid `any`)
   - Handle responsive sizing (typically 90% viewport)
   - Format numbers appropriately in visualizations


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
