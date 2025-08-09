'use client';

import { useState, useRef } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Settings from './components/Settings';
import Viewer from './components/Viewer';

export default function MetamaterialsPlayground() {
    // Lattice parameters
    const [latticeType, setLatticeType] = useState('hexagonal');
    const [unitCells, setUnitCells] = useState(20);
    const [connectivity, setConnectivity] = useState(0.7);
    const [cellSize, setCellSize] = useState(15);
    
    // Material properties
    const [stiffness, setStiffness] = useState(100);
    const [damping, setDamping] = useState(0.1);
    const [nonlinearity, setNonlinearity] = useState(0.5);
    const [auxeticity, setAuxeticity] = useState(0.0); // Negative Poisson ratio
    
    // Life-like behaviors
    const [selfAssembly, setSelfAssembly] = useState(false);
    const [adaptation, setAdaptation] = useState(false);
    const [healing, setHealing] = useState(false);
    const [memoryEffect, setMemoryEffect] = useState(false);
    
    // Environmental stimuli
    const [mechanicalStimulus, setMechanicalStimulus] = useState(0.5);
    const [thermalStimulus, setThermalStimulus] = useState(0.0);
    const [stimulusFrequency, setStimulusFrequency] = useState(2.0);
    const [stimulusPattern, setStimulusPattern] = useState('wave');
    
    // Evolution parameters
    const [evolutionRate, setEvolutionRate] = useState(0.02);
    const [mutationRate, setMutationRate] = useState(0.05);
    const [fitnessFunction, setFitnessFunction] = useState('stability');
    
    // Visualization options
    const [showStress, setShowStress] = useState(true);
    const [showDeformation, setShowDeformation] = useState(true);
    const [showPropagation, setShowPropagation] = useState(true);
    const [showLifeMetrics, setShowLifeMetrics] = useState(true);
    const [colorMode, setColorMode] = useState('stress');
    
    // Animation
    const [speedMs, setSpeedMs] = useState(50);
    const [refreshKey, setRefreshKey] = useState(0);
    
    const viewerRef = useRef<{ exportCanvas: () => void }>(null);
    
    const handleReset = () => {
        setLatticeType('hexagonal');
        setUnitCells(20);
        setConnectivity(0.7);
        setCellSize(15);
        setStiffness(100);
        setDamping(0.1);
        setNonlinearity(0.5);
        setAuxeticity(0.0);
        setSelfAssembly(false);
        setAdaptation(false);
        setHealing(false);
        setMemoryEffect(false);
        setMechanicalStimulus(0.5);
        setThermalStimulus(0.0);
        setStimulusFrequency(2.0);
        setStimulusPattern('wave');
        setEvolutionRate(0.02);
        setMutationRate(0.05);
        setFitnessFunction('stability');
        setShowStress(true);
        setShowDeformation(true);
        setShowPropagation(true);
        setShowLifeMetrics(true);
        setColorMode('stress');
        setSpeedMs(50);
        setRefreshKey(prev => prev + 1);
    };
    
    const handleExport = () => {
        viewerRef.current?.exportCanvas();
    };
    
    return (
        <PlaygroundLayout
            title="metamaterials"
            subtitle="materials engineered to exhibit life-like properties"
            sections={[
                {
                    id: 'intro',
                    type: 'intro',
                    content: (
                        <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                            <h2 className="text-2xl font-bold text-white mb-4">Life-Like Metamaterials</h2>
                            <p>
                                Metamaterials gain their extraordinary properties not from their chemical composition, 
                                but from their precisely engineered microstructure. By carefully designing the geometry 
                                at scales smaller than the wavelength of interaction, we can create materials with 
                                properties not found in nature.
                            </p>
                            <p>
                                This playground explores metamaterials that exhibit <strong className="font-semibold text-lime-400">life-like behaviors</strong>: 
                                self-assembly, adaptation to stimuli, self-healing, memory formation, and evolutionary optimization. 
                                These materials blur the boundary between living and non-living matter.
                            </p>
                            <div className="bg-black border border-gray-800 p-4 mt-4">
                                <h3 className="text-sm font-semibold text-lime-400 mb-2">Key Life-Like Properties:</h3>
                                <ul className="space-y-1 text-sm">
                                    <li><strong className="text-white">Self-Assembly:</strong> Spontaneous organization into ordered structures</li>
                                    <li><strong className="text-white">Adaptation:</strong> Dynamic property changes in response to environment</li>
                                    <li><strong className="text-white">Self-Healing:</strong> Autonomous repair of damage</li>
                                    <li><strong className="text-white">Memory:</strong> Retention of previous states and experiences</li>
                                    <li><strong className="text-white">Evolution:</strong> Optimization of structure through iterative design</li>
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
                                latticeType={latticeType}
                                unitCells={unitCells}
                                connectivity={connectivity}
                                cellSize={cellSize}
                                stiffness={stiffness}
                                damping={damping}
                                nonlinearity={nonlinearity}
                                auxeticity={auxeticity}
                                selfAssembly={selfAssembly}
                                adaptation={adaptation}
                                healing={healing}
                                memoryEffect={memoryEffect}
                                mechanicalStimulus={mechanicalStimulus}
                                thermalStimulus={thermalStimulus}
                                stimulusFrequency={stimulusFrequency}
                                stimulusPattern={stimulusPattern}
                                evolutionRate={evolutionRate}
                                mutationRate={mutationRate}
                                fitnessFunction={fitnessFunction}
                                showStress={showStress}
                                showDeformation={showDeformation}
                                showPropagation={showPropagation}
                                showLifeMetrics={showLifeMetrics}
                                colorMode={colorMode}
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
                            <h2 className="text-2xl font-bold text-white mb-6">Engineering Life Into Matter</h2>
                            
                            <div className="space-y-6">
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Auxetic Materials</h3>
                                    <p className="mb-3">
                                        Materials with <strong>negative Poisson&apos;s ratio</strong> expand perpendicular to an applied stretch, 
                                        contrary to ordinary materials. This creates unique mechanical properties including:
                                    </p>
                                    <ul className="space-y-2 text-sm">
                                        <li>• <strong>Enhanced indentation resistance</strong> - become stiffer when compressed</li>
                                        <li>• <strong>Superior energy absorption</strong> - ideal for protective applications</li>
                                        <li>• <strong>Improved fracture toughness</strong> - cracks close rather than propagate</li>
                                        <li>• <strong>Synclastic curvature</strong> - can form dome shapes from flat sheets</li>
                                    </ul>
                                </div>
                                
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Self-Assembly Mechanisms</h3>
                                    <p className="mb-3">
                                        Metamaterials can be designed to spontaneously organize through various mechanisms:
                                    </p>
                                    <ul className="space-y-2 text-sm">
                                        <li>• <strong>Shape-Memory Effects:</strong> Temperature-triggered reconfiguration</li>
                                        <li>• <strong>Magnetic Assembly:</strong> Embedded magnetic elements guide structure</li>
                                        <li>• <strong>Capillary Forces:</strong> Surface tension drives component alignment</li>
                                        <li>• <strong>Elastic Instabilities:</strong> Buckling creates ordered patterns</li>
                                    </ul>
                                </div>
                                
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Adaptive Response</h3>
                                    <p className="mb-3">
                                        Life-like metamaterials can modify their properties in real-time:
                                    </p>
                                    <div className="space-y-3">
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">Mechanical Adaptation</h4>
                                            <p className="text-sm">Stiffness and damping adjust based on loading frequency and amplitude</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">Thermal Response</h4>
                                            <p className="text-sm">Thermal expansion and conductivity change with temperature gradients</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">Damage Detection</h4>
                                            <p className="text-sm">Material properties shift to isolate and repair damaged regions</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Applications & Future</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>• <strong>Soft Robotics:</strong> Materials that can change shape and properties on demand</li>
                                        <li>• <strong>Biomedical Implants:</strong> Materials that adapt to biological environment</li>
                                        <li>• <strong>Smart Architecture:</strong> Buildings that respond to environmental changes</li>
                                        <li>• <strong>Aerospace:</strong> Self-healing materials for extreme environments</li>
                                        <li>• <strong>Metamaterial Computers:</strong> Information processing through material properties</li>
                                    </ul>
                                </div>
                                
                                <div className="mt-8 p-6 border border-gray-800">
                                    <h3 className="text-lg font-semibold text-white mb-3">References</h3>
                                    <ul className="space-y-1 text-sm text-gray-400">
                                        <li>• Bertoldi et al. - &quot;Flexible mechanical metamaterials&quot; (Nature Reviews Materials)</li>
                                        <li>• Coulais et al. - &quot;Combinatorial design of textured mechanical metamaterials&quot; (Nature)</li>
                                        <li>• Rafsanjani & Bertoldi - &quot;Buckling-induced kirigami&quot; (Physical Review Letters)</li>
                                        <li>• Jin et al. - &quot;Kirigami-inspired inflatables with programmable shapes&quot; (Advanced Materials)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )
                }
            ]}
            settings={
                <Settings
                    latticeType={latticeType}
                    setLatticeType={setLatticeType}
                    unitCells={unitCells}
                    setUnitCells={setUnitCells}
                    connectivity={connectivity}
                    setConnectivity={setConnectivity}
                    cellSize={cellSize}
                    setCellSize={setCellSize}
                    stiffness={stiffness}
                    setStiffness={setStiffness}
                    damping={damping}
                    setDamping={setDamping}
                    nonlinearity={nonlinearity}
                    setNonlinearity={setNonlinearity}
                    auxeticity={auxeticity}
                    setAuxeticity={setAuxeticity}
                    selfAssembly={selfAssembly}
                    setSelfAssembly={setSelfAssembly}
                    adaptation={adaptation}
                    setAdaptation={setAdaptation}
                    healing={healing}
                    setHealing={setHealing}
                    memoryEffect={memoryEffect}
                    setMemoryEffect={setMemoryEffect}
                    mechanicalStimulus={mechanicalStimulus}
                    setMechanicalStimulus={setMechanicalStimulus}
                    thermalStimulus={thermalStimulus}
                    setThermalStimulus={setThermalStimulus}
                    stimulusFrequency={stimulusFrequency}
                    setStimulusFrequency={setStimulusFrequency}
                    stimulusPattern={stimulusPattern}
                    setStimulusPattern={setStimulusPattern}
                    evolutionRate={evolutionRate}
                    setEvolutionRate={setEvolutionRate}
                    mutationRate={mutationRate}
                    setMutationRate={setMutationRate}
                    fitnessFunction={fitnessFunction}
                    setFitnessFunction={setFitnessFunction}
                    showStress={showStress}
                    setShowStress={setShowStress}
                    showDeformation={showDeformation}
                    setShowDeformation={setShowDeformation}
                    showPropagation={showPropagation}
                    setShowPropagation={setShowPropagation}
                    showLifeMetrics={showLifeMetrics}
                    setShowLifeMetrics={setShowLifeMetrics}
                    colorMode={colorMode}
                    setColorMode={setColorMode}
                    speedMs={speedMs}
                    setSpeedMs={setSpeedMs}
                    onReset={handleReset}
                    onExport={handleExport}
                />
            }
        />
    );
}
