'use client';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import Input from '@/components/Input';
import { useState } from 'react';

export default function ArtificialDeathPlayground() {
    const [parameter1, setParameter1] = useState(50);
    const [parameter2, setParameter2] = useState(0.5);

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
        },
        {
            id: 'simulation',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer>
                    <div className="flex items-center justify-center w-full h-64 border-2 border-dashed border-gray-600 rounded-lg">
                        <div className="text-center text-gray-400">
                            <div className="text-6xl mb-4">⚱️</div>
                            <p className="text-lg mb-2">Simulation Coming Soon</p>
                            <p className="text-sm">Artificial death dynamics will be visualized here</p>
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
                            Artificial death explores the philosophical and technical aspects of how digital 
                            entities might experience termination. Unlike biological death, artificial death 
                            can be reversible, partial, or distributed across multiple systems.
                        </p>
                        <p>
                            This playground will simulate various models of digital mortality, including 
                            graceful degradation, sudden termination, and gradual decay of artificial 
                            consciousness or intelligence.
                        </p>
                        <p>
                            Key concepts include: state preservation, consciousness transfer, memory decay, 
                            and the ethical implications of terminating artificial beings.
                        </p>
                </div>
            ),
        },
    ];

    const settings = (
        <PlaygroundSettings
            sections={[
                {
                    title: 'Death Parameters',
                    content: (
                        <>
                            <Input
                                value={parameter1}
                                onChange={(e) => setParameter1(parseInt(e) || 0)}
                                label="Decay Rate"
                                compact={true}
                                type="number"
                                min={0}
                                max={100}
                            />
                            <Input
                                value={parameter2}
                                onChange={(e) => setParameter2(parseFloat(e) || 0)}
                                label="Termination Threshold"
                                compact={true}
                                type="number"
                                min={0}
                                max={1}
                                step={0.1}
                            />
                        </>
                    ),
                },
            ]}
        />
    );

    return (
        <PlaygroundLayout
            title="Artificial Death"
            subtitle="digital mortality and computational termination; investigation into how digital entities might experience termination and decay"
            sections={sections}
            settings={settings}
        />
    );
}