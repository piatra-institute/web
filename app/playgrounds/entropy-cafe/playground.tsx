'use client';

import { useState, useRef, useCallback } from 'react';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import PlaygroundSettings from '@/components/PlaygroundSettings';

import CoffeeSimulation from './components/CoffeeSimulation';
import Settings from './components/Settings';
import MetricsOverlay from './components/MetricsOverlay';



interface SimulationState {
    isPaused: boolean;
    isStirring: boolean;
    entropyValue: number;
    complexityValue: number;
    entropyHistory: number[];
    complexityHistory: number[];
}

export default function EntropyCafePlayground() {
    const simulationRef = useRef<any>(null);
    const [simulationState, setSimulationState] = useState<SimulationState>({
        isPaused: false,
        isStirring: false,
        entropyValue: 0,
        complexityValue: 0,
        entropyHistory: [],
        complexityHistory: [],
    });

    const handleAddCream = () => {
        simulationRef.current?.addCream();
    };

    const handleStir = () => {
        const newStirringState = !simulationState.isStirring;
        setSimulationState(prev => ({ ...prev, isStirring: newStirringState }));
        simulationRef.current?.setStirring(newStirringState);
    };

    const handleReset = () => {
        simulationRef.current?.reset();
        setSimulationState({
            isPaused: false,
            isStirring: false,
            entropyValue: 0,
            complexityValue: 0,
            entropyHistory: [],
            complexityHistory: [],
        });
    };

    const handlePause = () => {
        const newPausedState = !simulationState.isPaused;
        setSimulationState(prev => ({ ...prev, isPaused: newPausedState }));
        simulationRef.current?.setPaused(newPausedState);
    };

    const handleMetricsUpdate = useCallback((entropy: number, complexity: number) => {
        setSimulationState(prev => ({
            ...prev,
            entropyValue: entropy,
            complexityValue: complexity,
            entropyHistory: [...prev.entropyHistory.slice(-99), entropy],
            complexityHistory: [...prev.complexityHistory.slice(-99), complexity],
        }));
    }, []);

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
        },
        {
            id: 'canvas',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer>
                    <div className="relative w-full h-full">
                        <CoffeeSimulation
                            ref={simulationRef}
                            onMetricsUpdate={handleMetricsUpdate}
                        />
                        <MetricsOverlay
                            entropyValue={simulationState.entropyValue}
                            complexityValue={simulationState.complexityValue}
                            entropyHistory={simulationState.entropyHistory}
                            complexityHistory={simulationState.complexityHistory}
                        />
                    </div>
                </PlaygroundViewer>
            ),
        },
        {
            id: 'outro',
            type: 'outro' as const,
            content: (
                <>
                    <p>
                        Sean M. Carroll uses coffee and cream mixing as a metaphor for entropy in the universe. The unmixed state has low entropy: ordered and simple. When the fluids mix, entropy increases and creates swirls of intermediate complexity. The final state is uniformly mixed with high entropy but simple structure again.
                    </p>
                    <p>
                        This parallels the universe&apos;s evolution from a simple, low-entropy beginning through the complex present, toward a simple, high-entropy future. The apparent contradiction between increasing entropy and emerging complexity is resolved by recognizing that Earth is not a closed system. It receives low-entropy energy from the sun and radiates high-entropy heat to space.
                    </p>
                    <p>
                        Organizing a room decreases local entropy while increasing universal entropy through the work performed. Similarly, life creates local order by accelerating the universe&apos;s overall entropy increase. Complexity emerges not despite the second law of thermodynamics, but because of it. Systems ride the gradient from order to disorder.
                    </p>
                </>
            ),
        },
    ];

    const settings = (
        <PlaygroundSettings
            sections={[
                {
                    content: (
                        <Settings
                            isPaused={simulationState.isPaused}
                            isStirring={simulationState.isStirring}
                            onAddCream={handleAddCream}
                            onStir={handleStir}
                            onReset={handleReset}
                            onPause={handlePause}
                        />
                    ),
                },
            ]}
        />
    );

    return (
        <PlaygroundLayout
            title="entropy cafe"
            subtitle="a 3D particle simulation exploring entropy and complexity"
            description={<a href="https://www.youtube.com/watch?v=SWP2ktac34k" target="_blank" rel="noopener noreferrer" className="underline">
                Sean M. Carroll&apos;s coffee mixing metaphor
            </a>}
            sections={sections}
            settings={settings}
        />
    );
}
