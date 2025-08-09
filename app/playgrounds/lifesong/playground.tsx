'use client';

import { useState, useRef } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Settings from './components/Settings';
import Viewer from './components/Viewer';

export default function LifesongPlayground() {
    // Phase space parameters
    const [dimensions, setDimensions] = useState(3);
    const [attractorType, setAttractorType] = useState('strange');
    const [timeScale, setTimeScale] = useState(1.0);
    const [nonlinearity, setNonlinearity] = useState(0.5);
    
    // Biological rhythms
    const [heartRate, setHeartRate] = useState(72);
    const [breathingRate, setBreathingRate] = useState(16);
    const [brainwaveFreq, setBrainwaveFreq] = useState(10);
    const [circadianPeriod, setCircadianPeriod] = useState(24);
    
    // Musical mapping
    const [scaleType, setScaleType] = useState('pentatonic');
    const [tempo, setTempo] = useState(120);
    const [harmonicComplexity, setHarmonicComplexity] = useState(0.5);
    const [timbreVariation, setTimbreVariation] = useState(0.3);
    
    // Evolutionary parameters
    const [fitnessFunction, setFitnessFunction] = useState('harmony');
    const [mutationRate, setMutationRate] = useState(0.05);
    const [selectionPressure, setSelectionPressure] = useState(0.7);
    
    // Visualization
    const [showPhaseSpace, setShowPhaseSpace] = useState(true);
    const [showRhythms, setShowRhythms] = useState(true);
    const [showSpectrum, setShowSpectrum] = useState(true);
    const [colorMode, setColorMode] = useState('frequency');
    
    // Audio
    const [enableAudio, setEnableAudio] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [speedMs, setSpeedMs] = useState(50);
    const [refreshKey, setRefreshKey] = useState(0);
    
    const viewerRef = useRef<{ exportCanvas: () => void }>(null);
    
    const handleReset = () => {
        setDimensions(3);
        setAttractorType('strange');
        setTimeScale(1.0);
        setNonlinearity(0.5);
        setHeartRate(72);
        setBreathingRate(16);
        setBrainwaveFreq(10);
        setCircadianPeriod(24);
        setScaleType('pentatonic');
        setTempo(120);
        setHarmonicComplexity(0.5);
        setTimbreVariation(0.3);
        setFitnessFunction('harmony');
        setMutationRate(0.05);
        setSelectionPressure(0.7);
        setShowPhaseSpace(true);
        setShowRhythms(true);
        setShowSpectrum(true);
        setColorMode('frequency');
        setEnableAudio(false);
        setVolume(0.5);
        setSpeedMs(50);
        setRefreshKey(prev => prev + 1);
    };
    
    const handleExport = () => {
        viewerRef.current?.exportCanvas();
    };

    return (
        <PlaygroundLayout
            title="lifesong"
            subtitle="musical patterns that emerge from biological rhythms and phase space orbits"
            sections={[
                {
                    id: 'intro',
                    type: 'intro',
                    content: (
                        <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                            <h2 className="text-2xl font-bold text-white mb-4">Life as Orbits in Phase Space</h2>
                            <p>
                                Inspired by <strong className="font-semibold text-lime-400">Richard Watson&apos;s</strong> profound insight that 
                                &quot;life is orbits in phase space,&quot; this playground explores how biological rhythms 
                                create musical patterns when mapped from their dynamical trajectories.
                            </p>
                            <p>
                                Every living system—from heartbeats to neural oscillations—traces paths through 
                                phase space. These orbits encode the temporal patterns that sustain life. When 
                                translated to musical parameters, they reveal the <strong className="font-semibold text-lime-400">hidden songs</strong> 
                                embedded in biological processes.
                            </p>
                            <div className="bg-black border border-gray-800 p-4 mt-4">
                                <h3 className="text-sm font-semibold text-lime-400 mb-2">Key Concepts:</h3>
                                <ul className="space-y-1 text-sm">
                                    <li><strong className="text-white">Phase Space:</strong> Mathematical space where life&apos;s dynamics unfold</li>
                                    <li><strong className="text-white">Attractors:</strong> Stable patterns that biological systems approach</li>
                                    <li><strong className="text-white">Limit Cycles:</strong> Periodic orbits corresponding to biological rhythms</li>
                                    <li><strong className="text-white">Strange Attractors:</strong> Chaotic patterns in complex living systems</li>
                                    <li><strong className="text-white">Sonification:</strong> Translation of dynamical patterns into music</li>
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
                                dimensions={dimensions}
                                attractorType={attractorType}
                                timeScale={timeScale}
                                nonlinearity={nonlinearity}
                                heartRate={heartRate}
                                breathingRate={breathingRate}
                                brainwaveFreq={brainwaveFreq}
                                circadianPeriod={circadianPeriod}
                                scaleType={scaleType}
                                tempo={tempo}
                                harmonicComplexity={harmonicComplexity}
                                timbreVariation={timbreVariation}
                                fitnessFunction={fitnessFunction}
                                mutationRate={mutationRate}
                                selectionPressure={selectionPressure}
                                showPhaseSpace={showPhaseSpace}
                                showRhythms={showRhythms}
                                showSpectrum={showSpectrum}
                                colorMode={colorMode}
                                enableAudio={enableAudio}
                                volume={volume}
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
                            <h2 className="text-2xl font-bold text-white mb-6">The Mathematics of Life&apos;s Music</h2>
                            
                            <div className="space-y-6">
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Phase Space Dynamics</h3>
                                    <p className="mb-3">
                                        In phase space, every point represents the complete state of a biological system. 
                                        The trajectory through this space encodes how the system evolves over time:
                                    </p>
                                    <ul className="space-y-2 text-sm">
                                        <li>• <strong>Fixed Points:</strong> Stable states (musical drones, sustained notes)</li>
                                        <li>• <strong>Limit Cycles:</strong> Periodic behaviors (rhythms, melodies)</li>
                                        <li>• <strong>Tori:</strong> Multi-periodic motion (polyrhythms, harmonics)</li>
                                        <li>• <strong>Strange Attractors:</strong> Chaotic patterns (improvisation, variation)</li>
                                    </ul>
                                </div>
                                
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Biological Rhythms</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">Cardiac Dynamics</h4>
                                            <p className="text-sm">Heart rate variability creates natural tempo and rhythm variations</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">Respiratory Cycles</h4>
                                            <p className="text-sm">Breathing patterns influence phrasing and melodic contour</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">Neural Oscillations</h4>
                                            <p className="text-sm">Brainwaves provide harmonic frequencies and timbral content</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">Circadian Rhythms</h4>
                                            <p className="text-sm">Daily cycles modulate long-term musical form and structure</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Sonification Methods</h3>
                                    <p className="mb-3">Converting dynamical patterns into musical parameters:</p>
                                    <ul className="space-y-2 text-sm">
                                        <li>• <strong>Position → Pitch:</strong> Spatial coordinates map to musical notes</li>
                                        <li>• <strong>Velocity → Rhythm:</strong> Rate of change determines temporal patterns</li>
                                        <li>• <strong>Trajectory → Melody:</strong> Path through space becomes melodic line</li>
                                        <li>• <strong>Attractor Shape → Harmony:</strong> Geometric structure defines chord progressions</li>
                                        <li>• <strong>Lyapunov Exponents → Timbre:</strong> Chaos levels control sound texture</li>
                                    </ul>
                                </div>
                                
                                <div className="mt-8 p-6 border border-gray-800">
                                    <h3 className="text-lg font-semibold text-white mb-3">References & Inspiration</h3>
                                    <ul className="space-y-1 text-sm text-gray-400">
                                        <li>• Richard Watson - &quot;Life is orbits in phase space&quot;</li>
                                        <li>• Stuart Kauffman - &quot;The Origins of Order: Self-Organization and Selection&quot;</li>
                                        <li>• Hermann & Ritter - &quot;Listen to your data: Model-based sonification&quot;</li>
                                        <li>• Glass & Mackey - &quot;From Clocks to Chaos: The Rhythms of Life&quot;</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )
                }
            ]}
            settings={
                <Settings
                    dimensions={dimensions}
                    setDimensions={setDimensions}
                    attractorType={attractorType}
                    setAttractorType={setAttractorType}
                    timeScale={timeScale}
                    setTimeScale={setTimeScale}
                    nonlinearity={nonlinearity}
                    setNonlinearity={setNonlinearity}
                    heartRate={heartRate}
                    setHeartRate={setHeartRate}
                    breathingRate={breathingRate}
                    setBreathingRate={setBreathingRate}
                    brainwaveFreq={brainwaveFreq}
                    setBrainwaveFreq={setBrainwaveFreq}
                    circadianPeriod={circadianPeriod}
                    setCircadianPeriod={setCircadianPeriod}
                    scaleType={scaleType}
                    setScaleType={setScaleType}
                    tempo={tempo}
                    setTempo={setTempo}
                    harmonicComplexity={harmonicComplexity}
                    setHarmonicComplexity={setHarmonicComplexity}
                    timbreVariation={timbreVariation}
                    setTimbreVariation={setTimbreVariation}
                    fitnessFunction={fitnessFunction}
                    setFitnessFunction={setFitnessFunction}
                    mutationRate={mutationRate}
                    setMutationRate={setMutationRate}
                    selectionPressure={selectionPressure}
                    setSelectionPressure={setSelectionPressure}
                    showPhaseSpace={showPhaseSpace}
                    setShowPhaseSpace={setShowPhaseSpace}
                    showRhythms={showRhythms}
                    setShowRhythms={setShowRhythms}
                    showSpectrum={showSpectrum}
                    setShowSpectrum={setShowSpectrum}
                    colorMode={colorMode}
                    setColorMode={setColorMode}
                    enableAudio={enableAudio}
                    setEnableAudio={setEnableAudio}
                    volume={volume}
                    setVolume={setVolume}
                    speedMs={speedMs}
                    setSpeedMs={setSpeedMs}
                    onReset={handleReset}
                    onExport={handleExport}
                />
            }
        />
    );
}