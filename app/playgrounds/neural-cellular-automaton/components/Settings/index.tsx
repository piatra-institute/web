'use client';

interface SettingsProps {
    gridSize: number;
    setGridSize: (value: number) => void;
    rule: number;
    setRule: (value: number) => void;
    dimensions: number;
    setDimensions: (value: number) => void;
    neighborhoodType: string;
    setNeighborhoodType: (value: string) => void;
    layers: number;
    setLayers: (value: number) => void;
    neuronsPerCell: number;
    setNeuronsPerCell: (value: number) => void;
    activationFunction: string;
    setActivationFunction: (value: string) => void;
    learningRate: number;
    setLearningRate: (value: number) => void;
    evolutionMode: string;
    setEvolutionMode: (value: string) => void;
    mutationRate: number;
    setMutationRate: (value: number) => void;
    selectionPressure: number;
    setSelectionPressure: (value: number) => void;
    fitnessFunction: string;
    setFitnessFunction: (value: string) => void;
    visualizationMode: string;
    setVisualizationMode: (value: string) => void;
    colorScheme: string;
    setColorScheme: (value: string) => void;
    showConnections: boolean;
    setShowConnections: (value: boolean) => void;
    showActivation: boolean;
    setShowActivation: (value: boolean) => void;
    showWeights: boolean;
    setShowWeights: (value: boolean) => void;
    speedMs: number;
    setSpeedMs: (value: number) => void;
    autoEvolve: boolean;
    setAutoEvolve: (value: boolean) => void;
    onReset: () => void;
    onExport: () => void;
}

export default function Settings(props: SettingsProps) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-sm font-semibold text-lime-400 mb-3">Cellular Automaton</h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Grid Size</label>
                        <input
                            type="range"
                            min="16"
                            max="128"
                            value={props.gridSize}
                            onChange={(e) => props.setGridSize(Number(e.target.value))}
                            className="w-full"
                        />
                        <div className="text-xs text-gray-500 text-right">{props.gridSize}</div>
                    </div>
                    
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">CA Rule (1D)</label>
                        <input
                            type="range"
                            min="0"
                            max="255"
                            value={props.rule}
                            onChange={(e) => props.setRule(Number(e.target.value))}
                            className="w-full"
                        />
                        <div className="text-xs text-gray-500 text-right">Rule {props.rule}</div>
                    </div>
                    
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Neighborhood Type</label>
                        <select
                            value={props.neighborhoodType}
                            onChange={(e) => props.setNeighborhoodType(e.target.value)}
                            className="w-full bg-black border border-gray-800 text-white text-xs p-1"
                        >
                            <option value="moore">Moore (8 neighbors)</option>
                            <option value="vonneumann">Von Neumann (4 neighbors)</option>
                            <option value="extended">Extended Moore</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div>
                <h3 className="text-sm font-semibold text-lime-400 mb-3">Neural Network</h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Layers</label>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            value={props.layers}
                            onChange={(e) => props.setLayers(Number(e.target.value))}
                            className="w-full"
                        />
                        <div className="text-xs text-gray-500 text-right">{props.layers}</div>
                    </div>
                    
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Neurons per Cell</label>
                        <input
                            type="range"
                            min="2"
                            max="16"
                            value={props.neuronsPerCell}
                            onChange={(e) => props.setNeuronsPerCell(Number(e.target.value))}
                            className="w-full"
                        />
                        <div className="text-xs text-gray-500 text-right">{props.neuronsPerCell}</div>
                    </div>
                    
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Activation Function</label>
                        <select
                            value={props.activationFunction}
                            onChange={(e) => props.setActivationFunction(e.target.value)}
                            className="w-full bg-black border border-gray-800 text-white text-xs p-1"
                        >
                            <option value="sigmoid">Sigmoid</option>
                            <option value="tanh">Tanh</option>
                            <option value="relu">ReLU</option>
                            <option value="leaky_relu">Leaky ReLU</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Learning Rate</label>
                        <input
                            type="range"
                            min="0.001"
                            max="0.1"
                            step="0.001"
                            value={props.learningRate}
                            onChange={(e) => props.setLearningRate(Number(e.target.value))}
                            className="w-full"
                        />
                        <div className="text-xs text-gray-500 text-right">{props.learningRate.toFixed(3)}</div>
                    </div>
                </div>
            </div>
            
            <div>
                <h3 className="text-sm font-semibold text-lime-400 mb-3">Evolution</h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Evolution Mode</label>
                        <select
                            value={props.evolutionMode}
                            onChange={(e) => props.setEvolutionMode(e.target.value)}
                            className="w-full bg-black border border-gray-800 text-white text-xs p-1"
                        >
                            <option value="hebbian">Hebbian Learning</option>
                            <option value="stdp">STDP</option>
                            <option value="ca_rule">CA Rule Based</option>
                            <option value="genetic">Genetic Algorithm</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Mutation Rate</label>
                        <input
                            type="range"
                            min="0"
                            max="0.1"
                            step="0.001"
                            value={props.mutationRate}
                            onChange={(e) => props.setMutationRate(Number(e.target.value))}
                            className="w-full"
                        />
                        <div className="text-xs text-gray-500 text-right">{props.mutationRate.toFixed(3)}</div>
                    </div>
                    
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Fitness Function</label>
                        <select
                            value={props.fitnessFunction}
                            onChange={(e) => props.setFitnessFunction(e.target.value)}
                            className="w-full bg-black border border-gray-800 text-white text-xs p-1"
                        >
                            <option value="complexity">Complexity</option>
                            <option value="stability">Stability</option>
                            <option value="oscillation">Oscillation</option>
                            <option value="diversity">Diversity</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div>
                <h3 className="text-sm font-semibold text-lime-400 mb-3">Visualization</h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Display Mode</label>
                        <select
                            value={props.visualizationMode}
                            onChange={(e) => props.setVisualizationMode(e.target.value)}
                            className="w-full bg-black border border-gray-800 text-white text-xs p-1"
                        >
                            <option value="activation">Activation</option>
                            <option value="state">Binary State</option>
                            <option value="weights">Weight Magnitude</option>
                            <option value="diversity">Activation Diversity</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Color Scheme</label>
                        <select
                            value={props.colorScheme}
                            onChange={(e) => props.setColorScheme(e.target.value)}
                            className="w-full bg-black border border-gray-800 text-white text-xs p-1"
                        >
                            <option value="binary">Binary (Black/Lime)</option>
                            <option value="gradient">Gradient</option>
                            <option value="heatmap">Heatmap</option>
                        </select>
                    </div>
                    
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={props.showConnections}
                            onChange={(e) => props.setShowConnections(e.target.checked)}
                            className="mr-2"
                        />
                        <label className="text-xs text-gray-400">Show Connections</label>
                    </div>
                    
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={props.showActivation}
                            onChange={(e) => props.setShowActivation(e.target.checked)}
                            className="mr-2"
                        />
                        <label className="text-xs text-gray-400">Show Activation Overlay</label>
                    </div>
                </div>
            </div>
            
            <div>
                <h3 className="text-sm font-semibold text-lime-400 mb-3">Simulation</h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Speed (ms per step)</label>
                        <input
                            type="range"
                            min="10"
                            max="1000"
                            value={props.speedMs}
                            onChange={(e) => props.setSpeedMs(Number(e.target.value))}
                            className="w-full"
                        />
                        <div className="text-xs text-gray-500 text-right">{props.speedMs}ms</div>
                    </div>
                    
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={props.autoEvolve}
                            onChange={(e) => props.setAutoEvolve(e.target.checked)}
                            className="mr-2"
                        />
                        <label className="text-xs text-gray-400">Auto Evolution</label>
                    </div>
                </div>
            </div>
            
            <div className="flex gap-2">
                <button
                    onClick={props.onReset}
                    className="flex-1 bg-black border border-gray-800 text-white text-xs py-2 px-3 hover:bg-gray-900 transition-colors"
                >
                    Reset
                </button>
                <button
                    onClick={props.onExport}
                    className="flex-1 bg-black border border-gray-800 text-white text-xs py-2 px-3 hover:bg-gray-900 transition-colors"
                >
                    Export
                </button>
            </div>
        </div>
    );
}