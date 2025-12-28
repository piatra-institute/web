'use client';

import { useRef } from 'react';
import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import Equation from '@/components/Equation';

export interface ViewerRef {
    updateSimulation: (params: SimulationParams) => void;
    generate: () => void;
    reset: () => void;
}

export interface SimulationParams {
    preset: string;
    gdpPcUSD: number;
    gini: number;
    unemploymentPct: number;
    cpi: number;
    trustPct: number;
    orphanPct: number;
    educationIndex: number;
    sensitivity: number;
    seed: number;
    nAgents: number;
    showGrid: boolean;
    showNetBoundary: boolean;
    shadeNetPositive: boolean;
    showQuadrantLabels: boolean;
    colorMode: 'quadrant' | 'net' | 'component';
}

export default function Playground() {
    const viewerRef = useRef<ViewerRef>(null);

    const handleParamsChange = (params: SimulationParams) => {
        viewerRef.current?.updateSimulation(params);
    };

    const handleReset = () => {
        viewerRef.current?.reset();
    };

    const handleGenerate = () => {
        viewerRef.current?.generate();
    };

    const sections: PlaygroundSection[] = [
        {
            id: 'intro',
            type: 'intro',
        },
        {
            id: 'canvas',
            type: 'canvas',
            content: (
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                    <Viewer ref={viewerRef} />
                </div>
            ),
        },
        {
            id: 'outro',
            type: 'outro',
            content: (
                <div className="space-y-6">
                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Cipolla&apos;s Basic Laws</h4>
                        <p className="text-gray-300">
                            Carlo M. Cipolla&apos;s framework classifies human actions on a two-dimensional plane where{' '}
                            <Equation math="x" /> represents benefit to oneself and <Equation math="y" /> represents
                            benefit to others/society. The four quadrants define behavioral archetypes:
                            <strong className="text-blue-400"> Intelligent</strong> (benefits self and others),{' '}
                            <strong className="text-amber-400">Helpless/Naïve</strong> (harms self, benefits others),{' '}
                            <strong className="text-red-400">Stupid</strong> (harms both self and others), and{' '}
                            <strong className="text-purple-400">Bandit</strong> (benefits self by harming others).
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">The Net Welfare Boundary</h4>
                        <p className="text-gray-300">
                            The diagonal line <Equation math="x + y = 0" /> (the P-O-M line) divides the plane by{' '}
                            <em>net welfare</em>. Points to the right add to total societal welfare; points to the left
                            reduce it. This refines Cipolla&apos;s categories: a Helpless person with{' '}
                            <Equation math="y > |x|" /> is net-positive despite self-harm, while one with{' '}
                            <Equation math="y < |x|" /> is &quot;semi-stupid&quot;—their contribution doesn&apos;t
                            compensate for their losses. Similarly, Bandits split into net-positive (efficient
                            extraction) and net-negative (destructive) variants.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Country-to-Quadrant Mapping</h4>
                        <p className="text-gray-300">
                            The toy structural model maps macro indicators to quadrant distributions via latent factors:{' '}
                            <em>prosperity</em> (GDP, education, employment), <em>institutions</em> (corruption
                            perceptions, social trust), <em>inequality</em> (Gini), and <em>stress</em> (unemployment,
                            orphans, educational gaps). These factors drive mixture weights through softmax over
                            directional logits, producing population distributions that shift with socioeconomic
                            conditions. The model is pedagogical—coefficients are interpretable but not empirically
                            calibrated.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Sampling and Visualization</h4>
                        <p className="text-gray-300">
                            Each simulated agent is drawn from a four-component bivariate normal mixture, with means
                            positioned in respective quadrants and variance/correlation reflecting institutional quality
                            and stress levels. The sensitivity parameter controls how extreme the quadrant shares
                            become. Points can be colored by quadrant membership, net welfare sign, or generating
                            component. Drag points to explore how individual shifts affect population statistics and
                            the balance between net-positive and net-negative actors.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Methodological Notes</h4>
                        <p className="text-gray-300">
                            This is a <em>structural toy model</em>, not an empirically validated simulation. Real
                            calibration would require: (1) a measurement model linking observable proxies to Cipolla
                            coordinates, (2) hierarchical regression fitting macro→distribution relationships from
                            cross-country data, and (3) validation through out-of-sample prediction. The current
                            implementation makes directional assumptions explicit (e.g., better institutions →
                            more Intelligent, higher stress → more Stupid/Helpless) as a scaffold for later
                            empirical work.
                        </p>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="Cipolla quadrant"
            subtitle="exploring stupidity, intelligence, helplessness, and banditry"
            description="Carlo M. Cipolla's 'The Basic Laws of Human Stupidity' (1976)"
            sections={sections}
            settings={<Settings onParamsChange={handleParamsChange} onReset={handleReset} onGenerate={handleGenerate} />}
        />
    );
}
