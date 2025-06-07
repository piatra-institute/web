'use client';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import Input from '@/components/Input';
import { useState } from 'react';

export default function EyevolutionPlayground() {
    const [generations, setGenerations] = useState(100);
    const [mutationRate, setMutationRate] = useState(0.05);

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
            content: (
                <div className="mt-12">
                    <p className="text-xl text-gray-300 mb-4">
                        Evolutionary development of visual systems across species
                    </p>
                    <p className="text-gray-400">
                        Simulate the evolutionary pressures and developmental pathways that led 
                        to the remarkable diversity of eyes found in nature, from simple light-sensitive 
                        spots to complex compound and camera eyes.
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
                            <div className="text-6xl mb-4">👁️</div>
                            <p className="text-lg mb-2">Simulation Coming Soon</p>
                            <p className="text-sm">Eye evolution dynamics will be visualized here</p>
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
                            The evolution of eyes represents one of the most fascinating examples of 
                            convergent evolution in nature. Eyes have evolved independently dozens 
                            of times, each time solving the fundamental challenge of converting 
                            light into useful information.
                        </p>
                        <p>
                            This playground simulates the evolutionary pressures and developmental 
                            constraints that shaped different types of visual systems, from the 
                            simple eyespots of flatworms to the sophisticated compound eyes of 
                            insects and the camera eyes of vertebrates.
                        </p>
                        <p>
                            Key concepts include: photoreceptor evolution, optical physics constraints, 
                            neural processing development, and the trade-offs between different 
                            visual system architectures.
                        </p>
                </div>
            ),
        },
    ];

    const settings = (
        <PlaygroundSettings
            sections={[
                {
                    title: 'Evolution Parameters',
                    content: (
                        <>
                            <Input
                                value={generations}
                                onChange={(e) => setGenerations(parseInt(e) || 1)}
                                label="Generations"
                                compact={true}
                                type="number"
                                min={1}
                                max={1000}
                            />
                            <Input
                                value={mutationRate}
                                onChange={(e) => setMutationRate(parseFloat(e) || 0)}
                                label="Mutation Rate"
                                compact={true}
                                type="number"
                                min={0}
                                max={1}
                                step={0.01}
                            />
                        </>
                    ),
                },
            ]}
        />
    );

    return (
        <PlaygroundLayout
            title="Eyevolution"
            subtitle="Evolutionary Development of Visual Systems"
            sections={sections}
            settings={settings}
        />
    );
}
