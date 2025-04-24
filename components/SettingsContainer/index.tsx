'use client';

import { useState } from 'react';



export interface SettingsContainerProps {
    children: React.ReactNode;
}

export default function SettingsContainer({
    children,
}: SettingsContainerProps) {
    const [isOpen, setIsOpen] = useState(true);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div
            className="fixed top-2 right-2 bg-black/80 backdrop-blur-xs p-4 w-80 z-20 border border-white/20 text-sm"
        >
            <div className="mb-2 pb-1 border-b border-white/20">
                <h2 className="text-xl">Settings</h2>
            </div>

            {isOpen && (
                <div className="my-4 space-y-3">
                    {children}
                </div>
            )}

            <div className="pt-2 flex justify-center">
                 <button
                    onClick={toggleOpen}
                    className="text-xs w-full text-center"
                    aria-label={isOpen ? "Collapse Settings" : "Expand Settings"}
                    title={isOpen ? "Collapse Settings" : "Expand Settings"}
                >
                    {isOpen ? '▲' : '▼'}
                </button>
            </div>
        </div>
    );
}
