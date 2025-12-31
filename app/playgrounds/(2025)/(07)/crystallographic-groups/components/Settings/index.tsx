import React from 'react';
import PlaygroundSettings from '@/components/PlaygroundSettings';

interface SettingsProps {
    activeTab: '2d' | '3d' | '4d';
    onTabChange: (tab: '2d' | '3d' | '4d') => void;
}

export default function Settings({ activeTab, onTabChange }: SettingsProps) {
    const tabs = [
        { id: '2d' as const, label: '2D Wallpaper', description: '17 plane symmetry groups' },
        { id: '3d' as const, label: '3D Space', description: 'Crystal symmetries' },
        { id: '4d' as const, label: '4D Space', description: 'Hypercubic patterns' },
    ];

    const sections = [
        {
            title: 'Dimension',
            content: (
                <div className="space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`w-full text-left p-3 transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-black border border-lime-500 text-lime-400'
                                    : 'bg-black border border-gray-800 hover:border-gray-600 text-gray-400'
                            }`}
                        >
                            <div className="font-medium">{tab.label}</div>
                            <div className="text-sm opacity-70">{tab.description}</div>
                        </button>
                    ))}
                </div>
            ),
        },
    ];

    return <PlaygroundSettings sections={sections} />;
}