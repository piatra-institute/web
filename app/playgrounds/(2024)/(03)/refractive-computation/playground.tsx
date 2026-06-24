'use client';

import { useState, useRef } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import VersionSelector from '@/components/VersionSelector';
import CalibrationPanel from '@/components/CalibrationPanel';
import AssumptionPanel from '@/components/AssumptionPanel';
import ModelChangelog from '@/components/ModelChangelog';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';

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
    const calibration = buildCalibration();

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
            title="refractive computation"
            subtitle="multiple logical operations simultaneously at different frequencies"
            sections={[
                {
                    id: 'intro',
                    type: 'intro',
                    content: (
                        <div className="text-gray-300 text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                            <h2 className="text-2xl font-bold text-lime-400 mb-4">Universal Mechanical Polycomputation</h2>
                            <p>
                                Based on groundbreaking work by <strong className="font-semibold text-lime-400">Atoosa Parsa, Josh Bongard, Michael Levin</strong> and colleagues,
                                this playground explores how granular materials can perform multiple logical operations simultaneously
                                at different frequencies, without quantum effects.
                            </p>
                            <p>
                                A single grain within an evolved granular assembly can act as multiple NAND gates at different 
                                frequencies. Since any logical operation can be built from NAND gates, this demonstrates a path 
                                toward <strong className="font-semibold text-lime-400">general-purpose mechanical computers</strong> with 
                                computational density that could rival traditional electronics.
                            </p>
                            <div className="bg-black border border-lime-500/20 p-4 mt-4">
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
                        <div className="space-y-8 text-gray-300">
                            <div>
                                <h3 className="text-lime-400 font-semibold mb-3">How it works</h3>
                                <p className="leading-relaxed text-sm">
                                    Vibrations at different frequencies propagate through the granular material differently,
                                    creating frequency-dependent force networks. By evolving the grain arrangement and stiffnesses,
                                    frequency 1 builds force chains that implement one NAND gate, frequency 2 builds different chains
                                    for a second NAND gate, and the output grain reports a separate logical result on each channel.
                                    The nonlinearity needed for logic comes from the contact mechanics: force is transmitted only
                                    when grains actually overlap.
                                </p>
                            </div>

                            <div className="border-l-2 border-lime-500/40 pl-4">
                                <h3 className="text-lime-400 font-semibold mb-3">The refraction metaphor</h3>
                                <p className="text-lime-200/80 mb-2">
                                    One medium, many frequency channels, computed at once.
                                </p>
                                <p className="leading-relaxed text-sm">
                                    A prism bends red and blue light by different angles because the refractive index depends on
                                    frequency. An evolved grain bends incoming vibration energy differently at different
                                    frequencies in the same way, so one physical element can play distinct roles in two
                                    computations at the same time. That shared structure, one passive body routing many channels,
                                    is why this mechanical system is framed as refractive computation.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lime-400 font-semibold mb-3">NAND completeness</h3>
                                <p className="leading-relaxed text-sm mb-3">
                                    NAND is functionally complete; every Boolean circuit can be built from NAND gates alone, so a
                                    material that robustly computes NAND is in principle a universal logic substrate.
                                </p>
                                <div className="border border-lime-500/20 p-3 font-mono text-sm">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-lime-500/20">
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

                            <div>
                                <h3 className="text-lime-400 font-semibold mb-3">Material evolution</h3>
                                <p className="leading-relaxed text-sm mb-3">
                                    A gate-performing packing is discovered offline by a genetic algorithm, not in real time. The
                                    live canvas animates one fixed packing and its frequency response; the evolution controls
                                    describe how such a packing would be found, by initialising random configurations, applying
                                    vibrations with input signals, measuring the output grain, selecting the configurations closest
                                    to the target logic, and mutating across generations until convergence.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lime-400 font-semibold mb-3">Where it could go</h3>
                                <p className="leading-relaxed text-sm">
                                    Mechanical logic embedded in materials suggests computers for harsh environments, computation
                                    inside compliant soft robots, processing powered by ambient vibration, many gates multiplexed in
                                    one body, and fault tolerance from distributed force chains. The open obstacle is cascadability:
                                    whether the noisy output of one mechanical gate can drive the next without degrading the signal.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lime-400 font-semibold mb-3">Implementation</h3>
                                <VersionSelector versions={versions} active="claude-v1" />
                            </div>

                            <div>
                                <h3 className="text-lime-400 font-semibold mb-3">Calibration</h3>
                                <CalibrationPanel results={calibration} outputLabel="deterministic core" />
                            </div>

                            <div>
                                <h3 className="text-lime-400 font-semibold mb-3">Assumptions</h3>
                                <AssumptionPanel assumptions={assumptions} />
                            </div>

                            <div>
                                <h3 className="text-lime-400 font-semibold mb-3">Model changelog</h3>
                                <ModelChangelog entries={changelog} />
                            </div>

                            <div>
                                <h3 className="text-lime-400 font-semibold mb-3">References</h3>
                                <ul className="space-y-1 text-sm text-lime-200/60">
                                    <li>Parsa et al., &quot;Universal Mechanical Polycomputation in Granular Matter&quot;</li>
                                    <li>Bongard and Levin, &quot;Living Things Are Not (20th Century) Machines&quot;</li>
                                    <li>Sheffer (1913), the NAND as a sole sufficient operator for Boolean algebra</li>
                                </ul>
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
            researchUrl="/playgrounds/refractive-computation/research"
        />
    );
}
