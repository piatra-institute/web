'use client';

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ReTooltip,
    ResponsiveContainer,
    ReferenceArea,
} from 'recharts';

import {
    Datum,
    Phase,
    Narrative,
    SimStats,
} from '../../logic';

interface ViewerProps {
    data: Datum[];
    phases: Phase[];
    narrative: Narrative;
    stats: SimStats;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; name: string }> }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: '#0a0a0a',
            border: '1px solid #84cc16',
            borderRadius: 0,
            padding: 10,
            color: '#ecfccb',
            fontSize: 11,
        }}>
            {payload.map((p, i) => (
                <div key={i}>
                    <span style={{ color: '#a3e635' }}>{p.name}</span>: {Number(p.value).toFixed(3)}
                </div>
            ))}
        </div>
    );
}

export default function Viewer({
    data,
    phases,
    narrative,
    stats,
}: ViewerProps) {
    return (
        <div className="w-[90vw] h-[90vh] max-w-[1000px] overflow-y-auto space-y-6 outline-none [&_*]:outline-none text-lime-100">
            {/* Narrative */}
            <div className="border border-lime-500/30 p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <div className="text-lime-400 font-semibold text-sm">{narrative.label}</div>
                        <div className="text-lime-200/60 text-xs mt-1">{narrative.blurb}</div>
                    </div>
                    <div className="flex gap-6 text-xs font-mono text-lime-200/60">
                        <div>peak A: <span className="text-lime-400">{stats.peakA.toFixed(2)}</span></div>
                        <div>peak C: <span className="text-lime-400">{stats.peakC.toFixed(2)}</span></div>
                        <div>probe mean A: <span className="text-lime-400">{stats.probeMeanA.toFixed(2)}</span></div>
                    </div>
                </div>
            </div>

            {/* Time-series chart */}
            <div>
                <div className="text-xs text-lime-200/60 mb-2 font-mono">
                    time-series: A (output) / B (gate) / C (memory) / U1, U2 (stimuli)
                </div>
                <div style={{ width: '100%', height: 420 }}>
                    <ResponsiveContainer width="100%" height={420} minWidth={0}>
                        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                            <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                            {phases.map((ph) => (
                                <ReferenceArea
                                    key={ph.label}
                                    x1={ph.start}
                                    x2={ph.end}
                                    fill={ph.label === 'training' ? 'rgba(132,204,22,0.08)' : ph.label === 'probe' ? 'rgba(132,204,22,0.05)' : 'transparent'}
                                    strokeOpacity={0}
                                />
                            ))}
                            <XAxis
                                dataKey="t"
                                tick={{ fill: '#a3e635', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                tick={{ fill: '#a3e635', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                domain={[0, 'auto']}
                            />
                            <ReTooltip content={<ChartTooltip />} />
                            <Line type="monotone" dataKey="a" stroke="#84cc16" strokeWidth={2.5} dot={false} name="A / output" />
                            <Line type="monotone" dataKey="b" stroke="#a3e635" strokeWidth={2} dot={false} name="B / gate" />
                            <Line type="monotone" dataKey="c" stroke="#65a30d" strokeWidth={2} dot={false} name="C / memory" />
                            <Line type="monotone" dataKey="u1" stroke="#4d7c0f" strokeDasharray="4 4" strokeWidth={1.5} dot={false} name="U1" />
                            <Line type="monotone" dataKey="u2" stroke="#365314" strokeDasharray="4 4" strokeWidth={1.5} dot={false} name="U2" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Final state */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    ['final A', stats.finalA],
                    ['final B', stats.finalB],
                    ['final C', stats.finalC],
                    ['probe mean A', stats.probeMeanA],
                ].map(([label, val]) => (
                    <div key={String(label)} className="border border-lime-500/20 p-3">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">{String(label)}</div>
                        <div className="text-lg font-mono text-lime-400 mt-1">{Number(val).toFixed(3)}</div>
                    </div>
                ))}
            </div>

            {/* Phase legend */}
            <div className="flex gap-4 text-xs text-lime-200/40">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3" style={{ background: 'rgba(132,204,22,0.08)' }} />
                    training
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3" style={{ background: 'rgba(132,204,22,0.05)' }} />
                    probe
                </div>
            </div>
        </div>
    );
}
