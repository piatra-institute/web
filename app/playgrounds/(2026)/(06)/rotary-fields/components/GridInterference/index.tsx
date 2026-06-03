'use client';

import React from 'react';


interface GridInterferenceProps {
    field: number[][];
}


function cellColor(v: number): string {
    const a = 0.12 + Math.abs(v) * 0.7;
    if (v >= 0) return `rgba(132, 204, 22, ${a})`;
    return `rgba(234, 88, 12, ${a})`;
}


export default function GridInterference({ field }: GridInterferenceProps) {
    const N = field.length;
    if (N === 0) return null;
    const cellSize = 4;
    const padL = 6;
    const padT = 22;
    const padB = 16;
    const W = padL * 2 + cellSize * N;
    const H = padT + padB + cellSize * N;

    return (
        <div className="border border-lime-500/20 bg-[#0a0a0a] p-3 space-y-2">
            <div className="text-xs text-lime-200/60 font-mono uppercase tracking-wide">
                grid-like interference · three oscillations at 60° offsets
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
                {field.map((row, y) =>
                    row.map((v, x) => (
                        <rect
                            key={`${y}-${x}`}
                            x={padL + x * cellSize}
                            y={padT + y * cellSize}
                            width={cellSize + 0.4}
                            height={cellSize + 0.4}
                            fill={cellColor(v)}
                        />
                    )),
                )}
                <text x={W / 2} y={14} fontSize="10" fontFamily="monospace" fill="rgba(163, 230, 53, 0.6)" textAnchor="middle">
                    lime = constructive · orange = destructive
                </text>
            </svg>
        </div>
    );
}
