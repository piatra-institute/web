'use client';

import React, { useMemo } from 'react';

import { placeFieldCurve, placeFieldSpikes } from '../../logic';
import type { Params, Metrics } from '../../logic';


interface NeuralPhaseProps {
    params: Params;
    metrics: Metrics;
}


export default function NeuralPhase({ params, metrics }: NeuralPhaseProps) {
    const curve = useMemo(
        () => placeFieldCurve(params.phaseSlope),
        [params.phaseSlope],
    );
    const spikes = useMemo(
        () => placeFieldSpikes(params.phaseSlope, params.noise, params.seed),
        [params.phaseSlope, params.noise, params.seed],
    );

    // theta wheel sizing
    const tw = { W: 360, H: 360 };
    const cx = tw.W / 2;
    const cy = tw.H / 2 - 8;
    const R = 120;

    const pos = params.tokenI / Math.max(1, params.seqLen - 1);
    const phaseAdvanceDeg = params.phaseSlope * pos;
    const spikePhaseRad = (-phaseAdvanceDeg * Math.PI) / 180;

    const thetaRad = 0;
    const arrowEnd = (ang: number, len: number) => ({
        x: cx + Math.cos(ang - Math.PI / 2) * len,
        y: cy + Math.sin(ang - Math.PI / 2) * len,
    });

    const thetaEnd = arrowEnd(thetaRad, R * 0.92);
    const spikeEnd = arrowEnd(spikePhaseRad, R * 0.7);

    // place field plot sizing
    const pf = { W: 360, H: 280, pad: 36 };
    const plotW = pf.W - pf.pad * 2;
    const plotH = pf.H - pf.pad * 2;
    const ratePath = curve
        .map((c, idx) => {
            const x = pf.pad + c.x * plotW;
            const y = pf.pad + plotH - c.rate * plotH * 0.82;
            return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(' ');

    // build phase line with breaks where it wraps
    const phasePathSegments: string[] = [];
    let segment: string[] = [];
    let prevPhase = curve[0].phase;
    curve.forEach((c, idx) => {
        const x = pf.pad + c.x * plotW;
        const y = pf.pad + c.phase * plotH;
        if (idx > 0 && Math.abs(c.phase - prevPhase) > 0.5) {
            phasePathSegments.push(segment.join(' '));
            segment = [];
        }
        segment.push(`${segment.length === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
        prevPhase = c.phase;
    });
    if (segment.length > 0) phasePathSegments.push(segment.join(' '));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border border-lime-500/20 bg-[#0a0a0a] p-3 space-y-2">
                <div className="text-xs text-lime-200/60 font-mono uppercase tracking-wide">
                    theta cycle · phase precession
                </div>
                <svg viewBox={`0 0 ${tw.W} ${tw.H}`} className="w-full h-auto block">
                    {/* outer ring */}
                    <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(132, 204, 22, 0.4)" strokeWidth={2.5} />
                    {/* phase ticks (clock face) */}
                    {Array.from({ length: 12 }, (_, k) => {
                        const a = (k * Math.PI * 2) / 12 - Math.PI / 2;
                        const x1 = cx + Math.cos(a) * R * 0.92;
                        const y1 = cy + Math.sin(a) * R * 0.92;
                        const x2 = cx + Math.cos(a) * R * 1.05;
                        const y2 = cy + Math.sin(a) * R * 1.05;
                        return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(163, 230, 53, 0.3)" strokeWidth={1} />;
                    })}
                    {/* theta arrow at 0° (top) */}
                    <line x1={cx} y1={cy} x2={thetaEnd.x} y2={thetaEnd.y} stroke="#84cc16" strokeWidth={3} />
                    <circle cx={thetaEnd.x} cy={thetaEnd.y} r={5} fill="#84cc16" />

                    {/* spike phase arrow */}
                    <line x1={cx} y1={cy} x2={spikeEnd.x} y2={spikeEnd.y} stroke="#facc15" strokeWidth={3} />
                    <circle cx={spikeEnd.x} cy={spikeEnd.y} r={7} fill="#facc15" />

                    <text x={cx} y={tw.H - 56} fill="#84cc16" fontSize="11" fontFamily="monospace" textAnchor="middle">
                        rhythm phase (lime) · spike phase (yellow)
                    </text>
                    <text x={cx} y={tw.H - 38} fill="#facc15" fontSize="11" fontFamily="monospace" textAnchor="middle">
                        spike phase ≈ {(((-phaseAdvanceDeg) % 360 + 360) % 360).toFixed(0)}°
                    </text>
                    <text x={cx} y={tw.H - 20} fill="#84cc16" fontSize="11" fontFamily="monospace" textAnchor="middle">
                        phase advance ≈ {phaseAdvanceDeg.toFixed(0)}°
                    </text>
                </svg>
            </div>

            <div className="border border-lime-500/20 bg-[#0a0a0a] p-3 space-y-2">
                <div className="text-xs text-lime-200/60 font-mono uppercase tracking-wide">
                    place field · rate × phase
                </div>
                <svg viewBox={`0 0 ${pf.W} ${pf.H}`} className="w-full h-auto block">
                    <line x1={pf.pad} y1={pf.pad + plotH} x2={pf.pad + plotW} y2={pf.pad + plotH} stroke="rgba(163, 230, 53, 0.25)" />
                    <line x1={pf.pad} y1={pf.pad} x2={pf.pad} y2={pf.pad + plotH} stroke="rgba(163, 230, 53, 0.25)" />

                    {/* rate envelope */}
                    <path d={ratePath} stroke="#a3e635" strokeWidth={2.5} fill="none" />

                    {/* phase curve segments */}
                    {phasePathSegments.map((seg, idx) => (
                        <path key={idx} d={seg} stroke="#facc15" strokeWidth={2} fill="none" strokeDasharray="4 3" />
                    ))}

                    {/* spikes */}
                    {spikes.map((s, idx) => (
                        <circle
                            key={idx}
                            cx={pf.pad + s.x * plotW}
                            cy={pf.pad + s.phase * plotH}
                            r={2}
                            fill="rgba(250, 204, 21, 0.7)"
                        />
                    ))}

                    {/* current position marker */}
                    <line
                        x1={pf.pad + pos * plotW}
                        y1={pf.pad}
                        x2={pf.pad + pos * plotW}
                        y2={pf.pad + plotH}
                        stroke="#ffd166"
                        strokeWidth={1.5}
                        strokeDasharray="3 3"
                    />

                    <text x={12} y={pf.pad + plotH / 2} fontSize="10" fontFamily="monospace" fill="#a3e635" textAnchor="middle" transform={`rotate(-90 12 ${pf.pad + plotH / 2})`}>
                        rate
                    </text>
                    <text x={pf.W - 12} y={pf.pad + plotH / 2} fontSize="10" fontFamily="monospace" fill="#facc15" textAnchor="middle" transform={`rotate(-90 ${pf.W - 12} ${pf.pad + plotH / 2})`}>
                        phase
                    </text>
                    <text x={pf.pad} y={pf.pad + plotH + 18} fontSize="9" fontFamily="monospace" fill="rgba(163, 230, 53, 0.5)" textAnchor="start">
                        0
                    </text>
                    <text x={pf.pad + plotW} y={pf.pad + plotH + 18} fontSize="9" fontFamily="monospace" fill="rgba(163, 230, 53, 0.5)" textAnchor="end">
                        1
                    </text>
                    <text x={pf.pad + plotW / 2} y={20} fontSize="10" fontFamily="monospace" fill="rgba(163, 230, 53, 0.7)" textAnchor="middle">
                        position through place field
                    </text>
                </svg>
                <div className="text-[10px] text-lime-200/50 font-mono">
                    grid coherence ≈ {(metrics.gridCoherence * 100).toFixed(0)}%
                </div>
            </div>
        </div>
    );
}
