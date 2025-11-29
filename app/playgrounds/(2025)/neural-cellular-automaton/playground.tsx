'use client';

import { useState, useRef } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Settings from './components/Settings';
import Viewer from './components/Viewer';

export default function NeuralCellularAutomatonPlayground() {
    const [gridSize, setGridSize] = useState(64);
    const [rule, setRule] = useState(30);
    const [dimensions, setDimensions] = useState(2);
    const [neighborhoodType, setNeighborhoodType] = useState('moore');
    
    const [layers, setLayers] = useState(3);
    const [neuronsPerCell, setNeuronsPerCell] = useState(4);
    const [activationFunction, setActivationFunction] = useState('sigmoid');
    const [learningRate, setLearningRate] = useState(0.01);
    
    const [evolutionMode, setEvolutionMode] = useState('hebbian');
    const [mutationRate, setMutationRate] = useState(0.001);
    const [selectionPressure, setSelectionPressure] = useState(0.5);
    const [fitnessFunction, setFitnessFunction] = useState('complexity');
    
    const [visualizationMode, setVisualizationMode] = useState('activation');
    const [colorScheme, setColorScheme] = useState('gradient');
    const [showConnections, setShowConnections] = useState(false);
    const [showActivation, setShowActivation] = useState(true);
    const [showWeights, setShowWeights] = useState(false);
    
    const [speedMs, setSpeedMs] = useState(100);
    const [autoEvolve, setAutoEvolve] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    
    const viewerRef = useRef<{ exportCanvas: () => void }>(null);
    
    const handleReset = () => {
        setGridSize(64);
        setRule(30);
        setDimensions(2);
        setNeighborhoodType('moore');
        setLayers(3);
        setNeuronsPerCell(4);
        setActivationFunction('sigmoid');
        setLearningRate(0.01);
        setEvolutionMode('hebbian');
        setMutationRate(0.001);
        setSelectionPressure(0.5);
        setFitnessFunction('complexity');
        setVisualizationMode('activation');
        setColorScheme('gradient');
        setShowConnections(false);
        setShowActivation(true);
        setShowWeights(false);
        setSpeedMs(100);
        setAutoEvolve(true);
        setRefreshKey(prev => prev + 1);
    };
    
    const handleExport = () => {
        viewerRef.current?.exportCanvas();
    };

    return (
        <PlaygroundLayout
            title="neural-cellular-automaton"
            subtitle="where neural networks meet cellular automata in self-organizing computational structures"
            sections={[
                {
                    id: 'intro',
                    type: 'intro',
                    content: (
                        <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                            <h2 className="text-2xl font-bold text-white mb-4">Neural Cellular Automata</h2>
                            <p>
                                This playground explores the fusion of <strong className="font-semibold text-lime-400">neural networks</strong> and 
                                <strong className="font-semibold text-lime-400"> cellular automata</strong>, creating self-organizing computational 
                                structures that evolve through local interactions and learning rules.
                            </p>
                            <p>
                                Each cell in the grid contains a small neural network that processes information from its neighbors. 
                                Through cellular automaton rules and neural plasticity, complex patterns of computation emerge from 
                                simple local interactions.
                            </p>
                            <div className="bg-black border border-gray-800 p-4 mt-4">
                                <h3 className="text-sm font-semibold text-lime-400 mb-2">Key Concepts:</h3>
                                <ul className="space-y-1 text-sm">
                                    <li><strong className="text-white">Neural CA:</strong> Cells with embedded neural networks</li>
                                    <li><strong className="text-white">Local Learning:</strong> Hebbian and other local plasticity rules</li>
                                    <li><strong className="text-white">Emergent Computation:</strong> Global behavior from local interactions</li>
                                    <li><strong className="text-white">Self-Organization:</strong> Pattern formation without central control</li>
                                    <li><strong className="text-white">Evolutionary Dynamics:</strong> Networks that evolve and adapt</li>
                                </ul>
                            </div>
                        </div>
                    )
                },
                {
                    id: 'canvas',
                    type: 'canvas',
                    content: (
                        <PlaygroundViewer>
                            <Viewer
                                ref={viewerRef}
                                key={refreshKey}
                                gridSize={gridSize}
                                rule={rule}
                                dimensions={dimensions}
                                neighborhoodType={neighborhoodType}
                                layers={layers}
                                neuronsPerCell={neuronsPerCell}
                                activationFunction={activationFunction}
                                learningRate={learningRate}
                                evolutionMode={evolutionMode}
                                mutationRate={mutationRate}
                                selectionPressure={selectionPressure}
                                fitnessFunction={fitnessFunction}
                                visualizationMode={visualizationMode}
                                colorScheme={colorScheme}
                                showConnections={showConnections}
                                showActivation={showActivation}
                                showWeights={showWeights}
                                speedMs={speedMs}
                                autoEvolve={autoEvolve}
                            />
                        </PlaygroundViewer>
                    )
                },
                {
                    id: 'outro',
                    type: 'outro',
                    content: (
                        <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                            <h2 className="text-2xl font-bold text-white mb-6">The Mathematics of Neural CA</h2>
                            
                            <div className="space-y-6">
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Cell Neural Architecture</h3>
                                    <p className="mb-3">
                                        Each cell contains a feedforward neural network that processes neighbor states:
                                    </p>
                                    <ul className="space-y-2 text-sm">
                                        <li>• <strong>Input Layer:</strong> Receives neighbor cell activations</li>
                                        <li>• <strong>Hidden Layers:</strong> Process information through nonlinear transformations</li>
                                        <li>• <strong>Output Layer:</strong> Determines new cell state and signals</li>
                                        <li>• <strong>Weight Evolution:</strong> Synaptic plasticity based on local activity</li>
                                    </ul>
                                </div>
                                
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Learning Rules</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">Hebbian Learning</h4>
                                            <p className="text-sm">Neurons that fire together wire together - strengthening correlated connections</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">Spike-Timing Dependent Plasticity</h4>
                                            <p className="text-sm">Temporal order of activation determines synaptic changes</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">Homeostatic Plasticity</h4>
                                            <p className="text-sm">Maintains stable activity levels through regulatory mechanisms</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">Evolutionary Selection</h4>
                                            <p className="text-sm">Networks compete and reproduce based on fitness criteria</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Emergent Behaviors</h3>
                                    <p className="mb-3">Complex computational patterns emerge from simple rules:</p>
                                    <ul className="space-y-2 text-sm">
                                        <li>• <strong>Pattern Recognition:</strong> Networks learn to detect spatial configurations</li>
                                        <li>• <strong>Signal Propagation:</strong> Information waves through the cellular medium</li>
                                        <li>• <strong>Memory Formation:</strong> Stable attractor states store information</li>
                                        <li>• <strong>Computation Islands:</strong> Specialized regions for different tasks</li>
                                        <li>• <strong>Adaptive Response:</strong> Networks adjust to changing input patterns</li>
                                    </ul>
                                </div>
                                
                                <div className="mt-8 p-6 border border-gray-800">
                                    <h3 className="text-lg font-semibold text-white mb-3">References & Inspiration</h3>
                                    <ul className="space-y-1 text-sm text-gray-400">
                                        <li>• Mordvintsev et al. - &quot;Growing Neural Cellular Automata&quot;</li>
                                        <li>• Randazzo et al. - &quot;Self-classifying MNIST Digits&quot;</li>
                                        <li>• Miller & Downing - &quot;Evolution of Digital Organisms&quot;</li>
                                        <li>• Wolfram - &quot;A New Kind of Science&quot;</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )
                }
            ]}
            settings={
                <Settings
                    gridSize={gridSize}
                    setGridSize={setGridSize}
                    rule={rule}
                    setRule={setRule}
                    dimensions={dimensions}
                    setDimensions={setDimensions}
                    neighborhoodType={neighborhoodType}
                    setNeighborhoodType={setNeighborhoodType}
                    layers={layers}
                    setLayers={setLayers}
                    neuronsPerCell={neuronsPerCell}
                    setNeuronsPerCell={setNeuronsPerCell}
                    activationFunction={activationFunction}
                    setActivationFunction={setActivationFunction}
                    learningRate={learningRate}
                    setLearningRate={setLearningRate}
                    evolutionMode={evolutionMode}
                    setEvolutionMode={setEvolutionMode}
                    mutationRate={mutationRate}
                    setMutationRate={setMutationRate}
                    selectionPressure={selectionPressure}
                    setSelectionPressure={setSelectionPressure}
                    fitnessFunction={fitnessFunction}
                    setFitnessFunction={setFitnessFunction}
                    visualizationMode={visualizationMode}
                    setVisualizationMode={setVisualizationMode}
                    colorScheme={colorScheme}
                    setColorScheme={setColorScheme}
                    showConnections={showConnections}
                    setShowConnections={setShowConnections}
                    showActivation={showActivation}
                    setShowActivation={setShowActivation}
                    showWeights={showWeights}
                    setShowWeights={setShowWeights}
                    speedMs={speedMs}
                    setSpeedMs={setSpeedMs}
                    autoEvolve={autoEvolve}
                    setAutoEvolve={setAutoEvolve}
                    onReset={handleReset}
                    onExport={handleExport}
                />
            }
        />
    );
}