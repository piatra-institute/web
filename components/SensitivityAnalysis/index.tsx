'use client';

import React from 'react';


export interface SensitivityBar {
    label: string;
    low: number;
    high: number;
}

interface SensitivityAnalysisProps {
    bars: SensitivityBar[];
    baseline: number;
    outputLabel: string;
}

export default function SensitivityAnalysis({ bars, baseline, outputLabel }: SensitivityAnalysisProps) {
    if (!bars.length) return null;

    const globalMin = Math.min(baseline, ...bars.map(b => b.low));
    const globalMax = Math.max(baseline, ...bars.map(b => b.high));
    const range = globalMax - globalMin || 0.01;
    const baselinePct = ((baseline - globalMin) / range) * 100;

    return (
        <div className="space-y-2">
            <div className="text-xs text-lime-200/60 font-mono uppercase tracking-wide">
                sensitivity analysis · {outputLabel}
            </div>
            <div className="space-y-1">
                {bars.map((bar) => {
                    const leftPct = ((bar.low - globalMin) / range) * 100;
                    const widthPct = ((bar.high - bar.low) / range) * 100;
                    return (
                        <div key={bar.label} className="flex items-center gap-2">
                            <div className="w-28 text-[10px] text-lime-200/50 text-right shrink-0 font-mono truncate">
                                {bar.label}
                            </div>
                            <div className="flex-1 h-5 relative bg-lime-500/5 border border-lime-500/10">
                                <div
                                    className="absolute top-0 bottom-0 w-px bg-lime-500/40 z-10"
                                    style={{ left: `${baselinePct}%` }}
                                />
                                <div
                                    className="absolute top-0.5 bottom-0.5 bg-lime-500/30"
                                    style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 0.5)}%` }}
                                />
                            </div>
                            <div className="w-16 text-[10px] text-lime-200/40 font-mono shrink-0">
                                &Delta;{(bar.high - bar.low).toFixed(3)}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="text-[10px] text-lime-200/30 font-mono">
                baseline: {baseline.toFixed(3)} · each parameter swept min&rarr;max while others held constant
            </div>
        </div>
    );
}
