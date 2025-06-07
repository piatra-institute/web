'use client';

import { ReactNode } from 'react';

export interface PlaygroundViewerProps {
    children: ReactNode;
    controls?: ReactNode;
    className?: string;
}

export default function PlaygroundViewer({
    children,
    controls,
    className = '',
}: PlaygroundViewerProps) {
    return (
        <div className={`relative w-full h-full flex flex-col items-center justify-center ${className}`}>
            <div className="flex-1 w-full flex items-center justify-center">
                {children}
            </div>
            
            {controls && (
                <div className="mt-12 mb-8 space-y-6 flex flex-col items-center">
                    {controls}
                </div>
            )}
        </div>
    );
}