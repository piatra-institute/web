# Implementation Guide

## Creating a New Playground

### 1. Create Directory Structure

```bash
app/playgrounds/(2026)/my-playground/
├── components/
│   ├── Settings/
│   │   └── index.tsx
│   └── Viewer/
│       └── index.tsx
├── logic/
│   └── index.ts        # Optional: complex algorithms
├── page.tsx
└── playground.tsx
```

### 2. Create page.tsx

Always use `defaultOpenGraph` and provide full URLs for OG images:

```tsx
import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import Playground from './playground';

export const metadata: Metadata = {
    title: 'my playground · playgrounds',
    description: 'brief description of the playground',

    openGraph: {
        ...defaultOpenGraph,
        title: 'my playground · playgrounds · piatra.institute',
        description: 'brief description of the playground',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/my-playground.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground />;
}
```

### 3. Create playground.tsx

```tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import Settings, { SimulationParams, DEFAULT_PARAMS } from './components/Settings';
import Viewer, { ViewerRef } from './components/Viewer';
import Equation from '@/components/Equation';

export default function Playground() {
    const viewerRef = useRef<ViewerRef>(null);
    const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
    const [settingsOpen, setSettingsOpen] = useState(false);

    useEffect(() => {
        // Run simulation when params change
        const result = runSimulation(params);
        viewerRef.current?.update(result);
    }, [params]);

    const sections: PlaygroundSection[] = [
        { id: 'intro', type: 'intro' },
        {
            id: 'canvas',
            type: 'canvas',
            content: (
                <div className="absolute inset-0 flex flex-col">
                    {settingsOpen && (
                        <div className="absolute inset-0 bg-black/50 z-10 pointer-events-none" />
                    )}
                    <Viewer ref={viewerRef} params={params} />
                </div>
            ),
        },
        {
            id: 'outro',
            type: 'outro',
            content: (
                <div className="space-y-6">
                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Section Title</h4>
                        <p className="text-gray-300">
                            Explanation with inline math: <Equation math="E = mc^2" />
                        </p>
                        <Equation mode="block" math="\sum_{i=1}^{n} x_i" />
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="My Playground"
            subtitle="exploring interesting concepts"
            description={
                <a href="https://example.com" target="_blank" className="text-blue-400 hover:text-blue-300 underline">
                    2024, Author, Paper Title
                </a>
            }
            sections={sections}
            settings={<Settings params={params} onParamsChange={setParams} />}
            onSettingsToggle={setSettingsOpen}
        />
    );
}
```

### 4. Create Settings Component

```tsx
'use client';

import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';

export interface SimulationParams {
    parameter1: number;
    parameter2: number;
    showOption: boolean;
}

export const DEFAULT_PARAMS: SimulationParams = {
    parameter1: 50,
    parameter2: 0.5,
    showOption: true,
};

interface SettingsProps {
    params: SimulationParams;
    onParamsChange: (params: SimulationParams) => void;
}

export default function Settings({ params, onParamsChange }: SettingsProps) {
    const updateParam = <K extends keyof SimulationParams>(
        key: K,
        value: SimulationParams[K]
    ) => {
        onParamsChange({ ...params, [key]: value });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Parameters</h3>
                <SliderInput
                    label="Parameter 1"
                    min={0}
                    max={100}
                    step={1}
                    value={params.parameter1}
                    onChange={(v) => updateParam('parameter1', v)}
                />
                <SliderInput
                    label="Parameter 2"
                    min={0}
                    max={1}
                    step={0.01}
                    value={params.parameter2}
                    onChange={(v) => updateParam('parameter2', v)}
                    showDecimals
                />
            </div>

            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">Display</h3>
                <label className="flex items-center gap-2 text-xs text-lime-100 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={params.showOption}
                        onChange={(e) => updateParam('showOption', e.target.checked)}
                        className="accent-lime-500"
                    />
                    Show option
                </label>
            </div>
        </div>
    );
}
```

### 5. Create Viewer Component

```tsx
'use client';

import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

export interface ViewerRef {
    update: (data: SimulationResult) => void;
}

interface ViewerProps {
    params: SimulationParams;
}

const Viewer = forwardRef<ViewerRef, ViewerProps>(({ params }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
        update: (data: SimulationResult) => {
            // Update visualization with new data
            draw(canvasRef.current, data);
        },
    }));

    useEffect(() => {
        // Handle resize, initial draw, etc.
    }, [params]);

    return (
        <div className="w-full h-full">
            <canvas ref={canvasRef} className="w-full h-full" />
        </div>
    );
});

Viewer.displayName = 'Viewer';
export default Viewer;
```

### 6. Register in data.ts

```typescript
// app/playgrounds/data.ts
export const playgrounds = [
    // ... existing playgrounds
    {
        name: 'my playground',
        link: '/playgrounds/my-playground',
        description: 'brief description of the concept',
        date: 'January 2026',
    },
];
```

### 7. Generate OG Image

```bash
pnpm og          # Generate missing images only
pnpm og:dry      # Preview what would be generated
pnpm og:force    # Regenerate all images
```

## Color Palette Reference

### Backgrounds
- Primary: `#000000` / `bg-black`
- Canvas: `#0a0a0a`
- Overlay: `bg-black/50` to `bg-black/80`

### Lime Accents
- Primary: `#84cc16` / `lime-500`
- Borders: `border-lime-500`, `border-lime-500/30`, `border-lime-500/20`
- Text: `text-lime-400`, `text-lime-500`
- Selected: `bg-lime-500/10`

### Text
- Primary: `text-lime-100`
- Secondary: `text-lime-200/70`
- Muted: `text-lime-200/60`
- Highlights: `text-lime-400`
- Body (outro): `text-gray-300`

## Canvas Rendering Best Practices

```typescript
// Handle device pixel ratio
const rect = canvas.getBoundingClientRect();
const dpr = Math.min(window.devicePixelRatio || 1, 2);
canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

// Keep visualization square
const size = Math.min(w, h) * 0.98;
const offsetX = (w - size) / 2;
const offsetY = (h - size) / 2;
```

## Animation Pattern

```typescript
const [isPlaying, setIsPlaying] = useState(false);
const [frame, setFrame] = useState(0);

useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
        setFrame(prev => {
            if (prev >= maxFrames - 1) {
                setIsPlaying(false);
                return prev;
            }
            return prev + 1;
        });
    }, 100); // ms per frame

    return () => clearInterval(interval);
}, [isPlaying, maxFrames]);
```

## Mathematical Notation

Use the `Equation` component for all math:

```tsx
import Equation from '@/components/Equation';

// Inline
<p>The formula <Equation math="E = mc^2" /> shows...</p>

// Block (centered)
<Equation mode="block" math="\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}" />
```

## TypeScript Guidelines

- Avoid `any` - use specific types or generics
- Define interfaces for all props and state
- Export types that other components need
- Use `forwardRef` with `useImperativeHandle` for Viewer methods
