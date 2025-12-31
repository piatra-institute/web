'use client';

import { useRef, useEffect, ReactNode } from 'react';

interface NoStrictModeProps {
    children: ReactNode;
}

export default function NoStrictMode({ children }: NoStrictModeProps) {
    const renderCount = useRef(0);
    
    useEffect(() => {
        renderCount.current++;
        console.log('NoStrictMode render count:', renderCount.current);
    }, []);
    
    // In production, StrictMode doesn't double-render
    // In development, we'll only render children on odd render counts
    if (process.env.NODE_ENV === 'development' && renderCount.current % 2 === 0) {
        return null;
    }
    
    return <>{children}</>;
}