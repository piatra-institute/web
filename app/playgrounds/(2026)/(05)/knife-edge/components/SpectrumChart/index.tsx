'use client';

import React from 'react';


interface SpectrumChartProps {
    eigenvalues: number[];
    kernelDim: number;
    spectralGap: number;
    kernelTol?: number;
}

const W = 520;
const H = 240;
const PAD_L = 40;
const PAD_R = 16;
const PAD_T = 16;
const PAD_B = 36;

export default function SpectrumChart({ eigenvalues, kernelDim, spectralGap, kernelTol = 0.06 }: SpectrumChartProps) {
    if (eigenvalues.length === 0) {
        return (
            <div className="border border-lime-500/30 bg-[#0a0a0a] p-6 text-center text-xs text-lime-200/40 font-mono">
                spectrum unavailable, simulation has not produced patches yet
            </div>
        );
    }
    const maxEig = Math.max(...eigenvalues, 1);
    const n = eigenvalues.length;
    const barW = (W - PAD_L - PAD_R) / n - 2;

    return (
        <div className="border border-lime-500/30 bg-[#0a0a0a] p-2">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
                {/* Y axis */}
                <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={H - PAD_B} stroke="rgba(163, 230, 53, 0.4)" />

                {/* Y ticks */}
                {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                    const y = H - PAD_B - t * (H - PAD_T - PAD_B);
                    return (
                        <g key={t}>
                            <line x1={PAD_L - 3} y1={y} x2={PAD_L} y2={y} stroke="rgba(163, 230, 53, 0.4)" />
                            <text
                                x={PAD_L - 6}
                                y={y + 3}
                                textAnchor="end"
                                fontSize="9"
                                fill="#a3e635"
                                opacity={0.7}
                                fontFamily="monospace"
                            >
                                {(t * maxEig).toFixed(2)}
                            </text>
                        </g>
                    );
                })}

                {/* Kernel band */}
                <rect
                    x={PAD_L}
                    y={H - PAD_B - (kernelTol / maxEig) * (H - PAD_T - PAD_B)}
                    width={W - PAD_L - PAD_R}
                    height={(kernelTol / maxEig) * (H - PAD_T - PAD_B)}
                    fill="rgba(132, 204, 22, 0.07)"
                />

                {/* Bars */}
                {eigenvalues.map((e, i) => {
                    const x = PAD_L + (i + 0.5) * ((W - PAD_L - PAD_R) / n) - barW / 2;
                    const h = (e / maxEig) * (H - PAD_T - PAD_B);
                    const y = H - PAD_B - h;
                    const inKernel = Math.abs(e) < kernelTol;
                    return (
                        <rect
                            key={i}
                            x={x}
                            y={y}
                            width={barW}
                            height={Math.max(1, h)}
                            fill={inKernel ? '#a3e635' : '#84cc16'}
                            fillOpacity={inKernel ? 0.9 : 0.55}
                        />
                    );
                })}

                {/* X axis */}
                <line x1={PAD_L} y1={H - PAD_B} x2={W - PAD_R} y2={H - PAD_B} stroke="rgba(163, 230, 53, 0.4)" />

                {/* Labels */}
                <text x={(PAD_L + W - PAD_R) / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="#a3e635" fontFamily="monospace">
                    eigenvalue index (sorted)
                </text>
                <text x={W - PAD_R} y={PAD_T + 12} textAnchor="end" fontSize="10" fill="#a3e635" opacity={0.7} fontFamily="monospace">
                    ker dim = {kernelDim} · gap = {spectralGap.toFixed(3)}
                </text>
            </svg>
        </div>
    );
}
