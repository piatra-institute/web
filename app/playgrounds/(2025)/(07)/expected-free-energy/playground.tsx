'use client';

import { useState, useRef, useCallback } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import VersionSelector from '@/components/VersionSelector';
import CalibrationPanel from '@/components/CalibrationPanel';
import AssumptionPanel from '@/components/AssumptionPanel';
import ModelChangelog from '@/components/ModelChangelog';
import Viewer from './components/Viewer';
import Settings from './components/Settings';
import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';



export default function Playground() {
    const [horizon, setHorizon] = useState(50);
    const [samples, setSamples] = useState(100);
    const [riskWeight, setRiskWeight] = useState(1.0);
    const [boundaryWidth, setBoundaryWidth] = useState(0.5);
    const [stateNoise, setStateNoise] = useState(0.1);
    const [observationNoise, setObservationNoise] = useState(0.1);
    const [goalState, setGoalState] = useState(0.0);

    const viewerRef = useRef<{ exportCanvas: () => void }>(null);
    const calibration = buildCalibration();

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
                        Monte Carlo Exploration of Active Inference
                    </p>
                    <p className="text-gray-400">
                        Explore how Expected Free Energy (EFE) is estimated via Monte Carlo sampling,
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
                <div className="space-y-8 text-gray-300">
                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Balancing exploration and exploitation</h3>
                        <p className="leading-relaxed text-sm">
                            This visualization demonstrates how agents under the free energy principle balance
                            exploration and exploitation. The expected free energy combines risk (divergence from
                            preferred outcomes) and ambiguity (uncertainty about observations).
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Risk term (pragmatic value)</h3>
                        <p className="leading-relaxed text-sm">
                            Measures how far observations deviate from the agent&apos;s preferences, weighted by the
                            risk weight lambda. Higher lambda values make the agent more goal-directed.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Ambiguity term (epistemic value)</h3>
                        <p className="leading-relaxed text-sm">
                            Quantifies uncertainty in observations given states. The agent seeks to minimize ambiguity
                            by preferring informative, predictable trajectories.
                        </p>
                    </div>
                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <p className="text-lime-200/80 mb-2">
                            The visualization compares EFE with KL divergence, showing how active inference adds an
                            information-seeking term that pure divergence measures lack.
                        </p>
                    </div>

                    <VersionSelector versions={versions} active="claude-v1" />

                    <CalibrationPanel results={calibration} outputLabel="information measure (nats)" />

                    <AssumptionPanel assumptions={assumptions} />

                    <ModelChangelog entries={changelog} />
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
            researchUrl="/playgrounds/expected-free-energy/research"
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
