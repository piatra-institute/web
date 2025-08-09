'use client';

import Button from '@/components/Button';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import SliderInput from '@/components/SliderInput';

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
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
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
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
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
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
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
                            <p className="text-xs text-gray-400 -mt-2">
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
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
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
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
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
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
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
                            <p className="text-xs text-gray-400 -mt-2">
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
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm text-gray-300">Input A</label>
                                        <button
                                            onClick={() => props.setInput1A(!props.input1A)}
                                            className={`w-12 h-6 rounded-full transition-colors ${
                                                props.input1A ? 'bg-lime-500' : 'bg-gray-600'
                                            }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                                props.input1A ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm text-gray-300">Input B</label>
                                        <button
                                            onClick={() => props.setInput1B(!props.input1B)}
                                            className={`w-12 h-6 rounded-full transition-colors ${
                                                props.input1B ? 'bg-lime-500' : 'bg-gray-600'
                                            }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                                props.input1B ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                        </button>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-2">
                                        Output: {!(props.input1A && props.input1B) ? '1' : '0'} (NAND)
                                    </div>
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-700 pt-4">
                                <h4 className="text-sm font-semibold text-lime-400 mb-2">NAND Gate 2 (Frequency 2)</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm text-gray-300">Input A</label>
                                        <button
                                            onClick={() => props.setInput2A(!props.input2A)}
                                            className={`w-12 h-6 rounded-full transition-colors ${
                                                props.input2A ? 'bg-lime-500' : 'bg-gray-600'
                                            }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                                props.input2A ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm text-gray-300">Input B</label>
                                        <button
                                            onClick={() => props.setInput2B(!props.input2B)}
                                            className={`w-12 h-6 rounded-full transition-colors ${
                                                props.input2B ? 'bg-lime-500' : 'bg-gray-600'
                                            }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                                props.input2B ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                        </button>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-2">
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
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-300">Show Evolution</label>
                                <button
                                    onClick={() => props.setShowEvolution(!props.showEvolution)}
                                    className={`w-12 h-6 rounded-full transition-colors ${
                                        props.showEvolution ? 'bg-lime-500' : 'bg-gray-600'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                        props.showEvolution ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
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
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
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
                            <p className="text-xs text-gray-400 -mt-2">
                                Probability of grain property mutation
                            </p>
                        </div>
                    )
                },
                {
                    title: 'Display Options',
                    content: (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-300">Vibration Modes</label>
                                <button
                                    onClick={() => props.setShowVibrationModes(!props.showVibrationModes)}
                                    className={`w-12 h-6 rounded-full transition-colors ${
                                        props.showVibrationModes ? 'bg-lime-500' : 'bg-gray-600'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                        props.showVibrationModes ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Show vibration propagation patterns
                            </p>
                            
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-300">Logic Flow</label>
                                <button
                                    onClick={() => props.setShowLogicFlow(!props.showLogicFlow)}
                                    className={`w-12 h-6 rounded-full transition-colors ${
                                        props.showLogicFlow ? 'bg-lime-500' : 'bg-gray-600'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                        props.showLogicFlow ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Display logical computation flow
                            </p>
                            
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-300">Frequency Spectrum</label>
                                <button
                                    onClick={() => props.setShowFrequencySpectrum(!props.showFrequencySpectrum)}
                                    className={`w-12 h-6 rounded-full transition-colors ${
                                        props.showFrequencySpectrum ? 'bg-lime-500' : 'bg-gray-600'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                        props.showFrequencySpectrum ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 -mt-2">
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
                            <p className="text-xs text-gray-400 -mt-2">
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