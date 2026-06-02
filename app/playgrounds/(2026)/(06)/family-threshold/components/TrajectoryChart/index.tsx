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
    ReferenceLine,
} from 'recharts';

import ChartTooltip from '@/components/ChartTooltip';

import { ACTION_LABELS, type Snapshot, type StepRecord } from '../../logic';


interface TrajectoryChartProps {
    steps: StepRecord[];
    snapshot: Snapshot | null;
}


export default function TrajectoryChart({ steps, snapshot }: TrajectoryChartProps) {
    const data = steps.map((s) => ({
        t: s.t,
        belief: Number((s.belief * 100).toFixed(1)),
        harm: Number((s.state.H * 100).toFixed(1)),
        attachment: Number((s.state.A * 100).toFixed(1)),
        trust: Number((s.state.T * 100).toFixed(1)),
        family: Number((s.state.F * 100).toFixed(1)),
        ghostBelief: snapshot?.result.steps[s.t - 1]
            ? Number((snapshot.result.steps[s.t - 1].belief * 100).toFixed(1))
            : undefined,
    }));

    const events = steps.filter((s) =>
        s.action === 'temporaryRemoval' || s.action === 'reunify' || s.action === 'permanentSeparation',
    );

    return (
        <div className="w-full space-y-4">
            <div className="border border-lime-500/20 p-3">
                <div className="text-[10px] text-lime-200/40 uppercase tracking-wide mb-2">
                    trajectory over {steps.length} steps · all values on 0-100 scale
                </div>
                <div style={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer width="100%" height={320} minWidth={0}>
                        <LineChart data={data} margin={{ top: 10, right: 24, bottom: 10, left: 8 }}>
                            <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                            <XAxis
                                dataKey="t"
                                tick={{ fill: '#a3e635', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fill: '#a3e635', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <ReTooltip
                                content={
                                    <ChartTooltip
                                        labelFormat={(l) => `step ${l}`}
                                        valueFormat={(v) => Number(v).toFixed(0)}
                                    />
                                }
                            />
                            {events.map((s, i) => (
                                <ReferenceLine
                                    key={i}
                                    x={s.t}
                                    stroke={
                                        s.action === 'reunify' ? '#a3e635'
                                            : s.action === 'permanentSeparation' ? '#ea580c'
                                                : '#f59e0b'
                                    }
                                    strokeDasharray="2 3"
                                    strokeOpacity={0.6}
                                />
                            ))}
                            <Line type="monotone" dataKey="belief" stroke="#a3e635" strokeWidth={2.4} dot={false} name="belief" />
                            <Line type="monotone" dataKey="harm" stroke="#ea580c" strokeWidth={2} dot={false} name="actual harm" />
                            <Line type="monotone" dataKey="attachment" stroke="#84cc16" strokeWidth={1.5} dot={false} name="attachment" strokeDasharray="6 3" />
                            <Line type="monotone" dataKey="trust" stroke="#65a30d" strokeWidth={1.5} dot={false} name="trust" strokeDasharray="3 3" />
                            <Line type="monotone" dataKey="family" stroke="#facc15" strokeWidth={1.5} dot={false} name="family integrity" strokeDasharray="2 4" />
                            {snapshot && (
                                <Line type="monotone" dataKey="ghostBelief" stroke="#f97316" strokeWidth={1.4} strokeDasharray="5 4" dot={false} name="snapshot belief" />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {events.length > 0 && (
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide mb-2">
                        intervention events
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        {events.map((s, i) => (
                            <div key={i} className="border border-lime-500/10 px-2 py-1 flex justify-between">
                                <span className="text-lime-200/70">{ACTION_LABELS[s.action]}</span>
                                <span className="text-lime-400 font-mono">t = {s.t}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
