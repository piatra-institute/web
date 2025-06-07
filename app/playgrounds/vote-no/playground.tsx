'use client';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import Input from '@/components/Input';
import { useState } from 'react';

export default function VoteNoPlayground() {
    const [abstentionRate, setAbstentionRate] = useState(0.2);
    const [polarization, setPolarization] = useState(0.5);

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
            content: (
                <div className="mt-12">
                    <p className="text-xl text-gray-300 mb-4">
                        Exploring democratic resistance and the power of rejection
                    </p>
                    <p className="text-gray-400">
                        Analyze the dynamics of &quot;no&quot; votes, abstentions, and democratic resistance 
                        as mechanisms for social change and political expression in various 
                        governance systems.
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
                            <div className="text-6xl mb-4">🗳️</div>
                            <p className="text-lg mb-2">Simulation Coming Soon</p>
                            <p className="text-sm">Voting dynamics and resistance patterns will be visualized here</p>
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
                            Vote No explores the often-overlooked power of rejection in democratic 
                            systems. While much attention is given to what people vote for, the 
                            dynamics of what they vote against—and why—reveal crucial insights 
                            about social movements, resistance, and democratic health.
                        </p>
                        <p>
                            This playground simulates various scenarios where &quot;no&quot; votes, abstentions, 
                            and organized resistance shape political outcomes. From referendum defeats 
                            to parliamentary opposition, the power to reject is as fundamental to 
                            democracy as the power to approve.
                        </p>
                        <p>
                            Key concepts include: democratic resistance theory, abstention patterns, 
                            coalition building for opposition, strategic voting behavior, and the 
                            role of dissent in healthy democracies.
                        </p>
                </div>
            ),
        },
    ];

    const settings = (
        <PlaygroundSettings
            sections={[
                {
                    title: 'Democratic Parameters',
                    content: (
                        <>
                            <Input
                                value={abstentionRate}
                                onChange={(e) => setAbstentionRate(parseFloat(e) || 0)}
                                label="Abstention Rate"
                                compact={true}
                                type="number"
                                min={0}
                                max={1}
                                step={0.1}
                            />
                            <Input
                                value={polarization}
                                onChange={(e) => setPolarization(parseFloat(e) || 0)}
                                label="Political Polarization"
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
            title="Vote No"
            subtitle="Democratic Resistance and the Power of Rejection"
            sections={sections}
            settings={settings}
        />
    );
}
