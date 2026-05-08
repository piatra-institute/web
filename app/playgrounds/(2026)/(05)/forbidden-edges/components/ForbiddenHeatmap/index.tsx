'use client';

import React from 'react';

import { ActionKey } from '../../logic';


export interface ForbiddenCell {
    action: ActionKey;
    label: string;
    deltaViability: number;  // signed
}

interface ForbiddenHeatmapProps {
    cells: ForbiddenCell[];
}

function cellColor(delta: number, maxAbs: number): string {
    const norm = Math.max(0, Math.min(1, Math.abs(delta) / Math.max(0.001, maxAbs)));
    if (delta > 0) {
        return `rgba(163, 230, 53, ${0.15 + 0.7 * norm})`;
    }
    return `rgba(251, 146, 60, ${0.15 + 0.7 * norm})`;
}

export default function ForbiddenHeatmap({ cells }: ForbiddenHeatmapProps) {
    const maxAbs = Math.max(...cells.map((c) => Math.abs(c.deltaViability)), 0.5);
    const sorted = [...cells].sort((a, b) => a.deltaViability - b.deltaViability);
    const forbidden = sorted.filter((c) => c.deltaViability < -0.5);

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
                {sorted.map((c) => (
                    <div
                        key={c.action}
                        className="border border-lime-500/30 p-3 text-center"
                        style={{ background: cellColor(c.deltaViability, maxAbs) }}
                    >
                        <div className="text-xs font-mono text-lime-100">{c.label}</div>
                        <div className="text-lg font-mono mt-1 text-lime-100">
                            {c.deltaViability >= 0 ? '+' : ''}{c.deltaViability.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-lime-100/60 mt-0.5">Δ viability</div>
                    </div>
                ))}
            </div>
            <div className="border border-lime-500/20 p-3 text-xs">
                <div className="text-lime-200/40 uppercase tracking-wide text-[10px] mb-1">
                    forbidden under current pressures (Δ &lt; -0.5)
                </div>
                <div className="text-lime-100">
                    {forbidden.length === 0 ? (
                        <span className="text-lime-200/50">none, no action collapses viability sharply at this point</span>
                    ) : (
                        forbidden.map((c) => c.label).join(' · ')
                    )}
                </div>
            </div>
        </div>
    );
}
