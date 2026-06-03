'use client';

import React from 'react';

import { frequencyLadder } from '../../logic';
import type { Params, Metrics } from '../../logic';


interface BridgeDiagramProps {
    params: Params;
    metrics: Metrics;
}


export default function BridgeDiagram({ params, metrics }: BridgeDiagramProps) {
    const freqs = frequencyLadder(params.pairs, params.base);
    const f0 = freqs[0];
    const iAng = (params.tokenI * f0) - Math.PI / 2;
    const jAng = (params.tokenJ * f0) - Math.PI / 2;
    const pos = params.tokenI / Math.max(1, params.seqLen - 1);
    const phaseAdvanceRad = (params.phaseSlope * Math.PI / 180) * pos;

    const W = 720;
    const H = 360;
    const leftX = W * 0.27;
    const rightX = W * 0.73;
    const cy = H * 0.5;
    const R = 100;

    const arrowEnd = (cx: number, cyP: number, ang: number, len: number) => ({
        x: cx + Math.cos(ang) * len,
        y: cyP + Math.sin(ang) * len,
    });

    const qEnd = arrowEnd(leftX, cy, iAng, R * 0.75);
    const kEnd = arrowEnd(leftX, cy, jAng, R * 0.75);

    const thetaEnd = arrowEnd(rightX, cy, -Math.PI / 2, R * 0.75);
    const spikeEnd = arrowEnd(rightX, cy, -Math.PI / 2 - phaseAdvanceRad, R * 0.62);

    return (
        <div className="border border-lime-500/20 bg-[#0a0a0a] p-3 space-y-2">
            <div className="text-xs text-lime-200/60 font-mono uppercase tracking-wide">
                side-by-side · the shared abstraction
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
                {/* labels */}
                <text x={leftX} y={28} fontSize="13" fontFamily="monospace" fill="#a3e635" textAnchor="middle">
                    RoPE plane
                </text>
                <text x={rightX} y={28} fontSize="13" fontFamily="monospace" fill="#84cc16" textAnchor="middle">
                    neural phase
                </text>

                {/* RoPE circle */}
                <circle cx={leftX} cy={cy} r={R} fill="none" stroke="rgba(163, 230, 53, 0.3)" strokeWidth={2.5} />
                <line x1={leftX} y1={cy} x2={qEnd.x} y2={qEnd.y} stroke="#a3e635" strokeWidth={3} />
                <circle cx={qEnd.x} cy={qEnd.y} r={5} fill="#a3e635" />
                <line x1={leftX} y1={cy} x2={kEnd.x} y2={kEnd.y} stroke="#facc15" strokeWidth={3} />
                <circle cx={kEnd.x} cy={kEnd.y} r={5} fill="#facc15" />
                <text x={leftX} y={cy + R + 24} fontSize="11" fontFamily="monospace" fill="#a3e635" textAnchor="middle">
                    qᵢ rotated by i = {params.tokenI}
                </text>
                <text x={leftX} y={cy + R + 42} fontSize="11" fontFamily="monospace" fill="#facc15" textAnchor="middle">
                    kⱼ rotated by j = {params.tokenJ}
                </text>

                {/* Neural circle */}
                <circle cx={rightX} cy={cy} r={R} fill="none" stroke="rgba(132, 204, 22, 0.3)" strokeWidth={2.5} />
                <line x1={rightX} y1={cy} x2={thetaEnd.x} y2={thetaEnd.y} stroke="#84cc16" strokeWidth={3} />
                <circle cx={thetaEnd.x} cy={thetaEnd.y} r={5} fill="#84cc16" />
                <line x1={rightX} y1={cy} x2={spikeEnd.x} y2={spikeEnd.y} stroke="#facc15" strokeWidth={3} />
                <circle cx={spikeEnd.x} cy={spikeEnd.y} r={5} fill="#facc15" />
                <text x={rightX} y={cy + R + 24} fontSize="11" fontFamily="monospace" fill="#84cc16" textAnchor="middle">
                    rhythm phase
                </text>
                <text x={rightX} y={cy + R + 42} fontSize="11" fontFamily="monospace" fill="#facc15" textAnchor="middle">
                    spike phase shifted by position
                </text>

                {/* bridge */}
                <line x1={leftX + R + 14} y1={cy} x2={rightX - R - 14} y2={cy} stroke="rgba(163, 230, 53, 0.4)" strokeWidth={1.5} />
                <text x={W / 2} y={cy - 18} fontSize="11" fontFamily="monospace" fill="#facc15" textAnchor="middle">
                    relative displacement → phase difference
                </text>

                {/* readout */}
                <text x={W / 2} y={H - 28} fontSize="11" fontFamily="monospace" fill="#a3e635" textAnchor="middle">
                    RoPE relative angle: {metrics.relativeAngle.toFixed(1)}°
                </text>
                <text x={W / 2} y={H - 12} fontSize="11" fontFamily="monospace" fill="#facc15" textAnchor="middle">
                    neural phase advance: {metrics.phaseAdvance.toFixed(1)}°
                </text>
            </svg>
        </div>
    );
}
