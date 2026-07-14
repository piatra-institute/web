'use client';

import React from 'react';

import { clamp, type PhaseResult } from '../../logic';


export type PhaseMetric = 'regime' | 'finalCats' | 'peakRho' | 'minWelfare';

interface PhaseMapProps {
    phase: PhaseResult;
    metric: PhaseMetric;
    xLabel: string;
    yLabel: string;
    formatX: (v: number) => string;
    formatY: (v: number) => string;
    currentX: number;
    currentY: number;
}

const REGIME_COLORS: Record<string, string> = {
    none: '#171717',
    single: '#365314',
    pair: '#4d7c0f',
    multi: '#65a30d',
    rescue: '#84cc16',
    sanctuary: '#a3e635',
    overload: '#f59e0b',
    crisis: '#dc2626',
};

const REGIME_LEGEND: { key: string; label: string }[] = [
    { key: 'single', label: 'single' },
    { key: 'pair', label: 'pair' },
    { key: 'multi', label: 'stable multi' },
    { key: 'rescue', label: 'rescue net' },
    { key: 'sanctuary', label: 'sanctuary' },
    { key: 'overload', label: 'overload' },
    { key: 'crisis', label: 'crisis' },
];

// lime ramp from near-black to bright lime for a normalized value in [0,1].
function limeRamp(t: number): string {
    const u = clamp(t, 0, 1);
    const r = Math.round(10 + u * (163 - 10));
    const g = Math.round(10 + u * (230 - 10));
    const b = Math.round(10 + u * (53 - 10));
    return `rgb(${r},${g},${b})`;
}

// green -> amber -> red ramp for a hazard value in [0,1].
function hazardRamp(t: number): string {
    const u = clamp(t, 0, 1);
    if (u < 0.5) {
        const k = u / 0.5;
        return `rgb(${Math.round(132 + k * (245 - 132))},${Math.round(204 - k * (204 - 158))},${Math.round(22)})`;
    }
    const k = (u - 0.5) / 0.5;
    return `rgb(${Math.round(245 - k * (245 - 220))},${Math.round(158 - k * (158 - 38))},${Math.round(22 + k * (38 - 22))})`;
}

function cellColor(metric: PhaseMetric, cell: PhaseResult['cells'][number]): string {
    switch (metric) {
        case 'regime':
            return REGIME_COLORS[cell.regimeKey] ?? '#171717';
        case 'finalCats':
            return limeRamp(Math.log1p(cell.finalCats) / Math.log1p(120));
        case 'peakRho':
            return hazardRamp((cell.peakRho - 0.4) / 1.6);
        case 'minWelfare':
            return limeRamp(cell.minWelfare / 100);
    }
}


export default function PhaseMap({
    phase, metric, xLabel, yLabel, formatX, formatY, currentX, currentY,
}: PhaseMapProps) {
    const M = { top: 10, right: 14, bottom: 40, left: 52 };
    const W = 520;
    const H = 380;
    const plotW = W - M.left - M.right;
    const plotH = H - M.top - M.bottom;
    const cw = plotW / phase.nx;
    const ch = plotH / phase.ny;

    const xFrac = (currentX - phase.xMin) / Math.max(1e-9, phase.xMax - phase.xMin);
    const yFrac = (currentY - phase.yMin) / Math.max(1e-9, phase.yMax - phase.yMin);
    const markX = M.left + clamp(xFrac, 0, 1) * plotW;
    const markY = M.top + (1 - clamp(yFrac, 0, 1)) * plotH;

    return (
        <div className="w-full">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                {phase.cells.map((c) => {
                    const x = M.left + c.i * cw;
                    // j = 0 is yMin, drawn at the bottom
                    const y = M.top + (phase.ny - 1 - c.j) * ch;
                    return (
                        <rect
                            key={`${c.i}-${c.j}`}
                            x={x}
                            y={y}
                            width={cw + 0.5}
                            height={ch + 0.5}
                            fill={cellColor(metric, c)}
                        />
                    );
                })}

                {/* current-parameter marker */}
                <circle cx={markX} cy={markY} r={6} fill="none" stroke="#000" strokeWidth={3} />
                <circle cx={markX} cy={markY} r={6} fill="none" stroke="#fff" strokeWidth={1.5} />

                {/* axes frame */}
                <rect x={M.left} y={M.top} width={plotW} height={plotH} fill="none" stroke="#3f6212" strokeWidth={1} />

                {/* x ticks */}
                <text x={M.left} y={H - 24} fill="#a3e635" fontSize={10} fontFamily="monospace" textAnchor="start">{formatX(phase.xMin)}</text>
                <text x={M.left + plotW} y={H - 24} fill="#a3e635" fontSize={10} fontFamily="monospace" textAnchor="end">{formatX(phase.xMax)}</text>
                <text x={M.left + plotW / 2} y={H - 8} fill="#84cc16" fontSize={11} fontFamily="monospace" textAnchor="middle">{xLabel}</text>

                {/* y ticks */}
                <text x={M.left - 6} y={M.top + plotH} fill="#a3e635" fontSize={10} fontFamily="monospace" textAnchor="end">{formatY(phase.yMin)}</text>
                <text x={M.left - 6} y={M.top + 8} fill="#a3e635" fontSize={10} fontFamily="monospace" textAnchor="end">{formatY(phase.yMax)}</text>
                <text
                    x={14}
                    y={M.top + plotH / 2}
                    fill="#84cc16"
                    fontSize={11}
                    fontFamily="monospace"
                    textAnchor="middle"
                    transform={`rotate(-90 14 ${M.top + plotH / 2})`}
                >
                    {yLabel}
                </text>
            </svg>

            {metric === 'regime' ? (
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                    {REGIME_LEGEND.map((r) => (
                        <div key={r.key} className="flex items-center gap-1.5 text-[10px] font-mono text-lime-200/60">
                            <span className="inline-block w-3 h-3" style={{ backgroundColor: REGIME_COLORS[r.key] }} />
                            {r.label}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-lime-200/50">
                    <span>{metric === 'peakRho' ? 'low load' : metric === 'minWelfare' ? 'poor' : 'few'}</span>
                    <div
                        className="flex-1 h-2"
                        style={{
                            background:
                                metric === 'peakRho'
                                    ? 'linear-gradient(to right, #84cc16, #f59e0b, #dc2626)'
                                    : 'linear-gradient(to right, #0a0a0a, #a3e635)',
                        }}
                    />
                    <span>{metric === 'peakRho' ? 'high load' : metric === 'minWelfare' ? 'good' : 'many (120+)'}</span>
                </div>
            )}
        </div>
    );
}
