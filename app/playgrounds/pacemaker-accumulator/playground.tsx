'use client';

import { useState, useRef } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Settings from './components/Settings';
import Viewer from './components/Viewer';

export default function PacemakerAccumulatorPlayground() {
    // Simulation parameters
    const [duration, setDuration] = useState(30);
    const [speedMs, setSpeedMs] = useState(50);
    
    // Pacemaker parameters
    const [pacemakerRate, setPacemakerRate] = useState(3.0);
    const [pacemakerNoise, setPacemakerNoise] = useState(0.1);
    const [pacemakerAdaptation, setPacemakerAdaptation] = useState(0.02);
    
    // Accumulator parameters
    const [accumulatorThreshold, setAccumulatorThreshold] = useState(25);
    const [accumulatorDecay, setAccumulatorDecay] = useState(0.01);
    const [accumulatorNoise, setAccumulatorNoise] = useState(0.5);
    
    // Multiple timescales
    const [fastPacemaker, setFastPacemaker] = useState(20);
    const [slowPacemaker, setSlowPacemaker] = useState(1.0);
    const [scaleInteraction, setScaleInteraction] = useState(0.3);
    
    // Interval timing task
    const [targetInterval, setTargetInterval] = useState(5.0);
    const [intervalVariability, setIntervalVariability] = useState(0.15);
    
    // Neural realism
    const [neuralNoise, setNeuralNoise] = useState(0.2);
    const [refractoryPeriod, setRefractoryPeriod] = useState(5);

    const [refreshKey, setRefreshKey] = useState(0);
    const viewerRef = useRef<{ exportCanvas: () => void }>(null);

    const handleReset = () => {
        setDuration(30);
        setSpeedMs(50);
        setPacemakerRate(3.0);
        setPacemakerNoise(0.1);
        setPacemakerAdaptation(0.02);
        setAccumulatorThreshold(25);
        setAccumulatorDecay(0.01);
        setAccumulatorNoise(0.5);
        setFastPacemaker(20);
        setSlowPacemaker(1.0);
        setScaleInteraction(0.3);
        setTargetInterval(5.0);
        setIntervalVariability(0.15);
        setNeuralNoise(0.2);
        setRefractoryPeriod(5);
        setRefreshKey(prev => prev + 1);
    };

    const handleExport = () => {
        viewerRef.current?.exportCanvas();
    };

    return (
        <PlaygroundLayout
            title="pacemaker-accumulator"
            subtitle="biological timing mechanisms"
            sections={[
                {
                    id: 'intro',
                    type: 'intro',
                    content: (
                        <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                            <h2 className="text-2xl font-bold text-white mb-4">Neural Timing Mechanisms</h2>
                            <p>
                                This simulation explores the <strong className="font-semibold text-lime-400">pacemaker-accumulator model</strong> of 
                                interval timing, a fundamental mechanism by which biological systems measure and 
                                reproduce temporal durations.
                            </p>
                            <p>
                                Based on research by Stanislas Dehaene and others, the model explains how neurons 
                                combine regular <strong className="text-white">pacemaker oscillations</strong> with 
                                a <strong className="text-white">leaky integrator</strong> to achieve precise timing 
                                despite noisy neural components.
                            </p>
                            <div className="bg-black border border-gray-800 p-4 mt-4">
                                <h3 className="text-sm font-semibold text-lime-400 mb-2">Key Components:</h3>
                                <ul className="space-y-1 text-sm">
                                    <li><strong className="text-white">Pacemaker:</strong> Regular neural oscillations generate timing pulses</li>
                                    <li><strong className="text-white">Accumulator:</strong> Integrates pulses with decay and noise</li>
                                    <li><strong className="text-white">Threshold:</strong> Decision boundary triggers timing responses</li>
                                    <li><strong className="text-white">Multiple Scales:</strong> Fast/slow oscillations interact via coupling</li>
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
                                duration={duration}
                                speedMs={speedMs}
                                pacemakerRate={pacemakerRate}
                                pacemakerNoise={pacemakerNoise}
                                pacemakerAdaptation={pacemakerAdaptation}
                                accumulatorThreshold={accumulatorThreshold}
                                accumulatorDecay={accumulatorDecay}
                                accumulatorNoise={accumulatorNoise}
                                fastPacemaker={fastPacemaker}
                                slowPacemaker={slowPacemaker}
                                scaleInteraction={scaleInteraction}
                                targetInterval={targetInterval}
                                intervalVariability={intervalVariability}
                                neuralNoise={neuralNoise}
                                refractoryPeriod={refractoryPeriod}
                            />
                        </PlaygroundViewer>
                    )
                },
                {
                    id: 'outro',
                    type: 'outro',
                    content: (
                        <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                            <h2 className="text-2xl font-bold text-white mb-6">Understanding Biological Timing</h2>
                            
                            <div className="space-y-6">
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Weber&apos;s Law in Timing</h3>
                                    <p className="mb-3">
                                        A fundamental property of biological timing is that variability scales 
                                        with duration - longer intervals are timed less precisely than shorter ones.
                                    </p>
                                    <div className="bg-black border border-gray-800 p-3 mb-3 font-mono text-sm">
                                        CV = σ/μ ≈ constant
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        This &quot;scalar property&quot; emerges naturally from pacemaker-accumulator dynamics 
                                        and is observed across species from insects to humans.
                                    </p>
                                </div>
                                
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Neural Implementation</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>• <strong>Striatum:</strong> Contains timing-sensitive neurons that may implement accumulation</li>
                                        <li>• <strong>Cortical Oscillations:</strong> Provide pacemaker signals at multiple frequencies</li>
                                        <li>• <strong>Cerebellar Circuits:</strong> Support precise sub-second timing mechanisms</li>
                                        <li>• <strong>Dopamine System:</strong> Modulates pacemaker speed and attention to time</li>
                                    </ul>
                                </div>
                                
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Cross-Frequency Coupling</h3>
                                    <p className="text-sm">
                                        The simulation demonstrates how fast and slow neural oscillations interact 
                                        to create complex timing behaviors. This cross-frequency coupling allows 
                                        the brain to represent multiple temporal scales simultaneously, from milliseconds 
                                        to minutes, enabling flexible timing across different contexts.
                                    </p>
                                </div>
                                
                                <div className="mt-8 p-6 border border-gray-800">
                                    <h3 className="text-lg font-semibold text-white mb-3">Applications</h3>
                                    <p className="text-sm text-gray-400">
                                        Understanding biological timing mechanisms has implications for neurodegenerative 
                                        diseases (Parkinson&apos;s affects timing), cognitive development (timing deficits in ADHD), 
                                        and artificial intelligence (implementing temporal cognition in neural networks).
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                }
            ]}
            settings={
                <Settings
                    duration={duration}
                    setDuration={setDuration}
                    speedMs={speedMs}
                    setSpeedMs={setSpeedMs}
                    pacemakerRate={pacemakerRate}
                    setPacemakerRate={setPacemakerRate}
                    pacemakerNoise={pacemakerNoise}
                    setPacemakerNoise={setPacemakerNoise}
                    pacemakerAdaptation={pacemakerAdaptation}
                    setPacemakerAdaptation={setPacemakerAdaptation}
                    accumulatorThreshold={accumulatorThreshold}
                    setAccumulatorThreshold={setAccumulatorThreshold}
                    accumulatorDecay={accumulatorDecay}
                    setAccumulatorDecay={setAccumulatorDecay}
                    accumulatorNoise={accumulatorNoise}
                    setAccumulatorNoise={setAccumulatorNoise}
                    fastPacemaker={fastPacemaker}
                    setFastPacemaker={setFastPacemaker}
                    slowPacemaker={slowPacemaker}
                    setSlowPacemaker={setSlowPacemaker}
                    scaleInteraction={scaleInteraction}
                    setScaleInteraction={setScaleInteraction}
                    targetInterval={targetInterval}
                    setTargetInterval={setTargetInterval}
                    intervalVariability={intervalVariability}
                    setIntervalVariability={setIntervalVariability}
                    neuralNoise={neuralNoise}
                    setNeuralNoise={setNeuralNoise}
                    refractoryPeriod={refractoryPeriod}
                    setRefractoryPeriod={setRefractoryPeriod}
                    onReset={handleReset}
                    onExport={handleExport}
                />
            }
        />
    );
}
