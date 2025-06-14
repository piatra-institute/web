'use client';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import Input from '@/components/Input';
import { useState } from 'react';

export default function LifesongPlayground() {
    const [tempo, setTempo] = useState(120);
    const [complexity, setComplexity] = useState(5);

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
            content: (
                <div className="mt-12">
                    <p className="text-xl text-gray-300 mb-4">
                        Musical patterns that emerge from biological processes
                    </p>
                    <p className="text-gray-400">
                        Explore how the rhythms and patterns of life itself can be translated 
                        into musical compositions, creating soundscapes that reflect the 
                        underlying harmony of biological systems.
                    </p>
                </div>
            ),
        },
        {
            id: 'composition',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer>
                    <div className="flex items-center justify-center w-full h-64 border-2 border-dashed border-gray-600 rounded-lg">
                        <div className="text-center text-gray-400">
                            <div className="text-6xl mb-4">🎵</div>
                            <p className="text-lg mb-2">Simulation Coming Soon</p>
                            <p className="text-sm">Life-inspired musical compositions will be generated here</p>
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
                            Lifesong explores the musical dimensions of biological processes, 
                            translating the rhythms of life into audible compositions. From the 
                            steady beat of a heart to the complex patterns of neural activity, 
                            life itself is inherently musical.
                        </p>
                        <p>
                            This playground generates musical compositions based on various 
                            biological data sources: cellular oscillations, population dynamics, 
                            genetic sequences, and metabolic cycles all contribute to unique 
                            soundscapes that reflect the underlying patterns of life.
                        </p>
                        <p>
                            Key concepts include: biological rhythm analysis, data sonification, 
                            algorithmic composition, and the mathematical relationships between 
                            biological patterns and musical harmony.
                        </p>
                </div>
            ),
        },
    ];

    const settings = (
        <PlaygroundSettings
            sections={[
                {
                    title: 'Musical Parameters',
                    content: (
                        <>
                            <Input
                                value={tempo}
                                onChange={(e) => setTempo(parseInt(e) || 60)}
                                label="Tempo (BPM)"
                                compact={true}
                                type="number"
                                min={60}
                                max={200}
                            />
                            <Input
                                value={complexity}
                                onChange={(e) => setComplexity(parseInt(e) || 1)}
                                label="Complexity Level"
                                compact={true}
                                type="number"
                                min={1}
                                max={10}
                            />
                        </>
                    ),
                },
            ]}
        />
    );

    return (
        <PlaygroundLayout
            title="Lifesong"
            subtitle="Musical Patterns from Biological Processes"
            sections={sections}
            settings={settings}
        />
    );
}
