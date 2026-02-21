'use client';

import Button from '@/components/Button';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import SliderInput from '@/components/SliderInput';
import Toggle from '@/components/Toggle';

interface SettingsProps {
    // Granular system parameters
    grainCount: number;
    setGrainCount: (value: number) => void;
    packingFraction: number;
    setPackingFraction: (value: number) => void;
    grainStiffness: number;
    setGrainStiffness: (value: number) => void;
    damping: number;
    setDamping: (value: number) => void;

    // Vibration parameters
    frequency1: number;
    setFrequency1: (value: number) => void;
    frequency2: number;
    setFrequency2: (value: number) => void;
    amplitude1: number;
    setAmplitude1: (value: number) => void;
    amplitude2: number;
    setAmplitude2: (value: number) => void;

    // Logic gate configuration
    input1A: boolean;
    setInput1A: (value: boolean) => void;
    input1B: boolean;
    setInput1B: (value: boolean) => void;
    input2A: boolean;
    setInput2A: (value: boolean) => void;
    input2B: boolean;
    setInput2B: (value: boolean) => void;

    // Evolution parameters
    evolutionGenerations: number;
    setEvolutionGenerations: (value: number) => void;
    mutationRate: number;
    setMutationRate: (value: number) => void;
    showEvolution: boolean;
    setShowEvolution: (value: boolean) => void;

    // Display options
    showVibrationModes: boolean;
    setShowVibrationModes: (value: boolean) => void;
    showLogicFlow: boolean;
    setShowLogicFlow: (value: boolean) => void;
    showFrequencySpectrum: boolean;
    setShowFrequencySpectrum: (value: boolean) => void;

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
                    title: 'Granular System',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="Number of Grains"
                                value={props.grainCount}
                                onChange={props.setGrainCount}
                                min={20}
                                max={200}
                                step={5}
                            />
                            <p className="text-xs text-lime-200/60 -mt-2 mb-2">
                                Total grains in the assembly
                            </p>

                            <SliderInput
                                label="Packing Fraction"
                                value={props.packingFraction}
                                onChange={props.setPackingFraction}
                                min={0.3}
                                max={0.8}
                                step={0.01}
                                showDecimals={true}
                            />
                            <p className="text-xs text-lime-200/60 -mt-2 mb-2">
                                Density of grain arrangement (0.64 = random close packing)
                            </p>

                            <SliderInput
                                label="Grain Stiffness"
                                value={props.grainStiffness}
                                onChange={props.setGrainStiffness}
                                min={100}
                                max={5000}
                                step={100}
                            />
                            <p className="text-xs text-lime-200/60 -mt-2 mb-2">
                                Contact stiffness between grains (affects force transmission)
                            </p>

                            <SliderInput
                                label="Damping Coefficient"
                                value={props.damping}
                                onChange={props.setDamping}
                                min={0.01}
                                max={0.5}
                                step={0.01}
                                showDecimals={true}
                            />
                            <p className="text-xs text-lime-200/60 -mt-2">
                                Energy dissipation in grain contacts
                            </p>
                        </div>
                    )
                },
                {
                    title: 'Vibration Parameters',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="Frequency 1 (Hz)"
                                value={props.frequency1}
                                onChange={props.setFrequency1}
                                min={5}
                                max={100}
                                step={1}
                            />
                            <p className="text-xs text-lime-200/60 -mt-2 mb-2">
                                Primary vibration frequency for first NAND gate
                            </p>

                            <SliderInput
                                label="Frequency 2 (Hz)"
                                value={props.frequency2}
                                onChange={props.setFrequency2}
                                min={5}
                                max={100}
                                step={1}
                            />
                            <p className="text-xs text-lime-200/60 -mt-2 mb-2">
                                Secondary vibration frequency for second NAND gate
                            </p>

                            <SliderInput
                                label="Amplitude 1"
                                value={props.amplitude1}
                                onChange={props.setAmplitude1}
                                min={0.1}
                                max={2.0}
                                step={0.1}
                                showDecimals={true}
                            />
                            <p className="text-xs text-lime-200/60 -mt-2 mb-2">
                                Vibration strength at frequency 1
                            </p>

                            <SliderInput
                                label="Amplitude 2"
                                value={props.amplitude2}
                                onChange={props.setAmplitude2}
                                min={0.1}
                                max={2.0}
                                step={0.1}
                                showDecimals={true}
                            />
                            <p className="text-xs text-lime-200/60 -mt-2">
                                Vibration strength at frequency 2
                            </p>
                        </div>
                    )
                },
                {
                    title: 'Logic Inputs',
                    content: (
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold text-lime-400 mb-2">NAND Gate 1 (Frequency 1)</h4>
                                <div className="space-y-3">
                                    <Toggle
                                        text="Input A"
                                        value={props.input1A}
                                        toggle={() => props.setInput1A(!props.input1A)}
                                    />
                                    <Toggle
                                        text="Input B"
                                        value={props.input1B}
                                        toggle={() => props.setInput1B(!props.input1B)}
                                    />
                                    <div className="text-xs text-lime-200/60 mt-2">
                                        Output: {!(props.input1A && props.input1B) ? '1' : '0'} (NAND)
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-lime-500/20 pt-4">
                                <h4 className="text-sm font-semibold text-lime-400 mb-2">NAND Gate 2 (Frequency 2)</h4>
                                <div className="space-y-3">
                                    <Toggle
                                        text="Input A"
                                        value={props.input2A}
                                        toggle={() => props.setInput2A(!props.input2A)}
                                    />
                                    <Toggle
                                        text="Input B"
                                        value={props.input2B}
                                        toggle={() => props.setInput2B(!props.input2B)}
                                    />
                                    <div className="text-xs text-lime-200/60 mt-2">
                                        Output: {!(props.input2A && props.input2B) ? '1' : '0'} (NAND)
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: 'Evolution Settings',
                    content: (
                        <div className="space-y-4">
                            <Toggle
                                text="Show Evolution"
                                value={props.showEvolution}
                                toggle={() => props.setShowEvolution(!props.showEvolution)}
                            />
                            <p className="text-xs text-lime-200/60 -mt-2 mb-2">
                                Display evolutionary optimization process
                            </p>

                            <SliderInput
                                label="Evolution Generations"
                                value={props.evolutionGenerations}
                                onChange={props.setEvolutionGenerations}
                                min={10}
                                max={500}
                                step={10}
                            />
                            <p className="text-xs text-lime-200/60 -mt-2 mb-2">
                                Number of generations for material evolution
                            </p>

                            <SliderInput
                                label="Mutation Rate"
                                value={props.mutationRate}
                                onChange={props.setMutationRate}
                                min={0.01}
                                max={0.2}
                                step={0.01}
                                showDecimals={true}
                            />
                            <p className="text-xs text-lime-200/60 -mt-2">
                                Probability of grain property mutation
                            </p>
                        </div>
                    )
                },
                {
                    title: 'Display Options',
                    content: (
                        <div className="space-y-4">
                            <Toggle
                                text="Vibration Modes"
                                value={props.showVibrationModes}
                                toggle={() => props.setShowVibrationModes(!props.showVibrationModes)}
                            />
                            <p className="text-xs text-lime-200/60 -mt-2 mb-2">
                                Show vibration propagation patterns
                            </p>

                            <Toggle
                                text="Logic Flow"
                                value={props.showLogicFlow}
                                toggle={() => props.setShowLogicFlow(!props.showLogicFlow)}
                            />
                            <p className="text-xs text-lime-200/60 -mt-2 mb-2">
                                Display logical computation flow
                            </p>

                            <Toggle
                                text="Frequency Spectrum"
                                value={props.showFrequencySpectrum}
                                toggle={() => props.setShowFrequencySpectrum(!props.showFrequencySpectrum)}
                            />
                            <p className="text-xs text-lime-200/60 -mt-2">
                                Show frequency domain analysis
                            </p>
                        </div>
                    )
                },
                {
                    title: 'Animation',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="Animation Speed (ms)"
                                value={props.speedMs}
                                onChange={props.setSpeedMs}
                                min={10}
                                max={200}
                                step={10}
                            />
                            <p className="text-xs text-lime-200/60 -mt-2">
                                Milliseconds between animation frames
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
