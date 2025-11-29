'use client';

import { useState, useRef, useCallback } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Viewer from './components/Viewer';
import Settings from './components/Settings';



export default function Playground() {
    const [sigma, setSigma] = useState(0.63);
    const [refreshKey, setRefreshKey] = useState(0);

    const viewerRef = useRef<{ exportCanvas: () => void }>(null);

    const handleReset = useCallback(() => {
        setSigma(1.0);
        setRefreshKey(prev => prev + 1);
    }, []);

    const handleExport = useCallback(() => {
        viewerRef.current?.exportCanvas();
    }, []);

    const handleRefresh = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
            content: (
                <div className="mt-12">
                    <p className="text-xl text-gray-300 mb-4">
                        Exploring Branching Criticality
                    </p>
                    <p className="text-gray-400">
                        Visualize avalanche dynamics and power-law distributions at the edge of criticality.
                        Discover how the d² metric quantifies distance from the critical regime.
                    </p>
                </div>
            ),
        },
        {
            id: 'canvas',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer>
                    <Viewer
                        ref={viewerRef}
                        sigma={sigma}
                        refreshKey={refreshKey}
                    />
                </PlaygroundViewer>
            ),
        },
        {
            id: 'about',
            type: 'outro' as const,
            content: (
                <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                    <p>
                        <strong className="font-semibold text-lime-400">The d² Metric:</strong> A dimensionless,
                        scalar &ldquo;distance-to-criticality&rdquo; measure derived from temporal renormalization-group (tRG)
                        analysis. At perfect criticality, d² = 0; it grows smoothly in sub- and super-critical regimes.
                    </p>
                    <p>
                        <strong className="font-semibold text-lime-400">Computation:</strong> The metric is computed by
                        estimating the moment-to-moment branching ratio Λ(t), applying multi-scale tRG coarse-graining,
                        and calculating d² = Σₛ [Λₛ - 1]² across timescale shells.
                    </p>
                    <p>
                        <strong className="font-semibold text-lime-400">Practical Values:</strong> Awake quiet cortex
                        shows d² ≈ 0-0.05 (near-critical), movement/deep NREM ≈ 0.1-0.2 (mild deviation), while
                        anesthesia/seizures show d² {'>'} 0.25 (far from critical).
                    </p>
                    <p>
                        This playground simulates branching processes with parameter σ (branching probability).
                        When σ = 1, the system is at criticality, producing power-law distributed avalanches.
                    </p>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="Criticality"
            subtitle="branching processes and distance-to-criticality metrics"
            description={
                <a
                    href="https://doi.org/10.1016/j.neuron.2025.05.020"
                    target="_blank"
                    className="underline"
                >
                    2025, Keith B. Hengen, Woodrow L. Shew, Is criticality a unified setpoint of brain function
                </a>
            }
            sections={sections}
            settings={
                <Settings
                    sigma={sigma}
                    onSigmaChange={setSigma}
                    onReset={handleReset}
                    onExport={handleExport}
                    onRefresh={handleRefresh}
                />
            }
        />
    );
}
