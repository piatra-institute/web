'use client';

import React, { useMemo } from 'react';


interface AttentionHeatmapProps {
    matrix: number[][];
    tokenI: number;
    tokenJ: number;
    snapshotMatrix?: number[][] | null;
}


function colorFor(v: number, range: number): string {
    if (range <= 0) return 'rgba(132, 204, 22, 0.0)';
    const n = Math.max(-1, Math.min(1, v / range));
    if (n >= 0) return `rgba(132, 204, 22, ${0.12 + 0.78 * n})`;
    return `rgba(234, 88, 12, ${0.12 + 0.78 * -n})`;
}


export default function AttentionHeatmap({ matrix, tokenI, tokenJ, snapshotMatrix }: AttentionHeatmapProps) {
    const { N, cellSize, W, H, padL, padT, range, vals } = useMemo(() => {
        const N = matrix.length;
        const padL = 26;
        const padT = 22;
        const padR = 10;
        const padB = 26;
        const maxBoard = 360;
        const cellSize = Math.max(6, Math.floor((maxBoard - padL - padR) / Math.max(1, N)));
        const W = padL + cellSize * N + padR;
        const H = padT + cellSize * N + padB;
        let max = 0;
        for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
            const v = Math.abs(matrix[i][j]);
            if (v > max) max = v;
        }
        return { N, cellSize, W, H, padL, padT, range: max, vals: matrix };
    }, [matrix]);

    return (
        <div className="border border-lime-500/20 bg-[#0a0a0a] p-3 space-y-2">
            <div className="text-xs text-lime-200/60 font-mono uppercase tracking-wide">
                attention matrix · {N} × {N}
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
                {/* cells */}
                {vals.map((row, i) =>
                    row.map((v, j) => (
                        <rect
                            key={`${i}-${j}`}
                            x={padL + j * cellSize}
                            y={padT + i * cellSize}
                            width={cellSize}
                            height={cellSize}
                            fill={colorFor(v, range)}
                        />
                    )),
                )}

                {/* snapshot border overlay */}
                {snapshotMatrix && snapshotMatrix.length === N && (
                    <>
                        {snapshotMatrix.map((row, i) =>
                            row.map((v, j) => {
                                const delta = Math.abs(v - vals[i][j]);
                                if (delta < range * 0.25) return null;
                                return (
                                    <rect
                                        key={`s-${i}-${j}`}
                                        x={padL + j * cellSize + 0.5}
                                        y={padT + i * cellSize + 0.5}
                                        width={cellSize - 1}
                                        height={cellSize - 1}
                                        fill="none"
                                        stroke="rgba(234, 88, 12, 0.7)"
                                        strokeWidth={0.6}
                                        strokeDasharray="2 1.5"
                                    />
                                );
                            }),
                        )}
                    </>
                )}

                {/* grid lines */}
                {Array.from({ length: N + 1 }, (_, p) => (
                    <g key={`l-${p}`}>
                        <line
                            x1={padL + p * cellSize}
                            y1={padT}
                            x2={padL + p * cellSize}
                            y2={padT + N * cellSize}
                            stroke="rgba(163, 230, 53, 0.08)"
                        />
                        <line
                            x1={padL}
                            y1={padT + p * cellSize}
                            x2={padL + N * cellSize}
                            y2={padT + p * cellSize}
                            stroke="rgba(163, 230, 53, 0.08)"
                        />
                    </g>
                ))}

                {/* highlight selected cell */}
                <rect
                    x={padL + tokenJ * cellSize + 0.5}
                    y={padT + tokenI * cellSize + 0.5}
                    width={cellSize - 1}
                    height={cellSize - 1}
                    fill="none"
                    stroke="#facc15"
                    strokeWidth={2}
                />

                {/* tick labels */}
                {Array.from({ length: Math.min(N, 8) }, (_, idx) => {
                    const tick = Math.floor((idx * (N - 1)) / Math.max(1, Math.min(N, 8) - 1));
                    return (
                        <g key={`t-${tick}`}>
                            <text
                                x={padL + tick * cellSize + cellSize / 2}
                                y={padT + N * cellSize + 14}
                                fontSize="8"
                                fontFamily="monospace"
                                fill="rgba(163, 230, 53, 0.5)"
                                textAnchor="middle"
                            >
                                {tick}
                            </text>
                            <text
                                x={padL - 6}
                                y={padT + tick * cellSize + cellSize / 2 + 3}
                                fontSize="8"
                                fontFamily="monospace"
                                fill="rgba(163, 230, 53, 0.5)"
                                textAnchor="end"
                            >
                                {tick}
                            </text>
                        </g>
                    );
                })}

                <text x={padL + (N * cellSize) / 2} y={12} fontSize="9" fontFamily="monospace" fill="rgba(163, 230, 53, 0.5)" textAnchor="middle">
                    j (key position)
                </text>
                <text
                    x={10}
                    y={padT + (N * cellSize) / 2}
                    fontSize="9"
                    fontFamily="monospace"
                    fill="rgba(163, 230, 53, 0.5)"
                    textAnchor="middle"
                    transform={`rotate(-90 10 ${padT + (N * cellSize) / 2})`}
                >
                    i (query)
                </text>
            </svg>
            <div className="flex items-center justify-between text-[10px] font-mono">
                <div className="text-lime-200/50">
                    selected score: <span className="text-lime-400">{vals[tokenI]?.[tokenJ]?.toFixed(3) ?? '—'}</span>
                </div>
                <div className="text-lime-200/40">|range| ≤ {range.toFixed(2)}</div>
            </div>
        </div>
    );
}
