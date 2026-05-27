'use client';

import React, { useMemo } from 'react';

import {
    bandLabel,
    potentialData,
    statusOf,
    type DetectedBand,
    type Metrics,
    type Params,
    type Snapshot,
} from '../../logic';


interface AudienceLandscapeProps {
    params: Params;
    metrics: Metrics;
    bands: DetectedBand[];
    snapshot: Snapshot | null;
}

const W = 760;
const H = 360;
const PAD_L = 36;
const PAD_R = 18;
const PAD_T = 18;
const PAD_B = 36;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

interface CurveData {
    points: { x: number; y: number; logViewers: number; viewers: number; potential: number }[];
    maxLog: number;
    maxPotential: number;
}

function buildCurve(params: Params): CurveData {
    const rows = potentialData(params);
    let maxPotential = 1e-6;
    for (const r of rows) {
        if (r.potential > maxPotential) maxPotential = r.potential;
    }
    const maxLog = rows.length > 0 ? rows[rows.length - 1].logViewers : 1;
    const points = rows.map((r) => ({
        x: PAD_L + (r.logViewers / maxLog) * PLOT_W,
        y: PAD_T + (1 - r.potential / maxPotential) * PLOT_H,
        logViewers: r.logViewers,
        viewers: r.viewers,
        potential: r.potential,
    }));
    return { points, maxLog, maxPotential };
}

function polylinePoints(points: { x: number; y: number }[]): string {
    return points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
}

function xForLog(logV: number, maxLog: number): number {
    return PAD_L + Math.max(0, Math.min(1, logV / maxLog)) * PLOT_W;
}

export default function AudienceLandscape({
    params,
    metrics,
    bands,
    snapshot,
}: AudienceLandscapeProps) {
    const reg = statusOf(metrics);
    const live = useMemo(() => buildCurve(params), [params]);
    const ghost = useMemo(() => (snapshot ? buildCurve(snapshot.params) : null), [snapshot]);

    const floorLog = Math.log10(params.initialFloor + 1);
    const capLog = Math.log10(params.capacity + 1);
    const finalLog = Math.log10(metrics.finalViewers + 1);

    // for the dwell histogram strip beneath, project log midpoint onto x
    const dwellMaxShare = useMemo(
        () => bands.reduce((m, b) => Math.max(m, b.share), 0.0001),
        [bands],
    );

    // find ball y position on the live curve at finalLog
    const ballPoint = (() => {
        if (live.points.length === 0) return null;
        const ratio = Math.max(0, Math.min(1, finalLog / live.maxLog));
        const idx = Math.round(ratio * (live.points.length - 1));
        return live.points[idx];
    })();

    const ghostFinalLog = snapshot ? Math.log10(snapshot.metrics.finalViewers + 1) : 0;
    const ghostBallPoint = (() => {
        if (!ghost || ghost.points.length === 0) return null;
        const ratio = Math.max(0, Math.min(1, ghostFinalLog / ghost.maxLog));
        const idx = Math.round(ratio * (ghost.points.length - 1));
        return ghost.points[idx];
    })();

    // x-axis ticks at integer log positions and at floor/cap.
    const tickLogs: number[] = [];
    for (let l = 1; l <= Math.ceil(live.maxLog); l++) tickLogs.push(l);

    return (
        <div className="w-full space-y-4">
            <div className="border border-lime-500/20 p-3">
                <div className="text-[10px] text-lime-200/40 uppercase tracking-wide mb-2">
                    audience potential landscape
                </div>
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: 380 }}>
                    <rect x={0} y={0} width={W} height={H} fill="#0a0a0a" />

                    {/* dwell histogram bands as background fills */}
                    {bands.map((b, i) => {
                        const cx = xForLog(b.logBand, live.maxLog);
                        const halfWidth = ((0.25 / live.maxLog) * PLOT_W) / 2;
                        const intensity = b.share / dwellMaxShare;
                        return (
                            <rect
                                key={i}
                                x={cx - halfWidth}
                                y={PAD_T}
                                width={halfWidth * 2}
                                height={PLOT_H}
                                fill="#84cc16"
                                fillOpacity={intensity * 0.22}
                            />
                        );
                    })}

                    {/* horizontal zero line */}
                    <line
                        x1={PAD_L}
                        y1={PAD_T + PLOT_H}
                        x2={W - PAD_R}
                        y2={PAD_T + PLOT_H}
                        stroke="#a3e635"
                        strokeOpacity="0.25"
                        strokeWidth="1"
                    />

                    {/* floor and capacity markers */}
                    {[
                        { logV: floorLog, label: 'floor', color: '#a3e635' },
                        { logV: capLog, label: 'capacity', color: '#facc15' },
                    ].map((m, i) => {
                        const x = xForLog(m.logV, live.maxLog);
                        return (
                            <g key={i}>
                                <line
                                    x1={x}
                                    y1={PAD_T}
                                    x2={x}
                                    y2={PAD_T + PLOT_H}
                                    stroke={m.color}
                                    strokeOpacity="0.6"
                                    strokeWidth="1"
                                    strokeDasharray="5 4"
                                />
                                <text x={x + 4} y={PAD_T + 12} fontSize="10" fill={m.color} fontWeight="600">
                                    {m.label}
                                </text>
                            </g>
                        );
                    })}

                    {/* ghost potential */}
                    {ghost && (
                        <polyline
                            points={polylinePoints(ghost.points)}
                            fill="none"
                            stroke="#f97316"
                            strokeWidth="2"
                            strokeDasharray="6 4"
                            opacity="0.6"
                        />
                    )}

                    {/* live potential */}
                    <polyline
                        points={polylinePoints(live.points)}
                        fill="none"
                        stroke="#84cc16"
                        strokeWidth="2.4"
                    />

                    {/* ghost ball */}
                    {ghostBallPoint && (
                        <circle
                            cx={ghostBallPoint.x}
                            cy={ghostBallPoint.y}
                            r={5}
                            fill="none"
                            stroke="#f97316"
                            strokeWidth="1.5"
                            strokeDasharray="2 2"
                        />
                    )}

                    {/* live ball, in regime status colour */}
                    {ballPoint && (
                        <>
                            <circle
                                cx={ballPoint.x}
                                cy={ballPoint.y}
                                r={9}
                                fill={reg.color}
                                stroke="#0a0a0a"
                                strokeWidth="2"
                            />
                            <circle
                                cx={ballPoint.x}
                                cy={ballPoint.y}
                                r={13}
                                fill="none"
                                stroke={reg.color}
                                strokeOpacity="0.5"
                                strokeWidth="1"
                            />
                        </>
                    )}

                    {/* x axis log ticks */}
                    {tickLogs.map((l) => {
                        const x = xForLog(l, live.maxLog);
                        return (
                            <g key={l}>
                                <line
                                    x1={x}
                                    y1={PAD_T + PLOT_H}
                                    x2={x}
                                    y2={PAD_T + PLOT_H + 4}
                                    stroke="#a3e635"
                                    strokeOpacity="0.4"
                                    strokeWidth="1"
                                />
                                <text
                                    x={x}
                                    y={PAD_T + PLOT_H + 16}
                                    textAnchor="middle"
                                    fontSize="10"
                                    fill="#a3e635"
                                    fillOpacity="0.6"
                                >
                                    {Math.round(Math.pow(10, l)).toLocaleString()}
                                </text>
                            </g>
                        );
                    })}

                    <text x={6} y={H - 8} fontSize="11" fill="#a3e635" fillOpacity="0.6">viewers (log)</text>
                    <text x={6} y={PAD_T + 8} fontSize="11" fill="#a3e635" fillOpacity="0.6">U(x)</text>
                </svg>

                <div className="grid grid-cols-3 gap-3 mt-2 text-xs">
                    <div className="text-lime-200/60">
                        final: <span className="text-lime-400 font-mono">{Math.round(metrics.finalViewers).toLocaleString()}</span>
                    </div>
                    <div className="text-lime-200/60">
                        dwell: <span className="text-lime-400 font-mono">{(metrics.dwellShare * 100).toFixed(0)}%</span>
                    </div>
                    <div className="text-lime-200/60">
                        band: <span className="text-lime-400 font-mono">{bandLabel(metrics.finalViewers)}</span>
                    </div>
                </div>
            </div>

            <div className="border border-lime-500/20 p-3">
                <div className="text-[10px] text-lime-200/40 uppercase tracking-wide mb-2">
                    current regime
                </div>
                <div className="text-lg font-semibold mb-1" style={{ color: reg.color }}>
                    {reg.title}
                </div>
                <div className="text-xs text-lime-200/70 italic mb-3">{reg.label}</div>
                <div className="text-sm text-lime-200/80 leading-relaxed">{reg.description}</div>
                <div className="border-l-2 mt-4 pl-3 py-1" style={{ borderColor: `${reg.color}66` }}>
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide mb-1">
                        where you see this
                    </div>
                    <div className="text-xs text-lime-200/80 leading-relaxed">{reg.scenario}</div>
                </div>
            </div>
        </div>
    );
}
