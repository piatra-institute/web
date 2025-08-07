'use client';

import Button from '@/components/Button';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import SliderInput from '@/components/SliderInput';

interface SettingsProps {
    // Population & horizon
    N: number;
    setN: (value: number) => void;
    T: number;
    setT: (value: number) => void;
    
    // Preference distribution
    muTheta: number;
    setMuTheta: (value: number) => void;
    sdTheta: number;
    setSdTheta: (value: number) => void;
    
    // Choice precision & noise
    lambda: number;
    setLambda: (value: number) => void;
    sigmaEps: number;
    setSigmaEps: (value: number) => void;
    
    // Payoff weights
    a: number;
    setA: (value: number) => void;
    b: number;
    setB: (value: number) => void;
    c: number;
    setC: (value: number) => void;
    d: number;
    setD: (value: number) => void;
    kappa: number;
    setKappa: (value: number) => void;
    
    // Policy levels
    g: number;
    setG: (value: number) => void;
    r: number;
    setR: (value: number) => void;
    p: number;
    setP: (value: number) => void;
    k: number;
    setK: (value: number) => void;
    
    // State transitions
    rho: number;
    setRho: (value: number) => void;
    eta: number;
    setEta: (value: number) => void;
    phi: number;
    setPhi: (value: number) => void;
    psi: number;
    setPsi: (value: number) => void;
    
    // Initial states
    F0: number;
    setF0: (value: number) => void;
    Order0: number;
    setOrder0: (value: number) => void;
    
    // Animation
    speedMs: number;
    setSpeedMs: (value: number) => void;
    
    onReset: () => void;
    onExport: () => void;
}

export default function Settings(props: SettingsProps) {
    return (
        <PlaygroundSettings
            sections={[
                {
                    title: 'Simulation Parameters',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="Number of Agents"
                                value={props.N}
                                onChange={props.setN}
                                min={100}
                                max={10000}
                                step={100}
                            />
                            <SliderInput
                                label="Time Steps"
                                value={props.T}
                                onChange={props.setT}
                                min={10}
                                max={500}
                                step={10}
                            />
                            <SliderInput
                                label="Animation Speed (ms)"
                                value={props.speedMs}
                                onChange={props.setSpeedMs}
                                min={10}
                                max={200}
                                step={10}
                            />
                        </div>
                    )
                },
                {
                    title: 'Preference Distribution',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="μ_θ (Mean Preference)"
                                value={props.muTheta}
                                onChange={props.setMuTheta}
                                min={-2}
                                max={2}
                                step={0.1}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Mean of paternal preference distribution
                            </p>
                            
                            <SliderInput
                                label="σ_θ (Preference Spread)"
                                value={props.sdTheta}
                                onChange={props.setSdTheta}
                                min={0.1}
                                max={3}
                                step={0.1}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Standard deviation of preference heterogeneity
                            </p>
                            
                            <SliderInput
                                label="λ (Choice Precision)"
                                value={props.lambda}
                                onChange={props.setLambda}
                                min={0.1}
                                max={5}
                                step={0.1}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Higher λ → sharper response to payoff differences
                            </p>
                            
                            <SliderInput
                                label="σ_ε (Idiosyncratic Noise)"
                                value={props.sigmaEps}
                                onChange={props.setSigmaEps}
                                min={0}
                                max={2}
                                step={0.1}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2">
                                Random shock scale in utility
                            </p>
                        </div>
                    )
                },
                {
                    title: 'Payoff Weights',
                    content: (
                        <div className="space-y-4">
                            <p className="text-xs text-gray-400 mb-2">
                                ΔU = a·g − d·r + b·Order + c·θ·F − κ·k + ε
                            </p>
                            
                            <SliderInput
                                label="a (Transfers Weight)"
                                value={props.a}
                                onChange={props.setA}
                                min={0}
                                max={2}
                                step={0.1}
                                showDecimals={true}
                            />
                            
                            <SliderInput
                                label="b (Order Benefit)"
                                value={props.b}
                                onChange={props.setB}
                                min={0}
                                max={2}
                                step={0.1}
                                showDecimals={true}
                            />
                            
                            <SliderInput
                                label="c (Paternal Channel)"
                                value={props.c}
                                onChange={props.setC}
                                min={0}
                                max={2}
                                step={0.1}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Weight on θ·F interaction
                            </p>
                            
                            <SliderInput
                                label="d (Repression Cost)"
                                value={props.d}
                                onChange={props.setD}
                                min={0}
                                max={2}
                                step={0.1}
                                showDecimals={true}
                            />
                            
                            <SliderInput
                                label="κ (Opposition Cost)"
                                value={props.kappa}
                                onChange={props.setKappa}
                                min={0}
                                max={2}
                                step={0.1}
                                showDecimals={true}
                            />
                        </div>
                    )
                },
                {
                    title: 'Policy Levels',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="g (Transfer Level)"
                                value={props.g}
                                onChange={props.setG}
                                min={0}
                                max={2}
                                step={0.1}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Material benefits to citizens
                            </p>
                            
                            <SliderInput
                                label="r (Repression Level)"
                                value={props.r}
                                onChange={props.setR}
                                min={0}
                                max={2}
                                step={0.1}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Direct cost but builds Order
                            </p>
                            
                            <SliderInput
                                label="p (Propaganda Effort)"
                                value={props.p}
                                onChange={props.setP}
                                min={0}
                                max={2}
                                step={0.1}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Builds paternal signaling F
                            </p>
                            
                            <SliderInput
                                label="k (Opposition Baseline)"
                                value={props.k}
                                onChange={props.setK}
                                min={0}
                                max={2}
                                step={0.1}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2">
                                Expected cost of opposing regime
                            </p>
                        </div>
                    )
                },
                {
                    title: 'State Dynamics',
                    content: (
                        <div className="space-y-4">
                            <p className="text-xs text-gray-400 mb-2">
                                F[t+1] = ρ·F[t] + η·p<br/>
                                Order[t+1] = φ·Order[t] + ψ·r
                            </p>
                            
                            <SliderInput
                                label="ρ (F Persistence)"
                                value={props.rho}
                                onChange={props.setRho}
                                min={0}
                                max={1}
                                step={0.05}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Paternal signal decay rate
                            </p>
                            
                            <SliderInput
                                label="η (Propaganda → F)"
                                value={props.eta}
                                onChange={props.setEta}
                                min={0}
                                max={1}
                                step={0.05}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Propaganda effectiveness
                            </p>
                            
                            <SliderInput
                                label="φ (Order Persistence)"
                                value={props.phi}
                                onChange={props.setPhi}
                                min={0}
                                max={1}
                                step={0.05}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Order stability over time
                            </p>
                            
                            <SliderInput
                                label="ψ (Repression → Order)"
                                value={props.psi}
                                onChange={props.setPsi}
                                min={0}
                                max={1}
                                step={0.05}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2">
                                Repression&apos;s order-building effect
                            </p>
                        </div>
                    )
                },
                {
                    title: 'Initial Conditions',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="F₀ (Initial Paternal Signal)"
                                value={props.F0}
                                onChange={props.setF0}
                                min={0}
                                max={1}
                                step={0.05}
                                showDecimals={true}
                            />
                            
                            <SliderInput
                                label="Order₀ (Initial Order)"
                                value={props.Order0}
                                onChange={props.setOrder0}
                                min={0}
                                max={1}
                                step={0.05}
                                showDecimals={true}
                            />
                        </div>
                    )
                },
                {
                    title: 'Actions',
                    content: (
                        <div className="space-y-3">
                            <Button
                                label="Reset to Defaults"
                                onClick={props.onReset}
                                className="w-full"
                                size="sm"
                            />
                            <Button
                                label="Export Data"
                                onClick={props.onExport}
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