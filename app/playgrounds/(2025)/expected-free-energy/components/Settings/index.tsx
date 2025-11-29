'use client';

import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';
import PlaygroundSettings from '@/components/PlaygroundSettings';



interface SettingsProps {
    horizon: number;
    samples: number;
    riskWeight: number;
    boundaryWidth: number;
    stateNoise: number;
    observationNoise: number;
    goalState: number;
    onHorizonChange: (value: number) => void;
    onSamplesChange: (value: number) => void;
    onRiskWeightChange: (value: number) => void;
    onBoundaryWidthChange: (value: number) => void;
    onStateNoiseChange: (value: number) => void;
    onObservationNoiseChange: (value: number) => void;
    onGoalStateChange: (value: number) => void;
    onReset: () => void;
    onExport: () => void;
}

export default function Settings({
    horizon,
    samples,
    riskWeight,
    boundaryWidth,
    stateNoise,
    observationNoise,
    goalState,
    onHorizonChange,
    onSamplesChange,
    onRiskWeightChange,
    onBoundaryWidthChange,
    onStateNoiseChange,
    onObservationNoiseChange,
    onGoalStateChange,
    onReset,
    onExport,
}: SettingsProps) {
    return (
        <>
            <PlaygroundSettings
                sections={[
                    {
                        title: 'Simulation Parameters',
                        content: (
                            <>
                                <SliderInput
                                    label="Horizon (T)"
                                    value={horizon}
                                    onChange={onHorizonChange}
                                    min={1}
                                    max={200}
                                    step={1}
                                />
                                <div className="text-xs text-gray-400 mt-1 mb-4">
                                    Number of time-steps per trajectory
                                </div>
                                <SliderInput
                                    label="Samples (N)"
                                    value={samples}
                                    onChange={onSamplesChange}
                                    min={1}
                                    max={1000}
                                    step={1}
                                />
                                <div className="text-xs text-gray-400 mt-1">
                                    Number of trajectories in the Monte-Carlo batch
                                </div>
                            </>
                        ),
                    },
                    {
                        title: 'Model Parameters',
                        content: (
                            <>
                                <SliderInput
                                    label="Risk Weight (λ)"
                                    value={riskWeight}
                                    onChange={onRiskWeightChange}
                                    min={0.1}
                                    max={5}
                                    step={0.1}
                                    showDecimals={true}
                                />
                                <div className="text-xs text-gray-400 mt-1 mb-4">
                                    Salience of goal divergence
                                </div>
                                <SliderInput
                                    label="Boundary Width"
                                    value={boundaryWidth}
                                    onChange={onBoundaryWidthChange}
                                    min={0.1}
                                    max={2.0}
                                    step={0.1}
                                    showDecimals={true}
                                />
                                <div className="text-xs text-gray-400 mt-1">
                                    Width of the preferred goal region
                                </div>
                            </>
                        ),
                    },
                    {
                        title: 'Noise & Target Parameters',
                        content: (
                            <>
                                <SliderInput
                                    label="State Noise (σ)"
                                    value={stateNoise}
                                    onChange={onStateNoiseChange}
                                    min={0.01}
                                    max={0.5}
                                    step={0.01}
                                    showDecimals={true}
                                />
                                <div className="text-xs text-gray-400 mt-1 mb-4">
                                    Standard deviation of state transitions
                                </div>
                                <SliderInput
                                    label="Observation Noise"
                                    value={observationNoise}
                                    onChange={onObservationNoiseChange}
                                    min={0.01}
                                    max={0.5}
                                    step={0.01}
                                    showDecimals={true}
                                />
                                <div className="text-xs text-gray-400 mt-1 mb-4">
                                    Standard deviation of observations
                                </div>
                                <SliderInput
                                    label="Goal State (μ*)"
                                    value={goalState}
                                    onChange={onGoalStateChange}
                                    min={-2.0}
                                    max={2.0}
                                    step={0.1}
                                    showDecimals={true}
                                />
                                <div className="text-xs text-gray-400 mt-1">
                                    Target state value
                                </div>
                            </>
                        ),
                    },
                    {
                        title: 'Formulas',
                        content: (
                            <div className="space-y-3 text-xs text-gray-400">
                                <div>
                                    <div className="text-white font-semibold mb-1">Hidden-state dynamics</div>
                                    <div className="font-mono">s_{'{'}t+1{'}'} = s_{'{'}t{'}'} + ε_{'{'}t{'}'}, ε ~ N(0, 0.1²)</div>
                                </div>
                                <div>
                                    <div className="text-white font-semibold mb-1">Observation model</div>
                                    <div className="font-mono">o_{'{'}t{'}'} = s_{'{'}t{'}'} + η_{'{'}t{'}'}, η ~ N(0, 0.1²)</div>
                                </div>
                                <div>
                                    <div className="text-white font-semibold mb-1">Risk Term</div>
                                    <div className="font-mono">risk = λ Σ(o_{'{'}t{'}'} - μ*)², μ*=0</div>
                                </div>
                                <div>
                                    <div className="text-white font-semibold mb-1">Expected Free Energy</div>
                                    <div className="font-mono">EFE = risk + ambiguity</div>
                                </div>
                            </div>
                        ),
                    },
                    {
                        title: 'Actions',
                        content: (
                            <div className="space-y-3">
                                <Button
                                    label="Reset"
                                    onClick={onReset}
                                    className="w-full"
                                    size="sm"
                                />
                                <Button
                                    label="Export Chart"
                                    onClick={onExport}
                                    className="w-full"
                                    size="sm"
                                />
                            </div>
                        ),
                    },
                ]}
            />
        </>
    );
}
