'use client';

import React from 'react';

import {
    SCENARIOS,
    statusOf,
    type Metrics,
    type Params,
    type Snapshot,
    type StepRecord,
} from '../../logic';


interface BeliefFieldProps {
    params: Params;
    metrics: Metrics;
    steps: StepRecord[];
    snapshot: Snapshot | null;
}

const W = 100;
const H = 100;
const PAD = 8;
const PLOT_W = W - 2 * PAD;
const PLOT_H = H - 2 * PAD;

function xForHarm(h: number): number { return PAD + PLOT_W * Math.max(0, Math.min(1, h)); }
function yForBelief(b: number): number { return PAD + PLOT_H * (1 - Math.max(0, Math.min(1, b))); }


/**
 * 2D phase plot of belief (y) vs actual harm (x). The diagonal is perfect
 * knowledge. The four quadrants of error are: low-belief / low-harm (correct
 * safe), high-belief / high-harm (correct intervene), low-belief / high-harm
 * (missed abuse), high-belief / low-harm (over-intervention). Thresholds
 * appear as horizontal lines. A snapshot ghost traces the previous run.
 */
export default function BeliefField({ params, metrics, steps, snapshot }: BeliefFieldProps) {
    const reg = statusOf(metrics);
    const seed = SCENARIOS[params.case].seed;

    const livePoints = [
        { harm: seed.state.H, belief: seed.belief, action: 'init' },
        ...steps.map((s) => ({ harm: s.state.H, belief: s.belief, action: s.action })),
    ];

    const ghost = snapshot
        ? [
            { harm: SCENARIOS[snapshot.params.case].seed.state.H, belief: SCENARIOS[snapshot.params.case].seed.belief },
            ...snapshot.result.steps.map((s) => ({ harm: s.state.H, belief: s.belief })),
        ]
        : null;

    const livePath = livePoints
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xForHarm(p.harm).toFixed(2)} ${yForBelief(p.belief).toFixed(2)}`)
        .join(' ');

    const ghostPath = ghost
        ? ghost
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xForHarm(p.harm).toFixed(2)} ${yForBelief(p.belief).toFixed(2)}`)
            .join(' ')
        : '';

    const finalPoint = livePoints[livePoints.length - 1];

    return (
        <div className="w-full space-y-4">
            <div className="border border-lime-500/20 p-3">
                <div className="text-[10px] text-lime-200/40 uppercase tracking-wide mb-2">
                    belief vs actual harm phase plot
                </div>
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[480px] h-auto mx-auto block">
                    <rect x={0} y={0} width={W} height={H} fill="#0a0a0a" />

                    {/* quadrant fills: corner colors keyed to the four error regions */}
                    <rect x={PAD} y={PAD + PLOT_H / 2} width={PLOT_W / 2} height={PLOT_H / 2} fill="#a3e635" fillOpacity="0.04" />
                    <rect x={PAD + PLOT_W / 2} y={PAD} width={PLOT_W / 2} height={PLOT_H / 2} fill="#f59e0b" fillOpacity="0.04" />
                    <rect x={PAD} y={PAD} width={PLOT_W / 2} height={PLOT_H / 2} fill="#ea580c" fillOpacity="0.06" />
                    <rect x={PAD + PLOT_W / 2} y={PAD + PLOT_H / 2} width={PLOT_W / 2} height={PLOT_H / 2} fill="#ea580c" fillOpacity="0.10" />

                    {/* diagonal "perfect knowledge" line */}
                    <line
                        x1={xForHarm(0)} y1={yForBelief(0)}
                        x2={xForHarm(1)} y2={yForBelief(1)}
                        stroke="#84cc16" strokeOpacity="0.3" strokeWidth="0.2" strokeDasharray="2 2"
                    />

                    {/* threshold lines */}
                    <line
                        x1={PAD} y1={yForBelief(params.interventionThreshold)}
                        x2={W - PAD} y2={yForBelief(params.interventionThreshold)}
                        stroke="#f59e0b" strokeOpacity="0.5" strokeWidth="0.2" strokeDasharray="1.5 1"
                    />
                    <line
                        x1={PAD} y1={yForBelief(params.adoptionThreshold)}
                        x2={W - PAD} y2={yForBelief(params.adoptionThreshold)}
                        stroke="#ea580c" strokeOpacity="0.5" strokeWidth="0.2" strokeDasharray="1.5 1"
                    />

                    {/* axes */}
                    <rect
                        x={PAD} y={PAD} width={PLOT_W} height={PLOT_H}
                        fill="none" stroke="#84cc16" strokeOpacity="0.2" strokeWidth="0.3"
                    />

                    {/* ghost trajectory */}
                    {ghostPath && (
                        <path d={ghostPath} fill="none" stroke="#f97316" strokeWidth="0.5" strokeDasharray="1.5 1" strokeOpacity="0.6" />
                    )}

                    {/* live trajectory */}
                    <path d={livePath} fill="none" stroke={reg.color} strokeWidth="0.8" strokeOpacity="0.9" />

                    {/* per-step dots */}
                    {livePoints.map((p, i) => (
                        <circle
                            key={i}
                            cx={xForHarm(p.harm)}
                            cy={yForBelief(p.belief)}
                            r={i === 0 ? 1.2 : i === livePoints.length - 1 ? 2 : 0.7}
                            fill={i === livePoints.length - 1 ? reg.color : '#84cc16'}
                            fillOpacity={i === livePoints.length - 1 ? 1 : 0.5}
                            stroke={i === livePoints.length - 1 ? '#0a0a0a' : 'none'}
                            strokeWidth={i === livePoints.length - 1 ? 0.3 : 0}
                        />
                    ))}

                    {/* axis labels */}
                    <text x={PAD} y={H - 1.5} fontSize="2.5" fill="#a3e635" fillOpacity="0.6">harm = 0</text>
                    <text x={W - PAD - 1} y={H - 1.5} fontSize="2.5" fill="#a3e635" fillOpacity="0.6" textAnchor="end">harm = 1</text>
                    <text x={1.5} y={H - PAD} fontSize="2.5" fill="#a3e635" fillOpacity="0.6">b=0</text>
                    <text x={1.5} y={PAD + 2.5} fontSize="2.5" fill="#a3e635" fillOpacity="0.6">b=1</text>

                    {/* corner labels */}
                    <text x={PAD + 2} y={PAD + 3.5} fontSize="2" fill="#ea580c" fillOpacity="0.7">over-intervene</text>
                    <text x={W - PAD - 2} y={PAD + 3.5} fontSize="2" fill="#f59e0b" fillOpacity="0.7" textAnchor="end">correct alarm</text>
                    <text x={PAD + 2} y={H - PAD - 1} fontSize="2" fill="#84cc16" fillOpacity="0.6">correct safe</text>
                    <text x={W - PAD - 2} y={H - PAD - 1} fontSize="2" fill="#ea580c" fillOpacity="0.8" textAnchor="end">missed harm</text>
                </svg>

                <div className="grid grid-cols-4 gap-3 mt-2 text-xs">
                    <div className="text-lime-200/60">
                        belief: <span className="text-lime-400 font-mono">{(finalPoint.belief).toFixed(2)}</span>
                    </div>
                    <div className="text-lime-200/60">
                        harm: <span className="text-lime-400 font-mono">{(finalPoint.harm).toFixed(2)}</span>
                    </div>
                    <div className="text-lime-200/60">
                        gap: <span className="text-lime-400 font-mono">{(finalPoint.belief - finalPoint.harm).toFixed(2)}</span>
                    </div>
                    <div className="text-lime-200/60">
                        steps: <span className="text-lime-400 font-mono">{livePoints.length - 1}</span>
                    </div>
                </div>
            </div>

            <div className="border border-lime-500/20 p-3">
                <div className="text-[10px] text-lime-200/40 uppercase tracking-wide mb-2">
                    final outcome
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
