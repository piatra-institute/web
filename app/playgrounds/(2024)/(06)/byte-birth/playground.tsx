'use client';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import Input from '@/components/Input';
import { useState } from 'react';

export default function ByteBirthPlayground() {
    const [birthRate, setBirthRate] = useState(0.3);
    const [complexity, setComplexity] = useState(8);

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
            content: (
                <div className="mt-12">
                    <p className="text-xl text-gray-300 mb-4">
                        The emergence of digital life from computational primitives
                    </p>
                    <p className="text-gray-400">
                        Explore how simple computational rules can give rise to complex, 
                        self-organizing digital organisms through emergent byte-level interactions.
                    </p>
                </div>
            ),
        },
        {
            id: 'simulation',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer>
                    <div className="flex items-center justify-center w-full h-64 border-2 border-dashed border-gray-600 rounded-lg">
                        <div className="text-center text-gray-400">
                            <div className="text-6xl mb-4">🧬</div>
                            <p className="text-lg mb-2">Simulation Coming Soon</p>
                            <p className="text-sm">Digital life emergence will be visualized here</p>
                        </div>
                    </div>
                </PlaygroundViewer>
            ),
        },
        {
            id: 'about',
            type: 'outro' as const,
            content: (
                <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                        <p>
                            Byte Birth investigates the fundamental question of how digital life might 
                            emerge from simple computational processes. Starting with basic byte-level 
                            operations, we explore how complexity can arise through iteration and 
                            self-organization.
                        </p>
                        <p>
                            The simulation models various scenarios where computational primitives 
                            combine to create increasingly sophisticated behaviors, potentially leading 
                            to digital organisms with emergent properties.
                        </p>
                        <p>
                            Key concepts include: computational evolution, self-replication, emergent 
                            complexity, and the minimal requirements for digital life.
                        </p>
                </div>
            ),
        },
    ];

    const settings = (
        <PlaygroundSettings
            sections={[
                {
                    title: 'Birth Parameters',
                    content: (
                        <>
                            <Input
                                value={birthRate}
                                onChange={(e) => setBirthRate(parseFloat(e) || 0)}
                                label="Birth Rate"
                                compact={true}
                                type="number"
                                min={0}
                                max={1}
                                step={0.1}
                            />
                            <Input
                                value={complexity}
                                onChange={(e) => setComplexity(parseInt(e) || 1)}
                                label="Initial Complexity"
                                compact={true}
                                type="number"
                                min={1}
                                max={16}
                            />
                        </>
                    ),
                },
            ]}
        />
    );

    return (
        <PlaygroundLayout
            title="Byte Birth"
            subtitle="Emergence of Digital Life"
            sections={sections}
            settings={settings}
        />
    );
}