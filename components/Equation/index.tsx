'use client';

import React, { useEffect } from 'react';
import { InlineMath, BlockMath } from 'react-katex';


export interface EquationProps {
    /** The LaTeX equation string */
    math: string;

    /** Display mode: inline (within text) or block (centered on own line) */
    mode?: 'inline' | 'block';

    /** Optional extra Tailwind / CSS classes */
    className?: string;
}


// the KaTeX stylesheet is ~60 KB gzipped. it used to be statically imported
// here, which made every page that statically imports Equation pay the cost
// even when no equation rendered. lazy-load it on first mount instead, so
// routes that never render an Equation skip it entirely.
let katexCssLoaded = false;

function useKatexCss() {
    useEffect(() => {
        if (katexCssLoaded) return;
        katexCssLoaded = true;
        // side-effect import; the bundler will code-split this. the import is
        // typed only as a dynamic side effect, so we ignore the type error.
        // @ts-expect-error CSS modules have no type declaration but the runtime import works
        import('katex/dist/katex.min.css').catch(() => {});
    }, []);
}

const Equation: React.FC<EquationProps> = ({
    math,
    mode = 'inline',
    className = '',
}) => {
    useKatexCss();

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
