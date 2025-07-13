'use client';

import { useState, useRef, useCallback } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Viewer from './components/Viewer';
import Settings from './components/Settings';



export default function Playground() {
    const [horizon, setHorizon] = useState(50);
    const [samples, setSamples] = useState(100);
    const [riskWeight, setRiskWeight] = useState(1.0);
    const [boundaryWidth, setBoundaryWidth] = useState(0.5);
    const [stateNoise, setStateNoise] = useState(0.1);
    const [observationNoise, setObservationNoise] = useState(0.1);
    const [goalState, setGoalState] = useState(0.0);

    const viewerRef = useRef<{ exportCanvas: () => void }>(null);

    const handleReset = useCallback(() => {
        setHorizon(50);
        setSamples(100);
        setRiskWeight(1.0);
        setBoundaryWidth(0.5);
        setStateNoise(0.1);
        setObservationNoise(0.1);
        setGoalState(0.0);
    }, []);

    const handleExport = useCallback(() => {
        viewerRef.current?.exportCanvas();
    }, []);

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
            content: (
                <div className="mt-12">
                    <p className="text-xl text-gray-300 mb-4">
                        Monte-Carlo Exploration of Active Inference
                    </p>
                    <p className="text-gray-400">
                        Explore how Expected Free Energy (EFE) is estimated via Monte-Carlo sampling,
                        visualizing the balance between goal-seeking behavior and uncertainty reduction.
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
                        horizon={horizon}
                        samples={samples}
                        riskWeight={riskWeight}
                        boundaryWidth={boundaryWidth}
                        stateNoise={stateNoise}
                        observationNoise={observationNoise}
                        goalState={goalState}
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
                        This visualization demonstrates how agents under the free energy principle balance
                        exploration and exploitation. The <strong className="font-semibold text-lime-400">Expected Free Energy</strong> combines
                        risk (divergence from preferred outcomes) and ambiguity (uncertainty about observations).
                    </p>
                    <p>
                        <strong className="font-semibold text-lime-400">Risk Term:</strong> Measures how far observations
                        deviate from the agent&apos;s preferences, weighted by λ (risk weight). Higher λ values make the
                        agent more goal-directed.
                    </p>
                    <p>
                        <strong className="font-semibold text-lime-400">Ambiguity Term:</strong> Quantifies uncertainty
                        in observations given states. The agent seeks to minimize ambiguity by preferring predictable
                        trajectories.
                    </p>
                    <p>
                        The visualization compares EFE with KL divergence, showing how active inference differs from
                        pure information-theoretic measures in guiding adaptive behavior.
                    </p>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="Expected Free Energy"
            subtitle="Monte Carlo visualization of active inference"
            description={
                <a
                    href="https://doi.org/10.1080/17588928.2015.1020053"
                    target="_blank"
                >
                    2015, Karl Friston et al., Active Inference and Epistemic Value
                </a>
            }
            sections={sections}
            settings={
                <Settings
                    horizon={horizon}
                    samples={samples}
                    riskWeight={riskWeight}
                    boundaryWidth={boundaryWidth}
                    stateNoise={stateNoise}
                    observationNoise={observationNoise}
                    goalState={goalState}
                    onHorizonChange={setHorizon}
                    onSamplesChange={setSamples}
                    onRiskWeightChange={setRiskWeight}
                    onBoundaryWidthChange={setBoundaryWidth}
                    onStateNoiseChange={setStateNoise}
                    onObservationNoiseChange={setObservationNoise}
                    onGoalStateChange={setGoalState}
                    onReset={handleReset}
                    onExport={handleExport}
                />
            }
        />
    );
}