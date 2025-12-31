'use client';

import { useState, useRef } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Settings from './components/Settings';
import Viewer from './components/Viewer';

export default function RefractiveComputationPlayground() {
    // Granular system parameters
    const [grainCount, setGrainCount] = useState(50);
    const [packingFraction, setPackingFraction] = useState(0.64);
    const [grainStiffness, setGrainStiffness] = useState(1000);
    const [damping, setDamping] = useState(0.1);
    
    // Vibration parameters
    const [frequency1, setFrequency1] = useState(10);
    const [frequency2, setFrequency2] = useState(25);
    const [amplitude1, setAmplitude1] = useState(0.5);
    const [amplitude2, setAmplitude2] = useState(0.3);
    
    // Logic gate configuration
    const [input1A, setInput1A] = useState(false);
    const [input1B, setInput1B] = useState(false);
    const [input2A, setInput2A] = useState(false);
    const [input2B, setInput2B] = useState(false);
    
    // Evolution parameters
    const [evolutionGenerations, setEvolutionGenerations] = useState(100);
    const [mutationRate, setMutationRate] = useState(0.05);
    const [showEvolution, setShowEvolution] = useState(false);
    
    // Display options
    const [showVibrationModes, setShowVibrationModes] = useState(true);
    const [showLogicFlow, setShowLogicFlow] = useState(true);
    const [showFrequencySpectrum, setShowFrequencySpectrum] = useState(true);
    
    // Animation
    const [speedMs, setSpeedMs] = useState(50);
    const [refreshKey, setRefreshKey] = useState(0);
    
    const viewerRef = useRef<{ exportCanvas: () => void }>(null);
    
    const handleReset = () => {
        setGrainCount(50);
        setPackingFraction(0.64);
        setGrainStiffness(1000);
        setDamping(0.1);
        setFrequency1(10);
        setFrequency2(25);
        setAmplitude1(0.5);
        setAmplitude2(0.3);
        setInput1A(false);
        setInput1B(false);
        setInput2A(false);
        setInput2B(false);
        setEvolutionGenerations(100);
        setMutationRate(0.05);
        setShowEvolution(false);
        setShowVibrationModes(true);
        setShowLogicFlow(true);
        setShowFrequencySpectrum(true);
        setSpeedMs(50);
        setRefreshKey(prev => prev + 1);
    };
    
    const handleExport = () => {
        viewerRef.current?.exportCanvas();
    };
    
    return (
        <PlaygroundLayout
            title="polycomputation"
            subtitle="multiple logical operations simultaneously at different frequencies"
            sections={[
                {
                    id: 'intro',
                    type: 'intro',
                    content: (
                        <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                            <h2 className="text-2xl font-bold text-white mb-4">Universal Mechanical Polycomputation</h2>
                            <p>
                                Based on groundbreaking work by <strong className="font-semibold text-lime-400">Atoosa Parsa, Josh Bongard, Michael Levin</strong> and colleagues, 
                                this playground explores how granular materials can perform multiple logical operations simultaneously 
                                at different frequencies - without quantum effects.
                            </p>
                            <p>
                                A single grain within an evolved granular assembly can act as multiple NAND gates at different 
                                frequencies. Since any logical operation can be built from NAND gates, this demonstrates a path 
                                toward <strong className="font-semibold text-lime-400">general-purpose mechanical computers</strong> with 
                                computational density that could rival traditional electronics.
                            </p>
                            <div className="bg-black border border-gray-800 p-4 mt-4">
                                <h3 className="text-sm font-semibold text-lime-400 mb-2">Key Concepts:</h3>
                                <ul className="space-y-1 text-sm">
                                    <li><strong className="text-white">Polycomputation:</strong> Multiple logic operations at different frequencies</li>
                                    <li><strong className="text-white">Granular Computing:</strong> Information processing as emergent material property</li>
                                    <li><strong className="text-white">Frequency Multiplexing:</strong> Different computations on different vibration modes</li>
                                    <li><strong className="text-white">Evolution:</strong> Materials evolved to perform specific computations</li>
                                    <li><strong className="text-white">Distributed Computation:</strong> Logic distributed across the material</li>
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
                                grainCount={grainCount}
                                packingFraction={packingFraction}
                                grainStiffness={grainStiffness}
                                damping={damping}
                                frequency1={frequency1}
                                frequency2={frequency2}
                                amplitude1={amplitude1}
                                amplitude2={amplitude2}
                                input1A={input1A}
                                input1B={input1B}
                                input2A={input2A}
                                input2B={input2B}
                                evolutionGenerations={evolutionGenerations}
                                mutationRate={mutationRate}
                                showEvolution={showEvolution}
                                showVibrationModes={showVibrationModes}
                                showLogicFlow={showLogicFlow}
                                showFrequencySpectrum={showFrequencySpectrum}
                                speedMs={speedMs}
                            />
                        </PlaygroundViewer>
                    )
                },
                {
                    id: 'outro',
                    type: 'outro',
                    content: (
                        <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                            <h2 className="text-2xl font-bold text-white mb-6">Understanding Polycomputation</h2>
                            
                            <div className="space-y-6">
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">How It Works</h3>
                                    <p className="mb-3">
                                        Vibrations at different frequencies propagate through the granular material differently, 
                                        creating frequency-dependent force networks. By evolving the grain arrangement and properties:
                                    </p>
                                    <ul className="space-y-2 text-sm">
                                        <li>• <strong>Frequency 1:</strong> Creates force chains implementing one NAND gate</li>
                                        <li>• <strong>Frequency 2:</strong> Creates different force chains for another NAND gate</li>
                                        <li>• <strong>Output Grain:</strong> Reports different logical results at each frequency</li>
                                        <li>• <strong>Nonlinearity:</strong> Contact mechanics provide necessary logical nonlinearity</li>
                                    </ul>
                                </div>
                                
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">NAND Gate Universality</h3>
                                    <p className="mb-3">
                                        NAND gates are functionally complete - any logical circuit can be built using only NAND gates:
                                    </p>
                                    <div className="bg-black border border-gray-800 p-3 font-mono text-sm">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-700">
                                                    <th className="text-left p-2">A</th>
                                                    <th className="text-left p-2">B</th>
                                                    <th className="text-left p-2">NAND(A,B)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr><td className="p-2">0</td><td className="p-2">0</td><td className="p-2 text-lime-400">1</td></tr>
                                                <tr><td className="p-2">0</td><td className="p-2">1</td><td className="p-2 text-lime-400">1</td></tr>
                                                <tr><td className="p-2">1</td><td className="p-2">0</td><td className="p-2 text-lime-400">1</td></tr>
                                                <tr><td className="p-2">1</td><td className="p-2">1</td><td className="p-2 text-lime-400">0</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Material Evolution</h3>
                                    <div className="space-y-3">
                                        <p>
                                            The granular assembly is evolved using genetic algorithms to discover configurations 
                                            that perform desired computations:
                                        </p>
                                        <ol className="space-y-2 text-sm list-decimal list-inside">
                                            <li>Initialize random grain configurations</li>
                                            <li>Apply vibrations at multiple frequencies with input signals</li>
                                            <li>Measure output grain responses</li>
                                            <li>Select configurations closest to target logic functions</li>
                                            <li>Mutate and crossover to create next generation</li>
                                            <li>Repeat until convergence</li>
                                        </ol>
                                    </div>
                                </div>
                                
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Applications & Implications</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>• <strong>Harsh Environments:</strong> Mechanical computers for extreme conditions</li>
                                        <li>• <strong>Soft Robotics:</strong> Computation embedded in compliant materials</li>
                                        <li>• <strong>Energy Harvesting:</strong> Computing powered by environmental vibrations</li>
                                        <li>• <strong>Parallel Processing:</strong> Many computations in single material</li>
                                        <li>• <strong>Fault Tolerance:</strong> Distributed computation provides robustness</li>
                                    </ul>
                                </div>
                                
                                <div className="mt-8 p-6 border border-gray-800">
                                    <h3 className="text-lg font-semibold text-white mb-3">References</h3>
                                    <ul className="space-y-1 text-sm text-gray-400">
                                        <li>• Parsa et al. - &quot;Universal Mechanical Polycomputation in Granular Matter&quot;</li>
                                        <li>• Bongard & Levin - &quot;Living Things Are Not (20th Century) Machines&quot;</li>
                                        <li>• Wright & Flecker - &quot;Mechanical Computing: The Computational Complexity of Physical Devices&quot;</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )
                }
            ]}
            settings={
                <Settings
                    grainCount={grainCount}
                    setGrainCount={setGrainCount}
                    packingFraction={packingFraction}
                    setPackingFraction={setPackingFraction}
                    grainStiffness={grainStiffness}
                    setGrainStiffness={setGrainStiffness}
                    damping={damping}
                    setDamping={setDamping}
                    frequency1={frequency1}
                    setFrequency1={setFrequency1}
                    frequency2={frequency2}
                    setFrequency2={setFrequency2}
                    amplitude1={amplitude1}
                    setAmplitude1={setAmplitude1}
                    amplitude2={amplitude2}
                    setAmplitude2={setAmplitude2}
                    input1A={input1A}
                    setInput1A={setInput1A}
                    input1B={input1B}
                    setInput1B={setInput1B}
                    input2A={input2A}
                    setInput2A={setInput2A}
                    input2B={input2B}
                    setInput2B={setInput2B}
                    evolutionGenerations={evolutionGenerations}
                    setEvolutionGenerations={setEvolutionGenerations}
                    mutationRate={mutationRate}
                    setMutationRate={setMutationRate}
                    showEvolution={showEvolution}
                    setShowEvolution={setShowEvolution}
                    showVibrationModes={showVibrationModes}
                    setShowVibrationModes={setShowVibrationModes}
                    showLogicFlow={showLogicFlow}
                    setShowLogicFlow={setShowLogicFlow}
                    showFrequencySpectrum={showFrequencySpectrum}
                    setShowFrequencySpectrum={setShowFrequencySpectrum}
                    speedMs={speedMs}
                    setSpeedMs={setSpeedMs}
                    onReset={handleReset}
                    onExport={handleExport}
                />
            }
        />
    );
}
