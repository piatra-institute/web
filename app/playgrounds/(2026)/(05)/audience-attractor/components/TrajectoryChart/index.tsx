'use client';

import React from 'react';
import {
    AreaChart,
    Area,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ReTooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';

import type { Params, SimEvent, SimRow, Snapshot } from '../../logic';


interface TrajectoryChartProps {
    params: Params;
    rows: SimRow[];
    events: SimEvent[];
    snapshot: Snapshot | null;
}

function ChartTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: Array<{ value: number; name: string; color: string }>;
    label?: string | number;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div
            style={{
                background: '#0a0a0a',
                border: '1px solid #84cc16',
                padding: 10,
                color: '#ecfccb',
                fontSize: 11,
            }}
        >
            <div style={{ marginBottom: 4, color: '#a3e635' }}>
                period {typeof label === 'number' ? label : label}
            </div>
            {payload.map((p, i) => (
                <div key={i}>
                    <span style={{ color: p.color }}>{p.name}</span>: {Number(p.value).toLocaleString()}
                </div>
            ))}
        </div>
    );
}

export default function TrajectoryChart({ params, rows, events, snapshot }: TrajectoryChartProps) {
    // build a merged dataset with optional ghost columns
    const data = rows.map((r) => {
        const ghost = snapshot?.rows[r.t];
        return {
            t: r.t,
            viewers: r.viewers,
            core: r.core,
            casual: r.casual,
            ghostViewers: ghost ? ghost.viewers : undefined,
        };
    });

    return (
        <div className="w-full space-y-4">
            <div className="border border-lime-500/20 p-3">
                <div className="text-[10px] text-lime-200/40 uppercase tracking-wide mb-2">
                    audience trajectory across {rows.length} periods
                </div>
                <div style={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer width="100%" height={320} minWidth={0}>
                        <AreaChart data={data} margin={{ top: 10, right: 24, bottom: 10, left: 8 }}>
                            <CartesianGrid stroke="#333" strokeDasharray="3 3" />
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
                                tickFormatter={(v: number) => v.toLocaleString()}
                            />
                            <ReTooltip content={<ChartTooltip />} />
                            <ReferenceLine
                                y={params.capacity}
                                stroke="#facc15"
                                strokeDasharray="4 4"
                                strokeOpacity={0.6}
                                label={{ value: 'capacity', fill: '#facc15', fontSize: 9, position: 'insideTopRight' }}
                            />
                            <ReferenceLine
                                y={params.initialFloor}
                                stroke="#a3e635"
                                strokeDasharray="4 4"
                                strokeOpacity={0.6}
                                label={{ value: 'floor', fill: '#a3e635', fontSize: 9, position: 'insideBottomRight' }}
                            />
                            {events.map((ev, i) => (
                                <ReferenceLine
                                    key={i}
                                    x={ev.t}
                                    stroke="#f59e0b"
                                    strokeDasharray="2 3"
                                    strokeOpacity={0.55}
                                />
                            ))}
                            <Area
                                type="monotone"
                                dataKey="viewers"
                                stroke="#a3e635"
                                strokeWidth={2.4}
                                fill="#84cc16"
                                fillOpacity={0.18}
                                name="total viewers"
                            />
                            <Area
                                type="monotone"
                                dataKey="core"
                                stroke="#65a30d"
                                strokeWidth={1.5}
                                fill="#65a30d"
                                fillOpacity={0.12}
                                name="core audience"
                            />
                            <Line
                                type="monotone"
                                dataKey="casual"
                                stroke="#facc15"
                                strokeWidth={1.5}
                                dot={false}
                                name="casual audience"
                            />
                            {snapshot && (
                                <Line
                                    type="monotone"
                                    dataKey="ghostViewers"
                                    stroke="#f97316"
                                    strokeWidth={1.4}
                                    strokeDasharray="5 4"
                                    dot={false}
                                    name="snapshot total"
                                />
                            )}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {events.length > 0 && (
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide mb-2">
                        events fired during this run
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        {events.map((ev, i) => (
                            <div key={i} className="border border-lime-500/10 px-2 py-1 flex justify-between">
                                <span className="text-lime-200/70">{ev.label}</span>
                                <span className="text-lime-400 font-mono">t = {ev.t}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
