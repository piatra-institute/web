'use client';

import React from 'react';

import type { Params } from '../../logic';
import type { Metrics } from '../../logic';
import { frequencyLadder } from '../../logic';


interface RopePlaneProps {
    params: Params;
    metrics: Metrics;
}


function frequencyBar(label: string, value: number, max: number, idx: number) {
    const span = max === 0 ? 0 : Math.log10(value + 1e-12);
    const norm = max === 0 ? 0 : Math.max(0, Math.min(1, (span - Math.log10(1e-12 + max * 1e-4)) / (Math.log10(max) - Math.log10(1e-12 + max * 1e-4) + 1e-9)));
    return (
        <div key={label} className="grid grid-cols-[60px_1fr_80px] gap-2 items-center text-[10px] font-mono">
            <div className="text-lime-200/60">pair {idx}</div>
            <div className="h-2 bg-lime-500/10 relative">
                <div className="h-full bg-lime-500" style={{ width: `${norm * 100}%` }} />
            </div>
            <div className="text-lime-200/70 text-right">ω={value.toFixed(5)}</div>
        </div>
    );
}


export default function RopePlane({ params, metrics }: RopePlaneProps) {
    const freqs = frequencyLadder(params.pairs, params.base);
    const maxFreq = Math.max(...freqs);

    // Selected (i, j) and their rotation angles in the first 2D plane.
    const f0 = freqs[0];
    const i = params.tokenI;
    const j = params.tokenJ;
    const qAngBase = 0.3;
    const kAngBase = qAngBase + Math.acos(Math.max(-1, Math.min(1, params.contentSim)));
    const qAng = qAngBase + i * f0;
    const kAng = kAngBase + j * f0;

    const W = 520;
    const H = 360;
    const cx = W * 0.5;
    const cy = H * 0.5;
    const R = 130;

    const positions = [];
    for (let p = 0; p < params.seqLen; p++) {
        const a = p * f0 - Math.PI / 2;
        positions.push({
            p,
            x: cx + Math.cos(a) * (R + 14),
            y: cy + Math.sin(a) * (R + 14),
            highlight: p === i || p === j,
            color: p === i ? '#a3e635' : p === j ? '#facc15' : 'rgba(163, 230, 53, 0.35)',
        });
    }

    const arrowEnd = (ang: number, len: number) => ({
        x: cx + Math.cos(ang) * len,
        y: cy + Math.sin(ang) * len,
    });

    const qEnd = arrowEnd(qAng, R * 0.78);
    const kEnd = arrowEnd(kAng, R * 0.78);

    // arc from q to k for the relative-angle visualisation
    const rel = ((kAng - qAng + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    const arcR = R * 0.36;
    const arcStart = arrowEnd(qAng, arcR);
    const arcEnd = arrowEnd(kAng, arcR);
    const largeArc = Math.abs(rel) > Math.PI ? 1 : 0;
    const sweep = rel >= 0 ? 1 : 0;

    return (
        <div className="space-y-3">
            <div className="border border-lime-500/20 bg-[#0a0a0a] p-3">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
                    {/* axes */}
                    <line x1={cx - R - 16} y1={cy} x2={cx + R + 16} y2={cy} stroke="rgba(163, 230, 53, 0.15)" />
                    <line x1={cx} y1={cy - R - 16} x2={cx} y2={cy + R + 16} stroke="rgba(163, 230, 53, 0.15)" />

                    {/* outer circle */}
                    <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(163, 230, 53, 0.25)" />
                    <circle cx={cx} cy={cy} r={R * 0.5} fill="none" stroke="rgba(163, 230, 53, 0.12)" />

                    {/* position dots around the rim */}
                    {positions.map((d) => (
                        <g key={d.p}>
                            <circle cx={d.x} cy={d.y} r={d.highlight ? 4 : 2.2} fill={d.color} />
                            {d.highlight && (
                                <text x={d.x} y={d.y - 9} fill={d.color} fontSize="9" fontFamily="monospace" textAnchor="middle">
                                    {d.p}
                                </text>
                            )}
                        </g>
                    ))}

                    {/* relative angle arc */}
                    <path
                        d={`M ${arcStart.x} ${arcStart.y} A ${arcR} ${arcR} 0 ${largeArc} ${sweep} ${arcEnd.x} ${arcEnd.y}`}
                        stroke="#84cc16"
                        strokeWidth={2}
                        fill="none"
                    />

                    {/* q arrow */}
                    <line x1={cx} y1={cy} x2={qEnd.x} y2={qEnd.y} stroke="#a3e635" strokeWidth={3} />
                    <circle cx={qEnd.x} cy={qEnd.y} r={5} fill="#a3e635" />

                    {/* k arrow */}
                    <line x1={cx} y1={cy} x2={kEnd.x} y2={kEnd.y} stroke="#facc15" strokeWidth={3} />
                    <circle cx={kEnd.x} cy={kEnd.y} r={5} fill="#facc15" />

                    {/* readout */}
                    <text x={16} y={22} fill="#a3e635" fontSize="11" fontFamily="monospace">
                        first 2D RoPE plane
                    </text>
                    <text x={16} y={40} fill="#a3e635" fontSize="10" fontFamily="monospace">
                        q at i = {i}
                    </text>
                    <text x={16} y={56} fill="#facc15" fontSize="10" fontFamily="monospace">
                        k at j = {j}
                    </text>
                    <text x={16} y={72} fill="#84cc16" fontSize="10" fontFamily="monospace">
                        relative angle ≈ {metrics.relativeAngle.toFixed(1)}°
                    </text>
                    <text x={16} y={88} fill="#a3e635" fontSize="10" fontFamily="monospace">
                        j − i = {j - i}
                    </text>
                </svg>
            </div>

            <div className="border border-lime-500/20 p-3 space-y-1.5">
                <div className="text-xs text-lime-200/60 font-mono uppercase tracking-wide mb-2">
                    frequency ladder · log scale
                </div>
                {freqs.map((f, idx) => frequencyBar(`pair-${idx}`, f, maxFreq, idx))}
                <div className="text-[10px] text-lime-200/40 italic mt-2">
                    higher pairs rotate faster. RoPE base = {params.base}.
                </div>
            </div>
        </div>
    );
}
