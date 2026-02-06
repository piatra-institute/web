'use client';

import { useCallback, useRef, useState } from 'react';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Equation from '@/components/Equation';

import Viewer, { ViewerRef } from './components/Viewer';
import Settings from './components/Settings';
import MetricsOverlay from './components/MetricsOverlay';

import type { SimulationMetrics, SimulationParams } from './types';



const DEFAULT_PARAMS: SimulationParams = {
    isPaused: false,
    isStirring: false,
    stirStrength: 9.5,
    pourRate: 650,
    viscosity: 0.42,
    diffusion: 0.28,
    buoyancy: 0.7,
    speed: 1,
};

const DEFAULT_METRICS: SimulationMetrics = {
    entropy: 0,
    mixedness: 0,
    complexity: 0,
    kinetic: 0,
};

const HISTORY_LENGTH = 120;

export default function EntropyCafePlayground() {
    const viewerRef = useRef<ViewerRef>(null);
    const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
    const [metrics, setMetrics] = useState<SimulationMetrics>(DEFAULT_METRICS);
    const [history, setHistory] = useState<SimulationMetrics[]>([]);

    const handleMetricsUpdate = useCallback((sample: SimulationMetrics) => {
        const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
        const amplify = (value: number, gain: number, power: number) => (
            clamp01(Math.pow(clamp01(value * gain), power))
        );

        const sanitized = {
            entropy: Number.isFinite(sample.entropy) ? sample.entropy : 0,
            mixedness: Number.isFinite(sample.mixedness) ? sample.mixedness : 0,
            complexity: Number.isFinite(sample.complexity) ? sample.complexity : 0,
            kinetic: Number.isFinite(sample.kinetic) ? sample.kinetic : 0,
        };

        const scaled = {
            entropy: amplify(sanitized.entropy, 1.15, 0.9),
            mixedness: amplify(sanitized.mixedness, 1.15, 0.9),
            complexity: amplify(sanitized.complexity, 2.2, 0.85),
            kinetic: amplify(sanitized.kinetic, 3.2, 0.7),
        };

        setMetrics(scaled);
        setHistory((prev) => [...prev.slice(-HISTORY_LENGTH + 1), scaled]);
    }, []);

    const handleReset = () => {
        viewerRef.current?.reset();
        setMetrics(DEFAULT_METRICS);
        setHistory([]);
    };

    const handleStirOnce = () => {
        viewerRef.current?.stirOnce();
    };

    const handleAddCream = () => {
        viewerRef.current?.addCream();
    };

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
        },
        {
            id: 'canvas',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer>
                    <div className="relative w-full h-full">
                        <Viewer
                            ref={viewerRef}
                            params={params}
                            onMetricsUpdate={handleMetricsUpdate}
                        />
                        <MetricsOverlay metrics={metrics} history={history} />
                    </div>
                </PlaygroundViewer>
            ),
        },
        {
            id: 'outro',
            type: 'outro' as const,
            content: (
                <>
                    <p className="text-gray-300">
                        Sean M. Carroll uses coffee and cream mixing as a metaphor for entropy in the universe. The
                        unmixed state is ordered and simple. Stirring drives the system toward many possible
                        microstates, raising entropy while the visible complexity of swirls rises and then fades.
                    </p>
                    <p className="text-gray-300">
                        We approximate the system by binning cream concentration <Equation math="c" /> into voxels.
                        Mixedness captures how close each voxel is to a 50/50 mix, and entropy follows the classic
                        binary form.
                    </p>
                    <Equation
                        mode="block"
                        math="H(c) = -\left[c \log_2 c + (1-c) \log_2 (1-c)\right]"
                    />
                    <Equation
                        mode="block"
                        math="\text{mixedness} = 1 - |2c - 1|"
                    />
                    <p className="text-gray-300">
                        Complexity tracks structure by combining mixedness with the local concentration gradient.
                        It peaks during filament formation, then drops as the mixture becomes uniform.
                    </p>
                    <Equation
                        mode="block"
                        math="\text{complexity} \propto \overline{|\nabla c|} \times \text{mixedness}"
                    />
                    <p className="text-gray-300">
                        Entropy keeps increasing even as visible structure disappears: the high-entropy end state is
                        visually simple. Life and local order can still exist because Earth is not a closed system; it
                        exports entropy to its surroundings.
                    </p>
                </>
            ),
        },
    ];

    const settings = (
        <PlaygroundSettings
            sections={[
                {
                    content: (
                        <Settings
                            params={params}
                            metrics={metrics}
                            onParamsChange={setParams}
                            onReset={handleReset}
                            onStirOnce={handleStirOnce}
                            onAddCream={handleAddCream}
                        />
                    ),
                },
            ]}
        />
    );

    return (
        <PlaygroundLayout
            title="entropy cafe"
            subtitle="a WebGPU fluid simulation of mixing, entropy, and complexity"
            description={(
                <>
                    Based on{' '}
                    <a href="https://www.youtube.com/watch?v=SWP2ktac34k" target="_blank" rel="noopener noreferrer" className="underline">
                        Sean M. Carroll&apos;s coffee mixing metaphor
                    </a>
                    {' '}for the second law of thermodynamics.
                </>
            )}
            sections={sections}
            settings={settings}
        />
    );
}
