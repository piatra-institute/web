'use client';

import { useState, useRef } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Settings from './components/Settings';
import Viewer from './components/Viewer';

export default function EyevolutionPlayground() {
    // Evolution parameters
    const [generations, setGenerations] = useState(500);
    const [populationSize, setPopulationSize] = useState(100);
    const [mutationRate, setMutationRate] = useState(0.05);
    const [selectionPressure, setSelectionPressure] = useState(0.7);
    
    // Environmental parameters
    const [lightIntensity, setLightIntensity] = useState(0.8);
    const [environmentComplexity, setEnvironmentComplexity] = useState(0.5);
    const [predatorPresence, setPredatorPresence] = useState(0.3);
    
    // Eye type evolution thresholds
    const [eyespotThreshold, setEyespotThreshold] = useState(0.1);
    const [pitEyeThreshold, setPitEyeThreshold] = useState(0.3);
    const [pinholeThreshold, setPinholeThreshold] = useState(0.5);
    const [lensThreshold, setLensThreshold] = useState(0.7);
    const [compoundThreshold, setCompoundThreshold] = useState(0.6);
    
    // Display options
    const [showPhylogeny, setShowPhylogeny] = useState(true);
    const [showFitnessLandscape, setShowFitnessLandscape] = useState(true);
    const [convergentEvolution, setConvergentEvolution] = useState(true);
    
    // Animation speed
    const [speedMs, setSpeedMs] = useState(50);
    
    const [refreshKey, setRefreshKey] = useState(0);
    
    const viewerRef = useRef<{ exportCanvas: () => void }>(null);
    
    const handleReset = () => {
        setGenerations(500);
        setPopulationSize(100);
        setMutationRate(0.05);
        setSelectionPressure(0.7);
        setLightIntensity(0.8);
        setEnvironmentComplexity(0.5);
        setPredatorPresence(0.3);
        setEyespotThreshold(0.1);
        setPitEyeThreshold(0.3);
        setPinholeThreshold(0.5);
        setLensThreshold(0.7);
        setCompoundThreshold(0.6);
        setShowPhylogeny(true);
        setShowFitnessLandscape(true);
        setConvergentEvolution(true);
        setSpeedMs(50);
        setRefreshKey(prev => prev + 1);
    };
    
    const handleExport = () => {
        viewerRef.current?.exportCanvas();
    };
    
    return (
        <PlaygroundLayout
            title="eyevolution"
            subtitle="evolutionary development of visual systems across species"
            sections={[
                {
                    id: 'intro',
                    type: 'intro',
                    content: (
                        <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                            <h2 className="text-2xl font-bold text-white mb-4">The Evolution of Eyes</h2>
                            <p>
                                Eyes have evolved independently <strong className="font-semibold text-lime-400">over 60 times</strong> throughout 
                                the history of life on Earth. This remarkable convergent evolution demonstrates the immense selective 
                                advantage of light detection and image formation.
                            </p>
                            <p>
                                From simple photosensitive spots to complex camera and compound eyes, the evolution of vision 
                                follows predictable patterns driven by environmental pressures and physical constraints. As 
                                Nick Lane and others have shown, the basic biochemistry of light detection is ancient and conserved.
                            </p>
                            <div className="bg-black border border-gray-800 p-4 mt-4">
                                <h3 className="text-sm font-semibold text-lime-400 mb-2">Major Eye Types:</h3>
                                <ul className="space-y-1 text-sm">
                                    <li><strong className="text-white">Eyespot:</strong> Basic light/dark detection</li>
                                    <li><strong className="text-white">Pit Eye:</strong> Directional light sensing</li>
                                    <li><strong className="text-white">Pinhole Eye:</strong> Basic image formation without lens</li>
                                    <li><strong className="text-white">Camera Eye:</strong> Focused imaging with lens</li>
                                    <li><strong className="text-white">Compound Eye:</strong> Multiple ommatidia for wide field vision</li>
                                </ul>
                            </div>
                            <p className="text-sm text-gray-400">
                                This simulation explores how different eye types evolve under varying environmental conditions, 
                                demonstrating both convergent evolution and adaptive radiation.
                            </p>
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
                                generations={generations}
                                populationSize={populationSize}
                                mutationRate={mutationRate}
                                selectionPressure={selectionPressure}
                                lightIntensity={lightIntensity}
                                environmentComplexity={environmentComplexity}
                                predatorPresence={predatorPresence}
                                eyespotThreshold={eyespotThreshold}
                                pitEyeThreshold={pitEyeThreshold}
                                pinholeThreshold={pinholeThreshold}
                                lensThreshold={lensThreshold}
                                compoundThreshold={compoundThreshold}
                                showPhylogeny={showPhylogeny}
                                showFitnessLandscape={showFitnessLandscape}
                                convergentEvolution={convergentEvolution}
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
                            <h2 className="text-2xl font-bold text-white mb-6">Understanding Eye Evolution</h2>
                            
                            <div className="space-y-6">
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Evolutionary Pressures</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>• <strong>Light Intensity:</strong> Higher light favors more complex optical structures</li>
                                        <li>• <strong>Environmental Complexity:</strong> Complex environments reward better spatial resolution</li>
                                        <li>• <strong>Predator Presence:</strong> Drives evolution of motion detection and wide field vision</li>
                                        <li>• <strong>Selection Pressure:</strong> Determines rate of evolutionary change</li>
                                    </ul>
                                </div>
                                
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Convergent Evolution</h3>
                                    <p className="mb-3">
                                        Similar eye types evolve independently in different lineages when faced with 
                                        similar environmental challenges. This simulation shows:
                                    </p>
                                    <ul className="space-y-2 text-sm">
                                        <li>• Camera eyes evolved in vertebrates, cephalopods, and some jellyfish</li>
                                        <li>• Compound eyes appeared in arthropods and some mollusks</li>
                                        <li>• Mirror eyes developed in scallops and some crustaceans</li>
                                        <li>• Each represents an optimal solution to specific visual challenges</li>
                                    </ul>
                                </div>
                                
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Key Innovations</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <h4 className="text-sm font-semibold text-white">Photoreceptor Proteins</h4>
                                            <p className="text-sm text-gray-400">
                                                Opsins and related proteins that convert light into neural signals are 
                                                ancient and highly conserved across all seeing organisms.
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-white">Crystallin Lenses</h4>
                                            <p className="text-sm text-gray-400">
                                                Transparent proteins that focus light evolved multiple times from 
                                                different metabolic enzymes co-opted for optical properties.
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-white">Image Processing</h4>
                                            <p className="text-sm text-gray-400">
                                                Neural circuits for edge detection, motion processing, and pattern 
                                                recognition co-evolved with optical improvements.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Evolutionary Timeline</h3>
                                    <ol className="space-y-2 text-sm">
                                        <li><strong>~600 MYA:</strong> First light-sensitive proteins in single cells</li>
                                        <li><strong>~550 MYA:</strong> Simple eyespots in early bilaterians</li>
                                        <li><strong>~540 MYA:</strong> Cambrian explosion - rapid eye diversification</li>
                                        <li><strong>~500 MYA:</strong> First camera and compound eyes</li>
                                        <li><strong>~400 MYA:</strong> Terrestrial adaptations for vision in air</li>
                                        <li><strong>Present:</strong> Continued refinement and specialization</li>
                                    </ol>
                                </div>
                                
                                <div className="mt-8 p-6 border border-gray-800">
                                    <h3 className="text-lg font-semibold text-white mb-3">References & Further Reading</h3>
                                    <ul className="space-y-1 text-sm text-gray-400">
                                        <li>• Nilsson & Pelger (1994) - &quot;A pessimistic estimate of the time required for an eye to evolve&quot;</li>
                                        <li>• Land & Fernald (1992) - &quot;The evolution of eyes&quot;</li>
                                        <li>• Nick Lane - &quot;Life Ascending: The Ten Great Inventions of Evolution&quot;</li>
                                        <li>• Parker (2003) - &quot;In the Blink of an Eye&quot;</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )
                }
            ]}
            settings={
                <Settings
                    generations={generations}
                    setGenerations={setGenerations}
                    populationSize={populationSize}
                    setPopulationSize={setPopulationSize}
                    mutationRate={mutationRate}
                    setMutationRate={setMutationRate}
                    selectionPressure={selectionPressure}
                    setSelectionPressure={setSelectionPressure}
                    lightIntensity={lightIntensity}
                    setLightIntensity={setLightIntensity}
                    environmentComplexity={environmentComplexity}
                    setEnvironmentComplexity={setEnvironmentComplexity}
                    predatorPresence={predatorPresence}
                    setPredatorPresence={setPredatorPresence}
                    eyespotThreshold={eyespotThreshold}
                    setEyespotThreshold={setEyespotThreshold}
                    pitEyeThreshold={pitEyeThreshold}
                    setPitEyeThreshold={setPitEyeThreshold}
                    pinholeThreshold={pinholeThreshold}
                    setPinholeThreshold={setPinholeThreshold}
                    lensThreshold={lensThreshold}
                    setLensThreshold={setLensThreshold}
                    compoundThreshold={compoundThreshold}
                    setCompoundThreshold={setCompoundThreshold}
                    showPhylogeny={showPhylogeny}
                    setShowPhylogeny={setShowPhylogeny}
                    showFitnessLandscape={showFitnessLandscape}
                    setShowFitnessLandscape={setShowFitnessLandscape}
                    convergentEvolution={convergentEvolution}
                    setConvergentEvolution={setConvergentEvolution}
                    speedMs={speedMs}
                    setSpeedMs={setSpeedMs}
                    onReset={handleReset}
                    onExport={handleExport}
                />
            }
        />
    );
}
