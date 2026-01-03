'use client';

import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export interface EquationProps {
    /** The LaTeX equation string */
    math: string;

    /** Display mode: inline (within text) or block (centered on own line) */
    mode?: 'inline' | 'block';

    /** Optional extra Tailwind / CSS classes */
    className?: string;
}

const Equation: React.FC<EquationProps> = ({
    math,
    mode = 'inline',
    className = '',
}) => {
    if (mode === 'block') {
        return (
            <div className={`my-4 overflow-x-auto max-w-full ${className}`}>
                <div className="min-w-fit">
                    <BlockMath math={math} />
                </div>
            </div>
        );
    }

    return (
        <span className={className}>
            <InlineMath math={math} />
        </span>
    );
};

export default Equation;
