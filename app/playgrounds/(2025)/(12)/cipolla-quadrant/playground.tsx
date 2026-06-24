'use client';

import { useRef } from 'react';
import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import VersionSelector from '@/components/VersionSelector';
import CalibrationPanel from '@/components/CalibrationPanel';
import AssumptionPanel from '@/components/AssumptionPanel';
import ModelChangelog from '@/components/ModelChangelog';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import Equation from '@/components/Equation';
import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';

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
    const calibration = buildCalibration();

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
                <PlaygroundViewer>
                    <Viewer ref={viewerRef} />
                </PlaygroundViewer>
            ),
        },
        {
            id: 'outro',
            type: 'outro',
            content: (
                <div className="space-y-8 text-gray-300">
                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Cipolla&apos;s basic laws</h3>
                        <p className="leading-relaxed text-sm">
                            Carlo M. Cipolla&apos;s framework classifies human actions on a two-dimensional plane where{' '}
                            <Equation math="x" /> is benefit to oneself and <Equation math="y" /> is benefit to others.
                            The four quadrants define behavioural types:{' '}
                            <strong className="text-lime-300">intelligent</strong> (benefits self and others),{' '}
                            <strong className="text-lime-300">helpless or naive</strong> (harms self, benefits others),{' '}
                            <strong className="text-lime-300">stupid</strong> (harms both self and others), and{' '}
                            <strong className="text-lime-300">bandit</strong> (benefits self by harming others). The
                            golden third law defines stupidity behaviourally: an action that causes losses to others while
                            yielding no gain to the actor.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The net welfare boundary</h3>
                        <p className="leading-relaxed text-sm">
                            The diagonal line <Equation math="x + y = 0" /> (the P-O-M line) divides the plane by net
                            welfare. Points to the upper right add to total welfare; points to the lower left reduce it.
                            This refines the categories: a helpless person with <Equation math="y > |x|" /> is
                            net-positive despite self-harm, while one with <Equation math="y < |x|" /> is half-stupid,
                            since their contribution does not compensate for their losses. Bandits split the same way,
                            into net-positive (pure redistribution) and net-negative (destructive) variants.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Two layers, one falsifiable</h3>
                        <p className="leading-relaxed text-sm">
                            The deterministic classifier (which quadrant a point lands in) directly encodes Cipolla&apos;s
                            definitions and is what the calibration panel tests. The stochastic country model, which maps
                            macro indicators to a population cloud through latent factors and a softmax mixture, is a
                            pedagogical scaffold with hand-chosen coefficients and no ground-truth data, so it is left
                            untested by design.
                        </p>
                    </div>

                    <div>
                        <VersionSelector versions={versions} active="claude-v1" />
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Calibration</h3>
                        <CalibrationPanel results={calibration} outputLabel="quadrant match" />
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Assumptions</h3>
                        <AssumptionPanel assumptions={assumptions} />
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Model changelog</h3>
                        <ModelChangelog entries={changelog} />
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
            researchUrl="/playgrounds/cipolla-quadrant/research"
        />
    );
}
