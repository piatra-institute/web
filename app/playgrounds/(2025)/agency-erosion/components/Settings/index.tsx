'use client';

import Button from '@/components/Button';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import SliderInput from '@/components/SliderInput';
import Toggle from '@/components/Toggle';



interface SettingsProps {
    numAgents: number;
    setNumAgents: (v: number) => void;
    steps: number;
    setSteps: (v: number) => void;
    m: number;
    setM: (v: number) => void;
    lambdaRefine: number;
    setLambdaRefine: (v: number) => void;
    thetaRef: number;
    setThetaRef: (v: number) => void;
    fragDecay: number;
    setFragDecay: (v: number) => void;
    alphaCoalition: number;
    setAlphaCoalition: (v: number) => void;
    Cstar: number;
    setCstar: (v: number) => void;
    dFactor: number;
    setDFactor: (v: number) => void;
    infoGain: number;
    setInfoGain: (v: number) => void;
    baseD: number;
    setBaseD: (v: number) => void;
    w1: number;
    setW1: (v: number) => void;
    w2: number;
    setW2: (v: number) => void;
    w3: number;
    setW3: (v: number) => void;
    w4: number;
    setW4: (v: number) => void;
    w5: number;
    setW5: (v: number) => void;
    thetaCMS: number;
    setThetaCMS: (v: number) => void;
    shockMode: boolean;
    setShockMode: (v: boolean) => void;
    onReset: () => void;
    onExport: () => void;
}

export default function Settings(props: SettingsProps) {
    const {
        numAgents, setNumAgents, steps, setSteps,
        m, setM, lambdaRefine, setLambdaRefine,
        thetaRef, setThetaRef, fragDecay, setFragDecay,
        alphaCoalition, setAlphaCoalition, Cstar, setCstar,
        dFactor, setDFactor, infoGain, setInfoGain,
        baseD, setBaseD, w1, setW1, w2, setW2, w3, setW3,
        w4, setW4, w5, setW5, thetaCMS, setThetaCMS,
        shockMode, setShockMode, onReset, onExport
    } = props;

    return (
        <PlaygroundSettings
            sections={[
                {
                    title: 'Simulation Parameters',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="Number of Agents"
                                value={numAgents}
                                onChange={setNumAgents}
                                min={50}
                                max={1000}
                                step={50}
                            />
                            <SliderInput
                                label="Simulation Steps"
                                value={steps}
                                onChange={setSteps}
                                min={20}
                                max={500}
                                step={10}
                            />
                            <div>
                                <label className="text-sm font-medium text-white mb-2 block">
                                    Periodic Shocks
                                </label>
                                <Toggle
                                    text={shockMode ? 'Enabled' : 'Disabled'}
                                    value={shockMode}
                                    toggle={() => setShockMode(!shockMode)}
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Introduces periodic salience and opportunity spikes
                                </p>
                            </div>
                        </div>
                    )
                },
                {
                    title: 'Identity Dynamics',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="Amplification (m)"
                                value={m}
                                onChange={setM}
                                min={0.2}
                                max={4}
                                step={0.1}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Platform multiplier on signaling returns
                            </p>

                            <SliderInput
                                label="λ Refinement"
                                value={lambdaRefine}
                                onChange={setLambdaRefine}
                                min={0}
                                max={0.3}
                                step={0.01}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Rate of identity fragmentation growth
                            </p>

                            <SliderInput
                                label="θ Refinement"
                                value={thetaRef}
                                onChange={setThetaRef}
                                min={0.1}
                                max={1.5}
                                step={0.05}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                S/A threshold triggering fragmentation
                            </p>

                            <SliderInput
                                label="Fragmentation Decay"
                                value={fragDecay}
                                onChange={setFragDecay}
                                min={0}
                                max={0.2}
                                step={0.01}
                            />
                            <p className="text-xs text-gray-400 -mt-2">
                                Natural cohesion recovery rate
                            </p>
                        </div>
                    )
                },
                {
                    title: 'Coalition & Outcomes',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="α Coalition"
                                value={alphaCoalition}
                                onChange={setAlphaCoalition}
                                min={0.5}
                                max={6}
                                step={0.1}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Agency to coalition effectiveness mapping
                            </p>

                            <SliderInput
                                label="C* (Coalition Threshold)"
                                value={Cstar}
                                onChange={setCstar}
                                min={0.05}
                                max={0.6}
                                step={0.01}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Minimum coalition size for success
                            </p>

                            <SliderInput
                                label="Distortion Factor"
                                value={dFactor}
                                onChange={setDFactor}
                                min={0}
                                max={0.3}
                                step={0.01}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                S/A ratio impact on information quality
                            </p>

                            <SliderInput
                                label="Information Gain"
                                value={infoGain}
                                onChange={setInfoGain}
                                min={0}
                                max={0.3}
                                step={0.01}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Opportunity&apos;s clarifying effect
                            </p>

                            <SliderInput
                                label="Base Distortion"
                                value={baseD}
                                onChange={setBaseD}
                                min={0}
                                max={0.6}
                                step={0.01}
                            />
                            <p className="text-xs text-gray-400 -mt-2">
                                Baseline information noise
                            </p>
                        </div>
                    )
                },
                {
                    title: 'CMS Weights',
                    content: (
                        <div className="space-y-4">
                            <p className="text-xs text-gray-400 mb-2">
                                Composite Mobilization Score = w1·ΔA + w2·ΔC + w3·ΔX - w4·ΔH - w5·ΔD
                            </p>

                            <SliderInput
                                label="w1 (ΔAgency)"
                                value={w1}
                                onChange={setW1}
                                min={0}
                                max={2}
                                step={0.1}
                            />

                            <SliderInput
                                label="w2 (ΔCoalition)"
                                value={w2}
                                onChange={setW2}
                                min={0}
                                max={2}
                                step={0.1}
                            />

                            <SliderInput
                                label="w3 (ΔOutcome)"
                                value={w3}
                                onChange={setW3}
                                min={0}
                                max={2}
                                step={0.1}
                            />

                            <SliderInput
                                label="w4 (ΔFragmentation)"
                                value={w4}
                                onChange={setW4}
                                min={0}
                                max={2}
                                step={0.1}
                            />

                            <SliderInput
                                label="w5 (ΔDistortion)"
                                value={w5}
                                onChange={setW5}
                                min={0}
                                max={2}
                                step={0.1}
                            />

                            <SliderInput
                                label="θ CMS (Phase Threshold)"
                                value={thetaCMS}
                                onChange={setThetaCMS}
                                min={-1}
                                max={1}
                                step={0.05}
                            />
                            <p className="text-xs text-gray-400 -mt-2">
                                {"CMS ≥ θ → Emancipatory; CMS < θ → Anesthetic"}
                            </p>
                        </div>
                    )
                },
                {
                    title: 'Actions',
                    content: (
                        <div className="space-y-3">
                            <Button
                                label="Reset to Defaults"
                                onClick={onReset}
                                className="w-full"
                                size="sm"
                            />
                            <Button
                                label="Export Data"
                                onClick={onExport}
                                className="w-full"
                                size="sm"
                            />
                        </div>
                    )
                }
            ]}
        />
    );
}
