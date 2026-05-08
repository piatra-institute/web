'use client';

import React from 'react';

import { Params, criticalCurve } from '../../logic';


interface PhaseDiagramProps {
    params: Params;
    onPickPoint?: (gain: number, damping: number) => void;
}

const W = 460;
const H = 320;
const PAD_L = 50;
const PAD_R = 22;
const PAD_T = 22;
const PAD_B = 40;

const GAIN_MAX = 2;
const DAMP_MAX = 0.5;

function gainToX(g: number) {
    return PAD_L + (g / GAIN_MAX) * (W - PAD_L - PAD_R);
}
function dampToY(d: number) {
    return H - PAD_B - (d / DAMP_MAX) * (H - PAD_T - PAD_B);
}
function xToGain(x: number) {
    return ((x - PAD_L) / (W - PAD_L - PAD_R)) * GAIN_MAX;
}
function yToDamp(y: number) {
    return ((H - PAD_B - y) / (H - PAD_T - PAD_B)) * DAMP_MAX;
}

export default function PhaseDiagram({ params, onPickPoint }: PhaseDiagramProps) {
    const curve = criticalCurve(params);
    const curvePath = curve
        .map((c, i) => `${i === 0 ? 'M' : 'L'} ${gainToX(c.gain).toFixed(2)} ${dampToY(c.damping).toFixed(2)}`)
        .join(' ');

    const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!onPickPoint) return;
        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * W;
        const y = ((e.clientY - rect.top) / rect.height) * H;
        const gain = Math.max(0, Math.min(GAIN_MAX, xToGain(x)));
        const damping = Math.max(0.005, Math.min(DAMP_MAX, yToDamp(y)));
        onPickPoint(gain, damping);
    };

    const cx = gainToX(params.gain);
    const cy = dampToY(params.damping);

    return (
        <div className="border border-lime-500/30 bg-[#0a0a0a] p-2">
            <svg
                viewBox={`0 0 ${W} ${H}`}
                className={`w-full h-auto ${onPickPoint ? 'cursor-crosshair' : ''}`}
                onClick={handleClick}
            >
                {/* Subcritical region */}
                <rect
                    x={PAD_L}
                    y={PAD_T}
                    width={W - PAD_L - PAD_R}
                    height={H - PAD_T - PAD_B}
                    fill="rgba(132, 204, 22, 0.04)"
                />

                {/* Supercritical region (above critical curve) */}
                {curve.length > 1 && (
                    <path
                        d={`${curvePath} L ${gainToX(GAIN_MAX).toFixed(2)} ${dampToY(0).toFixed(2)} L ${gainToX(curve[curve.length - 1].gain).toFixed(2)} ${dampToY(0).toFixed(2)} Z`}
                        fill="rgba(249, 115, 22, 0.10)"
                        stroke="none"
                    />
                )}

                {/* Critical curve */}
                {curve.length > 1 && (
                    <path d={curvePath} fill="none" stroke="#a3e635" strokeWidth={2} strokeDasharray="6 3" />
                )}

                {/* Axes */}
                <line x1={PAD_L} y1={H - PAD_B} x2={W - PAD_R} y2={H - PAD_B} stroke="rgba(163, 230, 53, 0.4)" strokeWidth={1} />
                <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={H - PAD_B} stroke="rgba(163, 230, 53, 0.4)" strokeWidth={1} />

                {/* Tick labels */}
                {[0, 0.5, 1, 1.5, 2].map((g) => (
                    <g key={g}>
                        <line x1={gainToX(g)} y1={H - PAD_B} x2={gainToX(g)} y2={H - PAD_B + 4} stroke="rgba(163, 230, 53, 0.4)" />
                        <text
                            x={gainToX(g)}
                            y={H - PAD_B + 16}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#a3e635"
                            opacity={0.7}
                            fontFamily="monospace"
                        >
                            {g.toFixed(1)}
                        </text>
                    </g>
                ))}
                {[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((d) => (
                    <g key={d}>
                        <line x1={PAD_L - 4} y1={dampToY(d)} x2={PAD_L} y2={dampToY(d)} stroke="rgba(163, 230, 53, 0.4)" />
                        <text
                            x={PAD_L - 8}
                            y={dampToY(d) + 3}
                            textAnchor="end"
                            fontSize="10"
                            fill="#a3e635"
                            opacity={0.7}
                            fontFamily="monospace"
                        >
                            {d.toFixed(2)}
                        </text>
                    </g>
                ))}

                {/* Axis labels */}
                <text x={(PAD_L + W - PAD_R) / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="#a3e635" fontFamily="monospace">
                    gain
                </text>
                <text
                    x={14}
                    y={(PAD_T + H - PAD_B) / 2}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#a3e635"
                    fontFamily="monospace"
                    transform={`rotate(-90 14 ${(PAD_T + H - PAD_B) / 2})`}
                >
                    damping
                </text>

                {/* Region labels */}
                <text x={gainToX(0.4)} y={dampToY(0.3)} fontSize="10" fill="#a3e635" opacity={0.5} fontFamily="monospace">
                    subcritical
                </text>
                <text x={gainToX(1.5)} y={dampToY(0.05)} fontSize="10" fill="#fb923c" opacity={0.7} fontFamily="monospace">
                    supercritical
                </text>
                <text x={gainToX(1)} y={dampToY(0.42)} fontSize="10" fill="#a3e635" opacity={0.7} fontFamily="monospace">
                    λ_max = 0
                </text>

                {/* Current point */}
                <circle cx={cx} cy={cy} r={9} fill="rgba(132, 204, 22, 0.3)" />
                <circle cx={cx} cy={cy} r={5} fill="#a3e635" stroke="#0a0a0a" strokeWidth={1.5} />
            </svg>
        </div>
    );
}
