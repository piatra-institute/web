'use client';

import React from 'react';

import { MachineSpec, Metrics, Params } from '../../logic';


interface PatchDiagramProps {
    params: Params;
    spec: MachineSpec;
    metrics: Metrics;
}

const LIME = '#84cc16';
const DIM = '#3f6212';
const WARN = '#f97316';
const TEXT = '#d9f99d';
const MUTED = '#65a30d';


/** A place where the mechanism departs from the mathematics. */
function Fault({
    x,
    y,
    label,
    value,
    hot,
}: {
    x: number;
    y: number;
    label: string;
    value: string;
    hot: boolean;
}) {
    const stroke = hot ? WARN : DIM;
    return (
        <g>
            <circle cx={x} cy={y} r={5} fill={hot ? WARN : '#000'} stroke={stroke} strokeWidth={1.5} />
            <text x={x} y={y - 12} textAnchor="middle" fontSize={9} fill={hot ? WARN : MUTED} fontFamily="monospace">
                {label}
            </text>
            <text x={x} y={y + 20} textAnchor="middle" fontSize={9} fill={hot ? WARN : MUTED} fontFamily="monospace">
                {value}
            </text>
        </g>
    );
}


function Unit({
    x,
    y,
    w,
    h,
    title,
    sub,
    dead,
}: {
    x: number;
    y: number;
    w: number;
    h: number;
    title: string;
    sub: string;
    dead: boolean;
}) {
    return (
        <g>
            <rect
                x={x}
                y={y}
                width={w}
                height={h}
                fill={dead ? '#1c0f05' : '#0d1405'}
                stroke={dead ? WARN : LIME}
                strokeWidth={1.5}
            />
            <text x={x + w / 2} y={y + 22} textAnchor="middle" fontSize={11} fill={dead ? WARN : TEXT} fontFamily="monospace">
                {title}
            </text>
            <text x={x + w / 2} y={y + 38} textAnchor="middle" fontSize={10} fill={dead ? WARN : MUTED} fontFamily="monospace">
                {sub}
            </text>
        </g>
    );
}


export default function PatchDiagram({ params, spec, metrics }: PatchDiagramProps) {
    const slipping = metrics.grossSlip;
    const hunting = !metrics.stable;
    const clipping = metrics.clipPct > 1;
    const backlashHot = metrics.regime === 'backlash-limited';
    const creepHot = metrics.regime === 'creep-limited' || slipping;
    const lagHot = hunting || metrics.regime === 'lag-limited';

    const wire = slipping ? WARN : LIME;

    return (
        <div className="border border-lime-500/20 p-4">
            <div className="text-xs text-lime-200/60 font-mono uppercase tracking-wide mb-3">
                the patch &middot; where the mechanism departs from the mathematics
            </div>

            <div className="w-full overflow-x-auto">
                <svg viewBox="0 0 900 250" className="w-full min-w-[720px]" role="img" aria-label="Block diagram of the two-integrator patch and its four error sources">
                    {/* Summing junction: the carriage of integrator 1. */}
                    <circle cx={92} cy={100} r={20} fill="#0d1405" stroke={LIME} strokeWidth={1.5} />
                    <text x={92} y={105} textAnchor="middle" fontSize={14} fill={TEXT} fontFamily="monospace">+</text>
                    <text x={92} y={54} textAnchor="middle" fontSize={9} fill={MUTED} fontFamily="monospace">carriage 1</text>
                    <text x={92} y={146} textAnchor="middle" fontSize={10} fill={TEXT} fontFamily="monospace">
                        y&Prime; = &minus;2&zeta;&omega;v &minus; &omega;&sup2;y
                    </text>

                    {/* Carriage 1 to integrator 1. */}
                    <line x1={112} y1={100} x2={196} y2={100} stroke={wire} strokeWidth={1.5} />
                    <polygon points="196,100 188,96 188,104" fill={wire} />
                    <Fault x={154} y={100} label="rim" value={`${(params.scaleFactor * spec.peakIntegrand).toFixed(0)} / ${params.discRadius} mm`} hot={clipping} />

                    <Unit x={200} y={72} w={150} h={56} title="integrator 1" sub="&int; y&Prime; dx = y&prime;" dead={slipping} />

                    {/* Gear train to carriage 2. */}
                    <line x1={350} y1={100} x2={446} y2={100} stroke={wire} strokeWidth={1.5} />
                    <polygon points="446,100 438,96 438,104" fill={wire} />
                    <Fault x={398} y={100} label="play" value={`${params.backlash.toFixed(0)}′`} hot={backlashHot} />

                    <Unit x={450} y={72} w={150} h={56} title="integrator 2" sub="&int; y&prime; dx = y" dead={slipping} />

                    {/* Out to the pen. */}
                    <line x1={600} y1={100} x2={716} y2={100} stroke={wire} strokeWidth={1.5} />
                    <polygon points="716,100 708,96 708,104" fill={wire} />
                    <Fault x={658} y={100} label="creep" value={`${metrics.creepPct.toFixed(3)}%`} hot={creepHot} />

                    <rect x={720} y={72} width={110} height={56} fill="#0d1405" stroke={LIME} strokeWidth={1.5} />
                    <text x={775} y={95} textAnchor="middle" fontSize={11} fill={TEXT} fontFamily="monospace">pen</text>
                    <text x={775} y={112} textAnchor="middle" fontSize={10} fill={MUTED} fontFamily="monospace">y(x)</text>

                    {/* Feedback: y back to the carriage, through the drive-train lag. */}
                    <line x1={775} y1={128} x2={775} y2={196} stroke={hunting ? WARN : LIME} strokeWidth={1.5} />
                    <line x1={775} y1={196} x2={92} y2={196} stroke={hunting ? WARN : LIME} strokeWidth={1.5} />
                    <line x1={92} y1={196} x2={92} y2={124} stroke={hunting ? WARN : LIME} strokeWidth={1.5} />
                    <polygon points="92,120 88,130 96,130" fill={hunting ? WARN : LIME} />
                    <Fault
                        x={434}
                        y={196}
                        label="lag"
                        value={`τ ${metrics.lag.toFixed(3)} / ${Number.isFinite(metrics.lagCritical) ? metrics.lagCritical.toFixed(3) : '∞'}`}
                        hot={lagHot}
                    />

                    {/* Velocity tap back into carriage 1. */}
                    <line x1={425} y1={72} x2={425} y2={44} stroke={wire} strokeWidth={1} strokeDasharray="4 3" />
                    <line x1={425} y1={44} x2={92} y2={44} stroke={wire} strokeWidth={1} strokeDasharray="4 3" />
                    <line x1={92} y1={44} x2={92} y2={78} stroke={wire} strokeWidth={1} strokeDasharray="4 3" />
                    <polygon points="92,82 88,72 96,72" fill={wire} />
                    <text x={258} y={38} textAnchor="middle" fontSize={9} fill={MUTED} fontFamily="monospace">
                        damping tap: y&prime;
                    </text>

                    <text x={450} y={232} textAnchor="middle" fontSize={9} fill={hunting || slipping ? WARN : MUTED} fontFamily="monospace">
                        {slipping
                            ? 'the contact has broken loose: nothing reaches the shafts'
                            : hunting
                                ? 'the lag has eaten the damping: the loop drives itself'
                                : 'the loop holds'}
                    </text>
                </svg>
            </div>
        </div>
    );
}
