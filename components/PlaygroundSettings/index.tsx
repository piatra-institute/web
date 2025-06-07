'use client';

import { ReactNode } from 'react';

export interface SettingsSection {
    title?: string;
    content: ReactNode;
}

export interface PlaygroundSettingsProps {
    title?: string;
    sections: SettingsSection[];
    className?: string;
}

export default function PlaygroundSettings({
    title = 'Settings',
    sections,
    className = '',
}: PlaygroundSettingsProps) {
    return (
        <div className={`flex flex-col items-center ${className}`}>
            <h2 className="text-2xl font-bold mb-6">{title}</h2>
            
            <div className="w-full max-w-md space-y-8">
                {sections.map((section, index) => (
                    <div key={index} className="space-y-4">
                        {section.title && (
                            <h3 className="text-lg font-semibold mb-3 text-white/80">
                                {section.title}
                            </h3>
                        )}
                        <div className="space-y-3">
                            {section.content}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}