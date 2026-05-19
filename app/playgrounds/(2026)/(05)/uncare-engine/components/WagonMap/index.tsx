'use client';

import React from 'react';

import {
    captureComponent,
    pressureComponent,
    type AxisValues,
    type Metrics,
    type Snapshot,
} from '../../logic';
import { STAGES } from '../../logic/stages';


interface WagonMapProps {
    axes: AxisValues;
    metrics: Metrics;
    snapshot: Snapshot | null;
}

const FIELD_SIZE = 100;
const PADDING = 6;

function bandFor(score: number): number {
    for (let i = 0; i < STAGES.length; i++) {
        const s = STAGES[i];
        if (score >= s.range[0] && score <= s.range[1]) return i;
    }
    return 0;
}

export default function WagonMap({ axes, metrics, snapshot }: WagonMapProps) {
    const px = pressureComponent(axes);
    const cap = captureComponent(axes);
    const cx = PADDING + ((FIELD_SIZE - 2 * PADDING) * px) / 100;
    const cy = PADDING + ((FIELD_SIZE - 2 * PADDING) * (100 - cap)) / 100;

    const stageIndex = metrics.stageIndex;
    const stage = STAGES[stageIndex];

    let snapX: number | null = null;
    let snapY: number | null = null;
    let snapStage: number | null = null;
    if (snapshot) {
        const sPx = pressureComponent(snapshot.axes);
        const sCap = captureComponent(snapshot.axes);
        snapX = PADDING + ((FIELD_SIZE - 2 * PADDING) * sPx) / 100;
        snapY = PADDING + ((FIELD_SIZE - 2 * PADDING) * (100 - sCap)) / 100;
        snapStage = bandFor(snapshot.metrics.madness);
    }

    return (
        <div className="w-full space-y-4">
            <div className="border border-lime-500/20 p-3">
                <div className="text-[10px] text-lime-200/40 uppercase tracking-wide mb-2">
                    pressure x capture phase plot
                </div>
                <svg
                    viewBox="0 0 100 108"
                    className="w-full h-auto"
                    style={{ maxHeight: 360 }}
                >
                    {[0.25, 0.5, 0.75].map((t) => (
                        <line
                            key={`gx-${t}`}
                            x1={PADDING + (FIELD_SIZE - 2 * PADDING) * t}
                            y1={PADDING}
                            x2={PADDING + (FIELD_SIZE - 2 * PADDING) * t}
                            y2={FIELD_SIZE - PADDING}
                            stroke="#84cc16"
                            strokeOpacity="0.08"
                            strokeWidth="0.2"
                        />
                    ))}
                    {[0.25, 0.5, 0.75].map((t) => (
                        <line
                            key={`gy-${t}`}
                            x1={PADDING}
                            y1={PADDING + (FIELD_SIZE - 2 * PADDING) * t}
                            x2={FIELD_SIZE - PADDING}
                            y2={PADDING + (FIELD_SIZE - 2 * PADDING) * t}
                            stroke="#84cc16"
                            strokeOpacity="0.08"
                            strokeWidth="0.2"
                        />
                    ))}

                    <rect
                        x={PADDING}
                        y={PADDING}
                        width={FIELD_SIZE - 2 * PADDING}
                        height={FIELD_SIZE - 2 * PADDING}
                        fill="none"
                        stroke="#84cc16"
                        strokeOpacity="0.25"
                        strokeWidth="0.4"
                    />

                    {STAGES.map((s, i) => {
                        const t1 = s.range[0] / 100;
                        const t2 = (s.range[1] + 1) / 100;
                        const arc = (FIELD_SIZE - 2 * PADDING) * Math.SQRT2;
                        const r1 = arc * t1;
                        const r2 = arc * t2;
                        const cx0 = PADDING;
                        const cy0 = FIELD_SIZE - PADDING;
                        return (
                            <path
                                key={s.key}
                                d={`
                                    M ${cx0 + r1} ${cy0}
                                    A ${r1} ${r1} 0 0 0 ${cx0} ${cy0 - r1}
                                    L ${cx0} ${cy0 - r2}
                                    A ${r2} ${r2} 0 0 1 ${cx0 + r2} ${cy0}
                                    Z
                                `}
                                fill={s.color}
                                fillOpacity={i === stageIndex ? 0.22 : 0.06}
                                stroke={s.color}
                                strokeOpacity="0.18"
                                strokeWidth="0.2"
                            />
                        );
                    })}

                    {snapX !== null && snapY !== null && (
                        <line
                            x1={snapX}
                            y1={snapY}
                            x2={cx}
                            y2={cy}
                            stroke="#f97316"
                            strokeOpacity="0.5"
                            strokeWidth="0.4"
                            strokeDasharray="1.2 0.8"
                        />
                    )}

                    {snapX !== null && snapY !== null && (
                        <circle
                            cx={snapX}
                            cy={snapY}
                            r={1.6}
                            fill="none"
                            stroke="#f97316"
                            strokeWidth="0.6"
                            strokeDasharray="1 0.6"
                        />
                    )}

                    <circle cx={cx} cy={cy} r={2.6} fill={stage.color} />
                    <circle cx={cx} cy={cy} r={4.2} fill="none" stroke={stage.color} strokeOpacity="0.5" strokeWidth="0.3" />

                    <text x={PADDING} y={FIELD_SIZE - 1} fontSize="2.2" fill="#a3e635" fillOpacity="0.5">
                        0
                    </text>
                    <text x={FIELD_SIZE - PADDING - 3} y={FIELD_SIZE - 1} fontSize="2.2" fill="#a3e635" fillOpacity="0.5" textAnchor="end">
                        pressure
                    </text>
                    <text x={1} y={FIELD_SIZE - PADDING - 1} fontSize="2.2" fill="#a3e635" fillOpacity="0.5">
                        0
                    </text>
                    <text x={1} y={PADDING + 2} fontSize="2.2" fill="#a3e635" fillOpacity="0.5">
                        capture
                    </text>

                    <g transform={`translate(${PADDING}, ${FIELD_SIZE + 1})`}>
                        {STAGES.map((s, i) => {
                            const w = (FIELD_SIZE - 2 * PADDING) / STAGES.length;
                            return (
                                <g key={s.key} transform={`translate(${i * w}, 0)`}>
                                    <rect
                                        x={0.3}
                                        y={0}
                                        width={w - 0.6}
                                        height={5}
                                        fill={s.color}
                                        fillOpacity={i === stageIndex ? 0.7 : 0.18}
                                        stroke={s.color}
                                        strokeOpacity={i === stageIndex ? 1 : 0.3}
                                        strokeWidth="0.2"
                                    />
                                    <text
                                        x={w / 2}
                                        y={3.3}
                                        fontSize="1.8"
                                        fill={i === stageIndex ? '#0a0a0a' : '#a3e635'}
                                        fillOpacity={i === stageIndex ? 1 : 0.6}
                                        textAnchor="middle"
                                        fontWeight={i === stageIndex ? '600' : '400'}
                                    >
                                        {i}
                                    </text>
                                </g>
                            );
                        })}
                        {snapStage !== null && snapStage !== stageIndex && (
                            <g
                                transform={`translate(${snapStage * ((FIELD_SIZE - 2 * PADDING) / STAGES.length)}, 0)`}
                            >
                                <rect
                                    x={0.3}
                                    y={0}
                                    width={(FIELD_SIZE - 2 * PADDING) / STAGES.length - 0.6}
                                    height={5}
                                    fill="none"
                                    stroke="#f97316"
                                    strokeOpacity="0.7"
                                    strokeWidth="0.35"
                                    strokeDasharray="0.8 0.5"
                                />
                            </g>
                        )}

                        <line
                            x1={((FIELD_SIZE - 2 * PADDING) * metrics.madness) / 100}
                            y1={-0.8}
                            x2={((FIELD_SIZE - 2 * PADDING) * metrics.madness) / 100}
                            y2={5.8}
                            stroke={stage.color}
                            strokeWidth="0.5"
                        />
                    </g>
                </svg>

                <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
                    <div className="text-lime-200/60">
                        pressure: <span className="text-lime-400 font-mono">{px}</span>
                    </div>
                    <div className="text-lime-200/60">
                        capture: <span className="text-lime-400 font-mono">{cap}</span>
                    </div>
                    <div className="text-lime-200/60">
                        madness: <span className="text-lime-400 font-mono">{metrics.madness}</span>
                    </div>
                </div>
            </div>

            <div className="border border-lime-500/20 p-3">
                <div className="text-[10px] text-lime-200/40 uppercase tracking-wide mb-2">
                    current stage
                </div>
                <div className="text-lime-400 text-lg font-semibold mb-1">{stage.title}</div>
                <div className="text-xs text-lime-200/70 italic mb-3">{stage.label}</div>
                <div className="text-sm text-lime-200/80 leading-relaxed">{stage.description}</div>
                <div className="border-l-2 mt-4 pl-3 py-1" style={{ borderColor: `${stage.color}66` }}>
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide mb-1">
                        best response
                    </div>
                    <div className="text-xs text-lime-200/80 leading-relaxed">{stage.intervention}</div>
                </div>
            </div>
        </div>
    );
}
