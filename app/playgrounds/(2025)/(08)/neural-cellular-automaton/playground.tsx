'use client';

import { useState, useRef } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import VersionSelector from '@/components/VersionSelector';
import CalibrationPanel from '@/components/CalibrationPanel';
import AssumptionPanel from '@/components/AssumptionPanel';
import ModelChangelog from '@/components/ModelChangelog';
import Equation from '@/components/Equation';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';

export default function NeuralCellularAutomatonPlayground() {
    const calibration = buildCalibration();

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
                        <div className="text-gray-300 text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
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
                        <div className="space-y-8 text-gray-300">
                            <div>
                                <h3 className="text-lime-400 font-semibold mb-3">A learned rule, not a lookup table</h3>
                                <p className="leading-relaxed text-sm">
                                    A classical cellular automaton maps each neighbourhood to a next state through a fixed table.
                                    A neural cellular automaton replaces that table with a small network shared by every cell.
                                    Here each cell reads the binary states of its eight Moore neighbours, runs them through a stack
                                    of dense layers, and thresholds the first output channel to decide whether it lives or dies.
                                    From this purely local rule, iterated across the toroidal grid, global texture grows and shifts.
                                </p>
                                <div className="my-3">
                                    <Equation
                                        mode="block"
                                        math="a^{(l)}_n = \phi\!\left(b_n + \sum_i a^{(l-1)}_i\, w^{(l)}_{n i}\right), \qquad s' = \mathbb{1}\big[a^{(L)}_0 > 0.5\big]"
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lime-400 font-semibold mb-3">Local learning, no global target</h3>
                                <p className="leading-relaxed text-sm">
                                    Unlike the trained Growing-NCA of Mordvintsev and colleagues, this grid is not optimised by
                                    backpropagation to draw a target image. Its weights drift through a local Hebbian rule,
                                    strengthening connections between co-active units, optionally perturbed by a random mutation
                                    mask. Order, where it appears, is emergent rather than fitted. The reported fitness readouts
                                    (complexity, stability, oscillation, diversity) describe the grid; they do not steer it.
                                </p>
                                <div className="border-l-2 border-lime-500/40 pl-4 mt-3">
                                    <p className="text-lime-200/80 text-sm">
                                        The only stochastic ingredients are the random initial weights and the mutation mask.
                                        Between a fixed neighbourhood and fixed weights, the update is fully deterministic, which is
                                        exactly what the calibration panel pins down.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lime-400 font-semibold mb-3">Generating model</h3>
                                <VersionSelector versions={versions} active="claude-v1" />
                            </div>

                            <div>
                                <h3 className="text-lime-400 font-semibold mb-3">Calibration</h3>
                                <p className="leading-relaxed text-sm mb-3">
                                    These cases pin the deterministic forward-pass core against hand-computed values. Each
                                    predicted number is produced by the same activation, layer, and threshold functions the live
                                    grid uses, so the suite tests the running arithmetic rather than restating constants.
                                </p>
                                <CalibrationPanel results={calibration} outputLabel="cell update value" />
                            </div>

                            <div>
                                <h3 className="text-lime-400 font-semibold mb-3">Assumptions</h3>
                                <AssumptionPanel assumptions={assumptions} />
                            </div>

                            <div>
                                <h3 className="text-lime-400 font-semibold mb-3">Model changelog</h3>
                                <ModelChangelog entries={changelog} />
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
            researchUrl="/playgrounds/neural-cellular-automaton/research"
        />
    );
}