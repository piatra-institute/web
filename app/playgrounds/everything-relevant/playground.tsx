'use client';

import { useState, useRef } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Settings from './components/Settings';
import Viewer from './components/Viewer';

export default function EverythingRelevantPlayground() {
    // Core equation parameters
    const [couplingConstant, setCouplingConstant] = useState(0.1);
    const [fieldAmplitude, setFieldAmplitude] = useState(1.0);
    const [spacetimeCurvature, setSpacetimeCurvature] = useState(0.5);
    const [quantumFluctuations, setQuantumFluctuations] = useState(0.3);
    
    // Emergent phenomena
    const [showParticles, setShowParticles] = useState(true);
    const [showForces, setShowForces] = useState(true);
    const [showSpacetime, setShowSpacetime] = useState(true);
    const [showQuantumFoam, setShowQuantumFoam] = useState(false);
    
    // Symmetries and conservation laws
    const [timeTranslation, setTimeTranslation] = useState(true);
    const [spaceTranslation, setSpaceTranslation] = useState(true);
    const [rotation, setRotation] = useState(true);
    const [gauge, setGauge] = useState(true);
    
    // Observable parameters
    const [energyScale, setEnergyScale] = useState(1.0);
    const [lengthScale, setLengthScale] = useState(1.0);
    const [dimensionality, setDimensionality] = useState(4);
    const [temperature, setTemperature] = useState(0.0);
    
    // Visualization
    const [projectionType, setProjectionType] = useState('2D');
    const [colorScheme, setColorScheme] = useState('energy');
    const [showEquation, setShowEquation] = useState(true);
    const [animateFields, setAnimateFields] = useState(true);
    
    const [speedMs, setSpeedMs] = useState(50);
    const [refreshKey, setRefreshKey] = useState(0);
    
    const viewerRef = useRef<{ exportCanvas: () => void }>(null);
    
    const handleReset = () => {
        setCouplingConstant(0.1);
        setFieldAmplitude(1.0);
        setSpacetimeCurvature(0.5);
        setQuantumFluctuations(0.3);
        setShowParticles(true);
        setShowForces(true);
        setShowSpacetime(true);
        setShowQuantumFoam(false);
        setTimeTranslation(true);
        setSpaceTranslation(true);
        setRotation(true);
        setGauge(true);
        setEnergyScale(1.0);
        setLengthScale(1.0);
        setDimensionality(4);
        setTemperature(0.0);
        setProjectionType('2D');
        setColorScheme('energy');
        setShowEquation(true);
        setAnimateFields(true);
        setSpeedMs(50);
        setRefreshKey(prev => prev + 1);
    };
    
    const handleExport = () => {
        viewerRef.current?.exportCanvas();
    };

    return (
        <PlaygroundLayout
            title="everything... relevant"
            subtitle="unified field theory and emergent physics from fundamental equations"
            sections={[
                {
                    id: 'intro',
                    type: 'intro',
                    content: (
                        <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                            <h2 className="text-2xl font-bold text-white mb-4">The Dream of Unification</h2>
                            <p>
                                Inspired by <strong className="font-semibold text-lime-400">Sean Carroll&apos;s</strong> work on fundamental physics, 
                                this playground explores the tantalizing possibility that all of physics—particles, forces, 
                                spacetime, and quantum mechanics—might emerge from a single, elegantly simple equation.
                            </p>
                            <p>
                                While we don&apos;t yet know what this equation might look like, we can explore how different 
                                parameters and symmetries could give rise to the <strong className="font-semibold text-lime-400">rich tapestry</strong> 
                                of phenomena we observe in the universe, from the quantum to the cosmological.
                            </p>
                            <div className="bg-black border border-gray-800 p-4 mt-4">
                                <h3 className="text-sm font-semibold text-lime-400 mb-2">Emergent Phenomena:</h3>
                                <ul className="space-y-1 text-sm">
                                    <li><strong className="text-white">Particles:</strong> Stable excitations in quantum fields</li>
                                    <li><strong className="text-white">Forces:</strong> Gauge field interactions and symmetry breaking</li>
                                    <li><strong className="text-white">Spacetime:</strong> Dynamic geometry from field equations</li>
                                    <li><strong className="text-white">Quantum Mechanics:</strong> Probabilistic behavior from underlying dynamics</li>
                                    <li><strong className="text-white">Thermodynamics:</strong> Statistical behavior of many-body systems</li>
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
                                couplingConstant={couplingConstant}
                                fieldAmplitude={fieldAmplitude}
                                spacetimeCurvature={spacetimeCurvature}
                                quantumFluctuations={quantumFluctuations}
                                showParticles={showParticles}
                                showForces={showForces}
                                showSpacetime={showSpacetime}
                                showQuantumFoam={showQuantumFoam}
                                timeTranslation={timeTranslation}
                                spaceTranslation={spaceTranslation}
                                rotation={rotation}
                                gauge={gauge}
                                energyScale={energyScale}
                                lengthScale={lengthScale}
                                dimensionality={dimensionality}
                                temperature={temperature}
                                projectionType={projectionType}
                                colorScheme={colorScheme}
                                showEquation={showEquation}
                                animateFields={animateFields}
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
                            <h2 className="text-2xl font-bold text-white mb-6">The Quest for Everything</h2>
                            
                            <div className="space-y-6">
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">The Standard Model and Beyond</h3>
                                    <p className="mb-3">
                                        Our current best theory describes fundamental particles and forces through a 
                                        collection of equations, but physicists dream of a single, unified description:
                                    </p>
                                    <ul className="space-y-2 text-sm">
                                        <li>• <strong>Quantum Field Theory:</strong> Particles as excitations in quantum fields</li>
                                        <li>• <strong>General Relativity:</strong> Gravity as curved spacetime geometry</li>
                                        <li>• <strong>Gauge Theories:</strong> Forces arise from local symmetries</li>
                                        <li>• <strong>Spontaneous Symmetry Breaking:</strong> Mass generation and phase transitions</li>
                                    </ul>
                                </div>
                                
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Emergence and Reductionism</h3>
                                    <p className="mb-3">
                                        The beautiful paradox of fundamental physics: complex phenomena emerge from simple rules:
                                    </p>
                                    <div className="space-y-3">
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">Bottom-Up Emergence</h4>
                                            <p className="text-sm">Complex behavior arises from interactions of simpler components</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">Effective Field Theories</h4>
                                            <p className="text-sm">Different descriptions valid at different energy scales</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">Universality</h4>
                                            <p className="text-sm">Same mathematical structures appear across different contexts</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">The Beauty of Symmetry</h3>
                                    <p className="mb-3">
                                        Symmetries are not just mathematical curiosities—they&apos;re fundamental to physical law:
                                    </p>
                                    <ul className="space-y-2 text-sm">
                                        <li>• <strong>Noether&apos;s Theorem:</strong> Every symmetry corresponds to a conservation law</li>
                                        <li>• <strong>Gauge Invariance:</strong> Physical laws remain unchanged under local transformations</li>
                                        <li>• <strong>Spacetime Symmetries:</strong> Homogeneity and isotropy of space and time</li>
                                        <li>• <strong>Internal Symmetries:</strong> Abstract symmetries of particle properties</li>
                                    </ul>
                                </div>
                                
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Open Questions</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>• <strong>Quantum Gravity:</strong> How does spacetime behave at the Planck scale?</li>
                                        <li>• <strong>Dark Matter & Energy:</strong> What constitutes 95% of the universe?</li>
                                        <li>• <strong>The Hierarchy Problem:</strong> Why is gravity so much weaker than other forces?</li>
                                        <li>• <strong>Consciousness:</strong> How does subjective experience emerge from matter?</li>
                                    </ul>
                                </div>
                                
                                <div className="mt-8 p-6 border border-gray-800">
                                    <h3 className="text-lg font-semibold text-white mb-3">Further Exploration</h3>
                                    <ul className="space-y-1 text-sm text-gray-400">
                                        <li>• Sean Carroll - &quot;The Big Picture: On the Origins of Life, Meaning and the Universe&quot;</li>
                                        <li>• Frank Wilczek - &quot;A Beautiful Question: Finding Nature&apos;s Deep Design&quot;</li>
                                        <li>• Steven Weinberg - &quot;Dreams of a Final Theory&quot;</li>
                                        <li>• Carlo Rovelli - &quot;The Order of Time&quot;</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )
                }
            ]}
            settings={
                <Settings
                    couplingConstant={couplingConstant}
                    setCouplingConstant={setCouplingConstant}
                    fieldAmplitude={fieldAmplitude}
                    setFieldAmplitude={setFieldAmplitude}
                    spacetimeCurvature={spacetimeCurvature}
                    setSpacetimeCurvature={setSpacetimeCurvature}
                    quantumFluctuations={quantumFluctuations}
                    setQuantumFluctuations={setQuantumFluctuations}
                    showParticles={showParticles}
                    setShowParticles={setShowParticles}
                    showForces={showForces}
                    setShowForces={setShowForces}
                    showSpacetime={showSpacetime}
                    setShowSpacetime={setShowSpacetime}
                    showQuantumFoam={showQuantumFoam}
                    setShowQuantumFoam={setShowQuantumFoam}
                    timeTranslation={timeTranslation}
                    setTimeTranslation={setTimeTranslation}
                    spaceTranslation={spaceTranslation}
                    setSpaceTranslation={setSpaceTranslation}
                    rotation={rotation}
                    setRotation={setRotation}
                    gauge={gauge}
                    setGauge={setGauge}
                    energyScale={energyScale}
                    setEnergyScale={setEnergyScale}
                    lengthScale={lengthScale}
                    setLengthScale={setLengthScale}
                    dimensionality={dimensionality}
                    setDimensionality={setDimensionality}
                    temperature={temperature}
                    setTemperature={setTemperature}
                    projectionType={projectionType}
                    setProjectionType={setProjectionType}
                    colorScheme={colorScheme}
                    setColorScheme={setColorScheme}
                    showEquation={showEquation}
                    setShowEquation={setShowEquation}
                    animateFields={animateFields}
                    setAnimateFields={setAnimateFields}
                    speedMs={speedMs}
                    setSpeedMs={setSpeedMs}
                    onReset={handleReset}
                    onExport={handleExport}
                />
            }
        />
    );
}