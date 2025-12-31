'use client';

import Button from '@/components/Button';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import SliderInput from '@/components/SliderInput';

interface SettingsProps {
    // Simulation parameters
    duration: number;
    setDuration: (value: number) => void;
    speedMs: number;
    setSpeedMs: (value: number) => void;
    
    // Pacemaker parameters
    pacemakerRate: number;
    setPacemakerRate: (value: number) => void;
    pacemakerNoise: number;
    setPacemakerNoise: (value: number) => void;
    pacemakerAdaptation: number;
    setPacemakerAdaptation: (value: number) => void;
    
    // Accumulator parameters
    accumulatorThreshold: number;
    setAccumulatorThreshold: (value: number) => void;
    accumulatorDecay: number;
    setAccumulatorDecay: (value: number) => void;
    accumulatorNoise: number;
    setAccumulatorNoise: (value: number) => void;
    
    // Multiple timescales
    fastPacemaker: number;
    setFastPacemaker: (value: number) => void;
    slowPacemaker: number;
    setSlowPacemaker: (value: number) => void;
    scaleInteraction: number;
    setScaleInteraction: (value: number) => void;
    
    // Interval timing task
    targetInterval: number;
    setTargetInterval: (value: number) => void;
    intervalVariability: number;
    setIntervalVariability: (value: number) => void;
    
    // Neural realism
    neuralNoise: number;
    setNeuralNoise: (value: number) => void;
    refractoryPeriod: number;
    setRefractoryPeriod: (value: number) => void;
    
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
                                label="Simulation Duration (s)"
                                value={props.duration}
                                onChange={props.setDuration}
                                min={10}
                                max={120}
                                step={5}
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
                    title: 'Pacemaker Properties',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="Base Pacemaker Rate (Hz)"
                                value={props.pacemakerRate}
                                onChange={props.setPacemakerRate}
                                min={0.5}
                                max={20}
                                step={0.5}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Primary oscillation frequency for timing pulses
                            </p>
                            
                            <SliderInput
                                label="Pacemaker Noise"
                                value={props.pacemakerNoise}
                                onChange={props.setPacemakerNoise}
                                min={0}
                                max={0.5}
                                step={0.01}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Random variation in pulse timing (Weber&apos;s law)
                            </p>
                            
                            <SliderInput
                                label="Adaptation Rate"
                                value={props.pacemakerAdaptation}
                                onChange={props.setPacemakerAdaptation}
                                min={0}
                                max={0.1}
                                step={0.005}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2">
                                Rate of pacemaker frequency adaptation over time
                            </p>
                        </div>
                    )
                },
                {
                    title: 'Accumulator Dynamics',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="Threshold Level"
                                value={props.accumulatorThreshold}
                                onChange={props.setAccumulatorThreshold}
                                min={5}
                                max={100}
                                step={2}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Pulses needed to trigger threshold crossing
                            </p>
                            
                            <SliderInput
                                label="Leaky Integration"
                                value={props.accumulatorDecay}
                                onChange={props.setAccumulatorDecay}
                                min={0}
                                max={0.05}
                                step={0.002}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Rate of accumulator value decay between pulses
                            </p>
                            
                            <SliderInput
                                label="Integration Noise"
                                value={props.accumulatorNoise}
                                onChange={props.setAccumulatorNoise}
                                min={0}
                                max={2}
                                step={0.1}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2">
                                Random variation in accumulation process
                            </p>
                        </div>
                    )
                },
                {
                    title: 'Multiple Timescales',
                    content: (
                        <div className="space-y-4">
                            <p className="text-xs text-gray-400 mb-2">
                                Neural timing involves multiple oscillatory populations
                            </p>
                            
                            <SliderInput
                                label="Fast Pacemaker (Hz)"
                                value={props.fastPacemaker}
                                onChange={props.setFastPacemaker}
                                min={5}
                                max={50}
                                step={1}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                High-frequency oscillations (gamma-like)
                            </p>
                            
                            <SliderInput
                                label="Slow Pacemaker (Hz)"
                                value={props.slowPacemaker}
                                onChange={props.setSlowPacemaker}
                                min={0.1}
                                max={5}
                                step={0.1}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Low-frequency oscillations (theta-like)
                            </p>
                            
                            <SliderInput
                                label="Scale Interaction"
                                value={props.scaleInteraction}
                                onChange={props.setScaleInteraction}
                                min={0}
                                max={1}
                                step={0.05}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2">
                                Cross-frequency coupling strength
                            </p>
                        </div>
                    )
                },
                {
                    title: 'Interval Timing Task',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="Target Interval (s)"
                                value={props.targetInterval}
                                onChange={props.setTargetInterval}
                                min={1}
                                max={20}
                                step={0.5}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Duration to be timed and reproduced
                            </p>
                            
                            <SliderInput
                                label="Timing Variability"
                                value={props.intervalVariability}
                                onChange={props.setIntervalVariability}
                                min={0.05}
                                max={0.5}
                                step={0.02}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2">
                                Weber fraction: CV = σ/μ for timing precision
                            </p>
                        </div>
                    )
                },
                {
                    title: 'Neural Realism',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="Background Noise"
                                value={props.neuralNoise}
                                onChange={props.setNeuralNoise}
                                min={0}
                                max={1}
                                step={0.02}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Spontaneous neural activity level
                            </p>
                            
                            <SliderInput
                                label="Refractory Period (ms)"
                                value={props.refractoryPeriod}
                                onChange={props.setRefractoryPeriod}
                                min={1}
                                max={20}
                                step={1}
                            />
                            <p className="text-xs text-gray-400 -mt-2">
                                Minimum interval between neural firings
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