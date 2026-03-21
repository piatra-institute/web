'use client';

import React, { useState } from 'react';


export interface Assumption {
    id: string;
    statement: string;
    citation: string;
    confidence: 'established' | 'contested' | 'speculative';
    falsifiability: string;
}

interface AssumptionPanelProps {
    assumptions: Assumption[];
}

const CONFIDENCE_STYLES: Record<Assumption['confidence'], { bg: string; text: string; border: string }> = {
    established: { bg: 'bg-lime-500/20', text: 'text-lime-400', border: 'border-lime-500/30' },
    contested: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    speculative: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
};

export default function AssumptionPanel({ assumptions }: AssumptionPanelProps) {
    const [expanded, setExpanded] = useState(false);

    const counts = {
        established: assumptions.filter(a => a.confidence === 'established').length,
        contested: assumptions.filter(a => a.confidence === 'contested').length,
        speculative: assumptions.filter(a => a.confidence === 'speculative').length,
    };

    return (
        <div className="border border-lime-500/20">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-3 text-xs text-lime-200/60 hover:text-lime-200/80 transition-colors cursor-pointer"
            >
                <span className="font-mono uppercase tracking-wide">
                    assumptions ({assumptions.length})
                </span>
                <div className="flex items-center gap-3">
                    <span className="flex gap-2 text-[10px]">
                        <span className="text-lime-400">{counts.established} established</span>
                        <span className="text-yellow-400">{counts.contested} contested</span>
                        <span className="text-orange-400">{counts.speculative} speculative</span>
                    </span>
                    <span className="text-lime-200/40">{expanded ? '−' : '+'}</span>
                </div>
            </button>
            {expanded && (
                <div className="border-t border-lime-500/10 divide-y divide-lime-500/10">
                    {assumptions.map((a) => {
                        const style = CONFIDENCE_STYLES[a.confidence];
                        return (
                            <div key={a.id} className="p-3 space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="text-xs text-lime-100 leading-relaxed">{a.statement}</div>
                                    <span className={`shrink-0 text-[10px] px-2 py-0.5 border ${style.bg} ${style.text} ${style.border}`}>
                                        {a.confidence}
                                    </span>
                                </div>
                                <div className="text-[10px] text-lime-200/40">{a.citation}</div>
                                <div className="text-[10px] text-lime-200/30">
                                    <span className="text-lime-200/50">falsifiable if: </span>
                                    {a.falsifiability}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
