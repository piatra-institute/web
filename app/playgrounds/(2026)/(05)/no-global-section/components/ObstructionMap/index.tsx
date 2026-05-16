'use client';

import React from 'react';

import {
    AXIS_KEYS,
    AXIS_LABELS,
    dominantAxis,
    weakestAxis,
    type AxisKey,
    type AxisValues,
    type Metrics,
} from '../../logic';


const ANGLES: Record<AxisKey, number> = {
    locality: 180,
    abstraction: 0,
    desire: 120,
    knowledge: 60,
    trauma: 240,
    institution: 300,
};

const CENTER = 50;
const RADIUS = 34;

interface NodePos { x: number; y: number; }

function nodeAt(axis: AxisKey): NodePos {
    const a = (ANGLES[axis] * Math.PI) / 180;
    return {
        x: CENTER + RADIUS * Math.cos(a),
        y: CENTER - RADIUS * Math.sin(a),
    };
}

interface Props {
    axes: AxisValues;
    metrics: Metrics;
    snapshotAxes?: AxisValues | null;
}

export default function ObstructionMap({ axes, metrics, snapshotAxes }: Props) {
    const positions = AXIS_KEYS.map((k) => ({ key: k, ...nodeAt(k), value: axes[k] }));
    const dom = dominantAxis(axes);
    const weak = weakestAxis(axes);
    const glueFactor = metrics.glue / 100;
    const tensionFactor = metrics.localGlobalTension / 100;
    const obstructionFactor = metrics.obstruction / 100;

    const edges: { from: AxisKey; to: AxisKey; opacity: number }[] = [];
    for (let i = 0; i < AXIS_KEYS.length; i++) {
        for (let j = i + 1; j < AXIS_KEYS.length; j++) {
            const a = AXIS_KEYS[i];
            const b = AXIS_KEYS[j];
            const m = Math.min(axes[a], axes[b]) / 100;
            edges.push({ from: a, to: b, opacity: 0.08 + 0.55 * m * glueFactor });
        }
    }

    const ruptureArcs: { from: AxisKey; to: AxisKey; opacity: number; key: string }[] = [
        { from: 'locality', to: 'abstraction', opacity: 0.18 + 0.72 * tensionFactor, key: 'central' },
    ];
    if (metrics.obstruction > 60 && dom.key !== weak.key) {
        ruptureArcs.push({ from: dom.key, to: weak.key, opacity: 0.22 + 0.7 * obstructionFactor, key: 'imbalance' });
    }

    return (
        <div className="border border-lime-500/20 bg-black p-4">
            <div className="flex items-center justify-between mb-2 text-xs font-mono">
                <div className="text-lime-200/60">
                    H<sup>1</sup> obstruction: <span className="text-lime-400">{metrics.obstruction}</span>
                </div>
                <div className="text-lime-200/60">
                    glue: <span className="text-lime-400">{metrics.glue}</span>
                </div>
            </div>
            <svg viewBox="0 0 100 100" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <radialGradient id="ngsCenter" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#84cc16" stopOpacity="0.05" />
                        <stop offset="100%" stopColor="#84cc16" stopOpacity="0" />
                    </radialGradient>
                </defs>

                <circle cx={CENTER} cy={CENTER} r={RADIUS + 6} fill="url(#ngsCenter)" />

                <circle
                    cx={CENTER}
                    cy={CENTER}
                    r={RADIUS}
                    fill="none"
                    stroke="#84cc16"
                    strokeOpacity="0.12"
                    strokeWidth="0.3"
                    strokeDasharray="0.6 1"
                />

                {edges.map(({ from, to, opacity }, idx) => {
                    const a = nodeAt(from);
                    const b = nodeAt(to);
                    return (
                        <line
                            key={`e-${idx}`}
                            x1={a.x}
                            y1={a.y}
                            x2={b.x}
                            y2={b.y}
                            stroke="#84cc16"
                            strokeOpacity={opacity}
                            strokeWidth="0.4"
                        />
                    );
                })}

                {ruptureArcs.map(({ from, to, opacity, key }) => {
                    const a = nodeAt(from);
                    const b = nodeAt(to);
                    const mx = (a.x + b.x) / 2;
                    const my = (a.y + b.y) / 2;
                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const len = Math.sqrt(dx * dx + dy * dy) || 1;
                    const nx = -dy / len;
                    const ny = dx / len;
                    const bow = 9;
                    const cx = mx + nx * bow;
                    const cy = my + ny * bow;
                    return (
                        <path
                            key={`r-${key}`}
                            d={`M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`}
                            fill="none"
                            stroke="#f97316"
                            strokeOpacity={opacity}
                            strokeWidth="0.55"
                            strokeDasharray="1.4 1.2"
                        />
                    );
                })}

                {snapshotAxes && AXIS_KEYS.map((k, idx) => {
                    const next = AXIS_KEYS[(idx + 1) % AXIS_KEYS.length];
                    const a = nodeAt(k);
                    const b = nodeAt(next);
                    const sa = snapshotAxes[k] / 100;
                    const sb = snapshotAxes[next] / 100;
                    const ax = CENTER + (a.x - CENTER) * sa;
                    const ay = CENTER + (a.y - CENTER) * sa;
                    const bx = CENTER + (b.x - CENTER) * sb;
                    const by = CENTER + (b.y - CENTER) * sb;
                    return (
                        <line
                            key={`snap-${idx}`}
                            x1={ax}
                            y1={ay}
                            x2={bx}
                            y2={by}
                            stroke="#f97316"
                            strokeOpacity="0.5"
                            strokeWidth="0.35"
                            strokeDasharray="0.8 0.8"
                        />
                    );
                })}

                {positions.map((p, idx) => {
                    const isDom = p.key === dom.key;
                    const r = 1.4 + (p.value / 100) * 3.4;
                    return (
                        <g key={`n-${idx}`}>
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r={r + 0.6}
                                fill="#000000"
                            />
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r={r}
                                fill={isDom ? '#a3e635' : '#84cc16'}
                                fillOpacity={0.35 + (p.value / 100) * 0.55}
                                stroke={isDom ? '#a3e635' : '#84cc16'}
                                strokeWidth="0.3"
                                strokeOpacity="0.9"
                            />
                            <text
                                x={p.x}
                                y={p.y + (p.y > CENTER ? r + 3.6 : -(r + 1.8))}
                                textAnchor="middle"
                                fontSize="2.8"
                                fill={isDom ? '#a3e635' : '#a3e635'}
                                fillOpacity={isDom ? 1 : 0.6}
                                fontFamily="ui-monospace, monospace"
                            >
                                {AXIS_LABELS[p.key]}
                            </text>
                            <text
                                x={p.x}
                                y={p.y + (p.y > CENTER ? r + 6.4 : -(r + 4.4))}
                                textAnchor="middle"
                                fontSize="2.2"
                                fill="#a3e635"
                                fillOpacity="0.4"
                                fontFamily="ui-monospace, monospace"
                            >
                                {p.value}
                            </text>
                        </g>
                    );
                })}

                <circle
                    cx={CENTER}
                    cy={CENTER}
                    r={1.2}
                    fill="#84cc16"
                    fillOpacity={0.4 + 0.5 * (1 - obstructionFactor)}
                />
            </svg>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-mono text-lime-200/50">
                <div>
                    edges: gluing capacity weighted by min-pair value
                </div>
                <div>
                    <span className="text-orange-400/80">dashed orange:</span> rupture
                </div>
                {snapshotAxes && (
                    <div>
                        <span className="text-orange-400/80">orange polygon:</span> saved snapshot
                    </div>
                )}
            </div>
        </div>
    );
}
