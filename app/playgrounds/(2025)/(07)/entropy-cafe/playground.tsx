'use client';

import { useState, useRef, useCallback } from 'react';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundSettings from '@/components/PlaygroundSettings';

import Viewer, { ViewerRef } from './components/Viewer';
import Settings from './components/Settings';



export default function EntropyCafePlayground() {
    const viewerRef = useRef<ViewerRef>(null);
    const [isStirring, setIsStirring] = useState(false);
    const [entropy, setEntropy] = useState(0);
    const [mixedness, setMixedness] = useState(0);

    const handleEntropyChange = useCallback((newEntropy: number, newMixedness: number) => {
        setEntropy(newEntropy);
        setMixedness(newMixedness);
    }, []);

    const handleStirToggle = () => {
        setIsStirring(prev => !prev);
    };

    const handleStirOnce = () => {
        viewerRef.current?.stir();
    };

    const handleReset = () => {
        viewerRef.current?.reset();
        setEntropy(0);
        setMixedness(0);
    };

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
        },
        {
            id: 'canvas',
            type: 'canvas' as const,
            content: (
                <div className="absolute inset-0">
                    <Viewer
                        ref={viewerRef}
                        isStirring={isStirring}
                        onEntropyChange={handleEntropyChange}
                    />
                </div>
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
                            isStirring={isStirring}
                            entropy={entropy}
                            mixedness={mixedness}
                            onStirToggle={handleStirToggle}
                            onReset={handleReset}
                            onStirOnce={handleStirOnce}
                        />
                    ),
                },
            ]}
        />
    );

    return (
        <PlaygroundLayout
            title="entropy café"
            subtitle="coffee and cream mixing as a metaphor for entropy"
            description={(
                <>
                    Based on{' '}
                    <a href="https://www.youtube.com/watch?v=SWP2ktac34k" target="_blank" rel="noopener noreferrer" className="underline">
                        Sean M. Carroll&apos;s coffee mixing metaphor
                    </a>
                    {' '}for the second law of thermodynamics.
                </>
            )}
            sections={sections}
            settings={settings}
        />
    );
}
