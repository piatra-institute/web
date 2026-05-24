'use client';

import React from 'react';

import {
    horizons,
    statusOf,
    type Metrics,
    type Params,
    type Snapshot,
} from '../../logic';


interface CausalDiagramProps {
    params: Params;
    metrics: Metrics;
    phase: number;
    snapshot: Snapshot | null;
}

const W = 760;
const H = 660;

// the same cubic-bezier path used by the demo. it threads the central column of tiles
// from the bottom-outer-ergoregion (point A) up through the inner sectors.
const PATH_D =
    'M 402 588 C 392 526, 356 481, 360 424 C 363 382, 398 359, 405 312 C 414 248, 452 205, 438 142 C 430 105, 446 72, 471 35';

const PATH_SEGMENTS: number[][][] = [
    [[402, 588], [392, 526], [356, 481], [360, 424]],
    [[360, 424], [363, 382], [398, 359], [405, 312]],
    [[405, 312], [414, 248], [452, 205], [438, 142]],
    [[438, 142], [430, 105], [446, 72], [471, 35]],
];

function samplePath(t: number): { x: number; y: number } {
    const clamped = Math.max(0, Math.min(1, t));
    const scaled = clamped * PATH_SEGMENTS.length;
    const i = Math.min(PATH_SEGMENTS.length - 1, Math.floor(scaled));
    const u = scaled - i;
    const [p0, p1, p2, p3] = PATH_SEGMENTS[i];
    const b = (k: 0 | 1) => {
        const a = (1 - u) ** 3 * p0[k];
        const c = 3 * (1 - u) ** 2 * u * p1[k];
        const d = 3 * (1 - u) * u * u * p2[k];
        const e = u * u * u * p3[k];
        return a + c + d + e;
    };
    return { x: b(0), y: b(1) };
}

interface DiamondProps {
    cx: number;
    cy: number;
    w: number;
    h: number;
    label: string;
    muted?: boolean;
    active?: boolean;
    accent?: string;
}

function Diamond({ cx, cy, w, h, label, muted = false, active = false, accent = '#84cc16' }: DiamondProps) {
    const pts = `${cx},${cy - h / 2} ${cx + w / 2},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy}`;
    return (
        <g opacity={muted ? 0.4 : 1}>
            <polygon
                points={pts}
                fill={active ? accent : '#0a0a0a'}
                fillOpacity={active ? 0.18 : 0.9}
                stroke={active ? accent : '#84cc16'}
                strokeOpacity={active ? 0.9 : 0.5}
                strokeWidth={active ? 2.5 : 1.6}
            />
            <text
                x={cx}
                y={cy + 5}
                textAnchor="middle"
                fontSize="14"
                fontWeight="600"
                fill={active ? accent : '#a3e635'}
                fillOpacity={active ? 1 : 0.7}
            >
                {label}
            </text>
        </g>
    );
}

interface HorizonLineProps {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string;
    label?: string;
}

function HorizonLine({ x1, y1, x2, y2, color, label }: HorizonLineProps) {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    return (
        <g>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="4" strokeLinecap="round" />
            {label && (
                <text
                    x={mx}
                    y={my - 9}
                    textAnchor="middle"
                    fontSize="11"
                    fill={color}
                    transform={`rotate(${angle} ${mx} ${my - 9})`}
                >
                    {label}
                </text>
            )}
        </g>
    );
}

function DashedCurve({ d, stroke, dash = '4 6' }: { d: string; stroke: string; dash?: string }) {
    return <path d={d} fill="none" stroke={stroke} strokeWidth="2" strokeDasharray={dash} strokeLinecap="round" />;
}

// figure out which tile the photon is currently inside, so we can light it up.
function tileIndexForPhase(t: number): number {
    if (t < 0.2) return 0; // M_II bottom
    if (t < 0.45) return 1; // M_III
    if (t < 0.75) return 2; // M*_II
    return 3; // M_I top
}

export default function CausalDiagram({ params, metrics, phase, snapshot }: CausalDiagramProps) {
    const { rPlus, rMinus } = horizons(params.M, params.a);
    const reg = statusOf(metrics);
    const dot = samplePath(phase);

    const ghostDot = snapshot ? samplePath(phase) : null;
    const activeTile = tileIndexForPhase(phase);

    return (
        <div className="w-full space-y-4">
            <div className="border border-lime-500/20 p-3">
                <div className="text-[10px] text-lime-200/40 uppercase tracking-wide mb-2">
                    extended Kerr causal diagram (topological schematic)
                </div>
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: 520 }}>
                    <defs>
                        <linearGradient id="kerrCorridor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#84cc16" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#84cc16" stopOpacity="0.04" />
                        </linearGradient>
                        <filter id="kerrGlow" x="-40%" y="-40%" width="180%" height="180%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    <rect x={285} y={20} width={190} height={620} rx="20" fill="url(#kerrCorridor)" />
                    <text x={380} y={636} textAnchor="middle" fontSize="11" fill="#a3e635" fillOpacity="0.5">
                        allowed radial corridor, schematic
                    </text>

                    <Diamond cx={240} cy={120} w={210} h={210} label="M' I" muted />
                    <Diamond cx={520} cy={120} w={210} h={210} label="M I" muted active={activeTile === 3} accent={reg.color} />
                    <Diamond cx={380} cy={260} w={210} h={210} label="M* II" active={activeTile === 2} accent={reg.color} />
                    <Diamond cx={240} cy={400} w={210} h={210} label="M III" active={activeTile === 1} accent={reg.color} />
                    <Diamond cx={520} cy={400} w={210} h={210} label="M' III" />
                    <Diamond cx={380} cy={540} w={210} h={210} label="M II" active={activeTile === 0} accent={reg.color} />
                    <Diamond cx={240} cy={680} w={210} h={210} label="M' I" muted />
                    <Diamond cx={520} cy={680} w={210} h={210} label="M I" muted />

                    {/* outer horizons in lime */}
                    <HorizonLine x1={135} y1={225} x2={380} y2={470} color="#a3e635" label="r = r+" />
                    <HorizonLine x1={625} y1={225} x2={380} y2={470} color="#a3e635" label="r = r+" />
                    <HorizonLine x1={135} y1={455} x2={380} y2={210} color="#a3e635" label="r = r+" />
                    <HorizonLine x1={625} y1={455} x2={380} y2={210} color="#a3e635" label="r = r+" />

                    {/* inner horizons in orange */}
                    <HorizonLine x1={275} y1={505} x2={380} y2={400} color="#f59e0b" label="r = r-" />
                    <HorizonLine x1={485} y1={505} x2={380} y2={400} color="#f59e0b" label="r = r-" />
                    <HorizonLine x1={275} y1={295} x2={380} y2={400} color="#f59e0b" label="r = r-" />
                    <HorizonLine x1={485} y1={295} x2={380} y2={400} color="#f59e0b" label="r = r-" />

                    {/* horizon meeting points */}
                    <circle cx={380} cy={470} r={6} fill="#a3e635" />
                    <circle cx={380} cy={210} r={6} fill="#a3e635" />
                    <circle cx={380} cy={400} r={6} fill="#f59e0b" />

                    {/* turning-point dashed curves */}
                    <DashedCurve d="M 190 525 C 285 458, 315 430, 380 400 C 445 430, 475 458, 570 525" stroke="#dc2626" />
                    <DashedCurve d="M 190 275 C 285 342, 315 370, 380 400 C 445 370, 475 342, 570 275" stroke="#dc2626" />
                    <DashedCurve d="M 205 480 C 238 405, 244 355, 205 280" stroke="#dc2626" dash="3 5" />
                    <DashedCurve d="M 555 480 C 522 405, 516 355, 555 280" stroke="#dc2626" dash="3 5" />

                    <g fontSize="11" fill="#dc2626" fontWeight="600">
                        <text x={162} y={504} transform="rotate(57 162 504)">r = rmin</text>
                        <text x={563} y={505} transform="rotate(-57 563 505)">r = rmax</text>
                        <text x={527} y={315} transform="rotate(-57 527 315)">r = rmax</text>
                        <text x={214} y={318} transform="rotate(57 214 318)">r = rmin</text>
                    </g>

                    {/* snapshot ghost path (drawn first, beneath the live path) */}
                    {snapshot && (
                        <path
                            d={PATH_D}
                            fill="none"
                            stroke="#f97316"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray="6 5"
                            opacity="0.7"
                        />
                    )}

                    {/* photon path: glow + bright stroke */}
                    <path d={PATH_D} fill="none" stroke={reg.color} strokeWidth="6" strokeLinecap="round" filter="url(#kerrGlow)" />
                    <path d={PATH_D} fill="none" stroke={reg.color} strokeWidth="2" strokeLinecap="round" opacity="0.95" />

                    {/* photon dot */}
                    {ghostDot && (
                        <circle cx={ghostDot.x} cy={ghostDot.y} r={5} fill="none" stroke="#f97316" strokeWidth="1.5" strokeDasharray="2 2" />
                    )}
                    <circle cx={dot.x} cy={dot.y} r={9} fill={reg.color} stroke="#0a0a0a" strokeWidth="2" />

                    <text x={418} y={586} fontSize="16" fontWeight="700" fill={reg.color}>A</text>
                </svg>

                <div className="grid grid-cols-4 gap-3 mt-3 text-xs">
                    <div className="text-lime-200/60">
                        r+: <span className="text-lime-400 font-mono">{rPlus.toFixed(3)}</span>
                    </div>
                    <div className="text-lime-200/60">
                        r-: <span className="text-lime-400 font-mono">{rMinus.toFixed(3)}</span>
                    </div>
                    <div className="text-lime-200/60">
                        crossings: <span className="text-lime-400 font-mono">{metrics.crossings}</span>
                    </div>
                    <div className="text-lime-200/60">
                        phase: <span className="text-lime-400 font-mono">{phase.toFixed(2)}</span>
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
