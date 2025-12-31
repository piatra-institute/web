'use client';

import React, { forwardRef, useImperativeHandle } from 'react';

export interface CaptureHandle {
    capture: () => string;
}

interface CaptureHelperProps {
    children: React.ReactNode;
}

const CaptureHelper = forwardRef<CaptureHandle, CaptureHelperProps>(
    (props, ref) => {
        const { children } = props;
        const containerRef = React.useRef<HTMLDivElement>(null);

        useImperativeHandle(ref, () => ({
            capture: () => {
                if (!containerRef.current) return '';
                
                // Find canvas elements in the container
                const canvasElements = containerRef.current.querySelectorAll('canvas');
                
                if (canvasElements.length === 0) return '';
                
                // Use the first canvas for simplicity
                return canvasElements[0].toDataURL('image/png');
            },
        }));

        return (
            <div ref={containerRef} className="w-full h-full">
                {children}
            </div>
        );
    }
);

CaptureHelper.displayName = 'CaptureHelper';

export default CaptureHelper;