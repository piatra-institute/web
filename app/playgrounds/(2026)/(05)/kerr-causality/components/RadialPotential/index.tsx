'use client';

import React, { useMemo } from 'react';

import Equation from '@/components/Equation';

import {
    SCAN_MAX_R,
    SCAN_MIN_R,
    allowedIntervals,
    getRoots,
    horizons,
    radialPotential,
    type Params,
    type Snapshot,
} from '../../logic';


interface RadialPotentialProps {
    params: Params;
    snapshot: Snapshot | null;
}

const W = 760;
const H = 320;
const PAD_L = 28;
const PAD_R = 18;
const PAD_T = 14;
const PAD_B = 28;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

function xFor(r: number): number {
    return PAD_L + ((r - SCAN_MIN_R) / (SCAN_MAX_R - SCAN_MIN_R)) * PLOT_W;
}

interface CurveData {
    points: { x: number; y: number; r: number; raw: number }[];
    cap: number;
}

function buildCurve(params: Params): CurveData {
    const samples: { r: number; raw: number }[] = [];
    let maxAbs = 1e-6;
    for (let i = 0; i <= 600; i++) {
        const r = SCAN_MIN_R + ((SCAN_MAX_R - SCAN_MIN_R) * i) / 600;
        const raw = radialPotential(r, params);
        if (Number.isFinite(raw)) {
            samples.push({ r, raw });
            maxAbs = Math.max(maxAbs, Math.abs(raw));
        }
    }
    const cap = maxAbs * 0.75;
    const yMid = PAD_T + PLOT_H / 2;
    const points = samples.map((p) => {
        const clamped = Math.max(-cap, Math.min(cap, p.raw));
        return {
            x: xFor(p.r),
            y: yMid - (clamped / cap) * (PLOT_H * 0.46),
            r: p.r,
            raw: p.raw,
        };
    });
    return { points, cap };
}

function polylinePoints(points: { x: number; y: number }[]): string {
    return points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
}

export default function RadialPotential({ params, snapshot }: RadialPotentialProps) {
    const { rPlus, rMinus } = useMemo(() => horizons(params.M, params.a), [params.M, params.a]);
    const live = useMemo(() => buildCurve(params), [params]);
    const ghost = useMemo(() => (snapshot ? buildCurve(snapshot.params) : null), [snapshot]);
    const roots = useMemo(() => {
        const fn = (r: number) => radialPotential(r, params);
        return getRoots(fn, SCAN_MIN_R, SCAN_MAX_R);
    }, [params]);
    const intervals = useMemo(() => allowedIntervals(params, roots), [params, roots]);

    return (
        <div className="w-full space-y-4">
            <div className="border border-lime-500/20 p-3">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">
                        radial potential R(r)
                    </div>
                    <div className="text-[10px] text-lime-200/60 flex items-center gap-3">
                        <Equation math="\Delta = r^2 - 2Mr + a^2" />
                        <Equation math="R(r) = [(r^2+a^2)E - aL]^2 - \Delta\,[Q + (L-aE)^2]" />
                    </div>
                </div>

                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: 320 }}>
                    <rect x={0} y={0} width={W} height={H} fill="#0a0a0a" />

                    {/* allowed bands */}
                    {intervals.map((iv, i) => {
                        const x0 = xFor(iv.lo);
                        const x1 = xFor(iv.hi);
                        return (
                            <rect
                                key={i}
                                x={x0}
                                y={PAD_T}
                                width={Math.max(0, x1 - x0)}
                                height={PLOT_H}
                                fill="#84cc16"
                                fillOpacity="0.12"
                            />
                        );
                    })}

                    {/* zero line */}
                    <line
                        x1={PAD_L}
                        y1={PAD_T + PLOT_H / 2}
                        x2={W - PAD_R}
                        y2={PAD_T + PLOT_H / 2}
                        stroke="#a3e635"
                        strokeOpacity="0.3"
                        strokeWidth="1"
                    />

                    {/* horizon and zero markers */}
                    {[
                        { r: rMinus, label: 'r-', color: '#f59e0b' },
                        { r: rPlus, label: 'r+', color: '#a3e635' },
                        { r: 0, label: '0', color: '#dc2626' },
                    ].map((m, i) => {
                        const x = xFor(m.r);
                        if (x < PAD_L || x > W - PAD_R) return null;
                        return (
                            <g key={i}>
                                <line
                                    x1={x}
                                    y1={PAD_T}
                                    x2={x}
                                    y2={PAD_T + PLOT_H}
                                    stroke={m.color}
                                    strokeWidth="1.2"
                                    strokeDasharray="5 5"
                                    strokeOpacity="0.8"
                                />
                                <text x={x + 4} y={PAD_T + 12} fontSize="11" fill={m.color} fontWeight="700">
                                    {m.label}
                                </text>
                            </g>
                        );
                    })}

                    {/* ghost curve */}
                    {ghost && (
                        <polyline
                            points={polylinePoints(ghost.points)}
                            fill="none"
                            stroke="#f97316"
                            strokeWidth="2"
                            strokeDasharray="5 4"
                            opacity="0.7"
                        />
                    )}

                    {/* live curve */}
                    <polyline
                        points={polylinePoints(live.points)}
                        fill="none"
                        stroke="#a3e635"
                        strokeWidth="2.4"
                    />

                    {/* root dots */}
                    {roots
                        .filter((r) => r >= SCAN_MIN_R && r <= SCAN_MAX_R)
                        .map((r, i) => (
                            <g key={i}>
                                <circle
                                    cx={xFor(r)}
                                    cy={PAD_T + PLOT_H / 2}
                                    r={5}
                                    fill="#f97316"
                                    stroke="#0a0a0a"
                                    strokeWidth="2"
                                />
                                <text
                                    x={xFor(r)}
                                    y={PAD_T + PLOT_H / 2 + 22}
                                    textAnchor="middle"
                                    fontSize="11"
                                    fill="#f97316"
                                    fontWeight="700"
                                >
                                    {r.toFixed(3)}
                                </text>
                            </g>
                        ))}

                    <text x={6} y={H - 8} fontSize="11" fill="#a3e635" fillOpacity="0.6">r</text>
                    <text x={6} y={PAD_T + 8} fontSize="11" fill="#a3e635" fillOpacity="0.6">R(r)</text>
                </svg>

                <div className="grid grid-cols-2 gap-3 mt-2 text-xs">
                    <div className="text-lime-200/60">
                        roots: <span className="text-lime-400 font-mono">{roots.length}</span>
                    </div>
                    <div className="text-lime-200/60">
                        allowed bands: <span className="text-lime-400 font-mono">{intervals.length}</span>
                    </div>
                </div>
            </div>

            {roots.length > 0 && (
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide mb-2">
                        roots of R(r) in scan window
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
                        {roots.map((r, i) => (
                            <div key={i} className="border border-lime-500/10 px-2 py-1">
                                <span className="text-lime-200/40">root {i + 1}:</span>{' '}
                                <span className="text-lime-400">{r.toFixed(4)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {Math.abs(params.E) < 1e-6 && (
                <div className="border border-lime-500/40 p-3 bg-lime-500/5">
                    <div className="text-[10px] text-lime-200/60 uppercase tracking-wide mb-2">
                        closed-form turning points for E = 0
                    </div>
                    <div className="text-xs text-lime-100 leading-relaxed">
                        <Equation
                            mode="block"
                            math="r_{\min,\max} = M \mp \sqrt{M^2 - \frac{a^2 Q}{Q + L^2}}"
                        />
                        <p className="mt-2 text-lime-200/70 italic text-[11px]">
                            in the figure-like case the two analytic roots straddle both horizons: rmin {'<'} r- {'<'} r+ {'<'} rmax.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
