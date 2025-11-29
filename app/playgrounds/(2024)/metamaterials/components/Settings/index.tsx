'use client';

import Button from '@/components/Button';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import SliderInput from '@/components/SliderInput';

interface SettingsProps {
    // Lattice parameters
    latticeType: string;
    setLatticeType: (value: string) => void;
    unitCells: number;
    setUnitCells: (value: number) => void;
    connectivity: number;
    setConnectivity: (value: number) => void;
    cellSize: number;
    setCellSize: (value: number) => void;
    
    // Material properties
    stiffness: number;
    setStiffness: (value: number) => void;
    damping: number;
    setDamping: (value: number) => void;
    nonlinearity: number;
    setNonlinearity: (value: number) => void;
    auxeticity: number;
    setAuxeticity: (value: number) => void;
    
    // Life-like behaviors
    selfAssembly: boolean;
    setSelfAssembly: (value: boolean) => void;
    adaptation: boolean;
    setAdaptation: (value: boolean) => void;
    healing: boolean;
    setHealing: (value: boolean) => void;
    memoryEffect: boolean;
    setMemoryEffect: (value: boolean) => void;
    
    // Environmental stimuli
    mechanicalStimulus: number;
    setMechanicalStimulus: (value: number) => void;
    thermalStimulus: number;
    setThermalStimulus: (value: number) => void;
    stimulusFrequency: number;
    setStimulusFrequency: (value: number) => void;
    stimulusPattern: string;
    setStimulusPattern: (value: string) => void;
    
    // Evolution parameters
    evolutionRate: number;
    setEvolutionRate: (value: number) => void;
    mutationRate: number;
    setMutationRate: (value: number) => void;
    fitnessFunction: string;
    setFitnessFunction: (value: string) => void;
    
    // Visualization options
    showStress: boolean;
    setShowStress: (value: boolean) => void;
    showDeformation: boolean;
    setShowDeformation: (value: boolean) => void;
    showPropagation: boolean;
    setShowPropagation: (value: boolean) => void;
    showLifeMetrics: boolean;
    setShowLifeMetrics: (value: boolean) => void;
    colorMode: string;
    setColorMode: (value: string) => void;
    
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
                    title: 'Lattice Structure',
                    content: (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Lattice Type</label>
                                <select
                                    value={props.latticeType}
                                    onChange={(e) => props.setLatticeType(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                                >
                                    <option value="hexagonal">Hexagonal</option>
                                    <option value="square">Square</option>
                                    <option value="triangular">Triangular</option>
                                    <option value="kagome">Kagome</option>
                                    <option value="auxetic">Auxetic</option>
                                </select>
                            </div>
                            
                            <SliderInput
                                label="Unit Cells"
                                value={props.unitCells}
                                onChange={props.setUnitCells}
                                min={10}
                                max={50}
                                step={1}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Number of unit cells in the lattice
                            </p>
                            
                            <SliderInput
                                label="Connectivity"
                                value={props.connectivity}
                                onChange={props.setConnectivity}
                                min={0.3}
                                max={1.0}
                                step={0.01}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Fraction of possible connections present
                            </p>
                            
                            <SliderInput
                                label="Cell Size"
                                value={props.cellSize}
                                onChange={props.setCellSize}
                                min={8}
                                max={25}
                                step={1}
                            />
                            <p className="text-xs text-gray-400 -mt-2">
                                Size of individual unit cells
                            </p>
                        </div>
                    )
                },
                {
                    title: 'Material Properties',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="Stiffness"
                                value={props.stiffness}
                                onChange={props.setStiffness}
                                min={10}
                                max={500}
                                step={10}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Elastic stiffness of material connections
                            </p>
                            
                            <SliderInput
                                label="Damping"
                                value={props.damping}
                                onChange={props.setDamping}
                                min={0.01}
                                max={0.5}
                                step={0.01}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Energy dissipation coefficient
                            </p>
                            
                            <SliderInput
                                label="Nonlinearity"
                                value={props.nonlinearity}
                                onChange={props.setNonlinearity}
                                min={0.0}
                                max={1.0}
                                step={0.01}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Degree of nonlinear response
                            </p>
                            
                            <SliderInput
                                label="Auxeticity"
                                value={props.auxeticity}
                                onChange={props.setAuxeticity}
                                min={-0.8}
                                max={0.5}
                                step={0.01}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2">
Poisson&apos;s ratio (negative = auxetic behavior)
                            </p>
                        </div>
                    )
                },
                {
                    title: 'Life-Like Behaviors',
                    content: (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-300">Self-Assembly</label>
                                <button
                                    onClick={() => props.setSelfAssembly(!props.selfAssembly)}
                                    className={`w-12 h-6 rounded-full transition-colors ${
                                        props.selfAssembly ? 'bg-lime-500' : 'bg-gray-600'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                        props.selfAssembly ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Spontaneous organization into ordered structures
                            </p>
                            
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-300">Adaptation</label>
                                <button
                                    onClick={() => props.setAdaptation(!props.adaptation)}
                                    className={`w-12 h-6 rounded-full transition-colors ${
                                        props.adaptation ? 'bg-lime-500' : 'bg-gray-600'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                        props.adaptation ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Dynamic property changes in response to stimuli
                            </p>
                            
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-300">Self-Healing</label>
                                <button
                                    onClick={() => props.setHealing(!props.healing)}
                                    className={`w-12 h-6 rounded-full transition-colors ${
                                        props.healing ? 'bg-lime-500' : 'bg-gray-600'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                        props.healing ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Autonomous repair of damage
                            </p>
                            
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-300">Memory Effect</label>
                                <button
                                    onClick={() => props.setMemoryEffect(!props.memoryEffect)}
                                    className={`w-12 h-6 rounded-full transition-colors ${
                                        props.memoryEffect ? 'bg-lime-500' : 'bg-gray-600'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                        props.memoryEffect ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 -mt-2">
                                Retention of previous states and experiences
                            </p>
                        </div>
                    )
                },
                {
                    title: 'Environmental Stimuli',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="Mechanical Stimulus"
                                value={props.mechanicalStimulus}
                                onChange={props.setMechanicalStimulus}
                                min={0.0}
                                max={2.0}
                                step={0.1}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Applied mechanical loading intensity
                            </p>
                            
                            <SliderInput
                                label="Thermal Stimulus"
                                value={props.thermalStimulus}
                                onChange={props.setThermalStimulus}
                                min={-1.0}
                                max={1.0}
                                step={0.1}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Temperature gradient effect
                            </p>
                            
                            <SliderInput
                                label="Stimulus Frequency"
                                value={props.stimulusFrequency}
                                onChange={props.setStimulusFrequency}
                                min={0.1}
                                max={10.0}
                                step={0.1}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Frequency of environmental changes
                            </p>
                            
                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Stimulus Pattern</label>
                                <select
                                    value={props.stimulusPattern}
                                    onChange={(e) => props.setStimulusPattern(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                                >
                                    <option value="wave">Wave</option>
                                    <option value="pulse">Pulse</option>
                                    <option value="random">Random</option>
                                    <option value="gradient">Gradient</option>
                                </select>
                            </div>
                        </div>
                    )
                },
                {
                    title: 'Evolution Parameters',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="Evolution Rate"
                                value={props.evolutionRate}
                                onChange={props.setEvolutionRate}
                                min={0.001}
                                max={0.1}
                                step={0.001}
                                showDecimals={true}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Speed of adaptive changes
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
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Probability of random changes
                            </p>
                            
                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Fitness Function</label>
                                <select
                                    value={props.fitnessFunction}
                                    onChange={(e) => props.setFitnessFunction(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                                >
                                    <option value="stability">Stability</option>
                                    <option value="efficiency">Efficiency</option>
                                    <option value="adaptability">Adaptability</option>
                                    <option value="resilience">Resilience</option>
                                </select>
                            </div>
                        </div>
                    )
                },
                {
                    title: 'Visualization',
                    content: (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-300">Show Stress</label>
                                <button
                                    onClick={() => props.setShowStress(!props.showStress)}
                                    className={`w-12 h-6 rounded-full transition-colors ${
                                        props.showStress ? 'bg-lime-500' : 'bg-gray-600'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                        props.showStress ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-300">Show Deformation</label>
                                <button
                                    onClick={() => props.setShowDeformation(!props.showDeformation)}
                                    className={`w-12 h-6 rounded-full transition-colors ${
                                        props.showDeformation ? 'bg-lime-500' : 'bg-gray-600'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                        props.showDeformation ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-300">Show Propagation</label>
                                <button
                                    onClick={() => props.setShowPropagation(!props.showPropagation)}
                                    className={`w-12 h-6 rounded-full transition-colors ${
                                        props.showPropagation ? 'bg-lime-500' : 'bg-gray-600'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                        props.showPropagation ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-300">Life Metrics</label>
                                <button
                                    onClick={() => props.setShowLifeMetrics(!props.showLifeMetrics)}
                                    className={`w-12 h-6 rounded-full transition-colors ${
                                        props.showLifeMetrics ? 'bg-lime-500' : 'bg-gray-600'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                        props.showLifeMetrics ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>
                            
                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Color Mode</label>
                                <select
                                    value={props.colorMode}
                                    onChange={(e) => props.setColorMode(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                                >
                                    <option value="stress">Stress</option>
                                    <option value="strain">Strain</option>
                                    <option value="energy">Energy</option>
                                    <option value="life">Life Metrics</option>
                                </select>
                            </div>
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