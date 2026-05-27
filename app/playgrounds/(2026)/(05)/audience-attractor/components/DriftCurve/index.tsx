'use client';

import React, { useMemo } from 'react';
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

import { driftData, type Params } from '../../logic';


interface DriftCurveProps {
    params: Params;
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
                {typeof label === 'number' ? `${Math.round(Math.pow(10, label) - 1).toLocaleString()} viewers` : label}
            </div>
            {payload.map((p, i) => (
                <div key={i}>
                    <span style={{ color: p.color }}>{p.name}</span>: {Number(p.value).toFixed(3)}
                </div>
            ))}
        </div>
    );
}

export default function DriftCurve({ params }: DriftCurveProps) {
    const data = useMemo(() => driftData(params), [params]);

    // find approximate zero crossings to display as candidate attractors.
    const crossings = useMemo(() => {
        const result: { logViewers: number; viewers: number; slope: number }[] = [];
        for (let i = 1; i < data.length; i++) {
            const a = data[i - 1];
            const b = data[i];
            if ((a.drift > 0 && b.drift <= 0) || (a.drift < 0 && b.drift >= 0) || a.drift === 0) {
                const t = a.drift / (a.drift - b.drift || 1);
                const cross = a.logViewers + (b.logViewers - a.logViewers) * t;
                const slope = (b.drift - a.drift) / (b.logViewers - a.logViewers || 1);
                result.push({
                    logViewers: cross,
                    viewers: Math.pow(10, cross) - 1,
                    slope,
                });
            }
        }
        return result;
    }, [data]);

    const floorLog = Math.log10(params.initialFloor + 1);
    const capLog = Math.log10(params.capacity + 1);

    return (
        <div className="w-full space-y-4">
            <div className="border border-lime-500/20 p-3">
                <div className="text-[10px] text-lime-200/40 uppercase tracking-wide mb-2">
                    conditional drift curve
                </div>
                <div className="text-xs text-lime-200/60 mb-3 font-mono">
                    positive drift means expected growth at that viewership; negative means pullback. zero crossings with negative slope are candidate stable attractors.
                </div>
                <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer width="100%" height={280} minWidth={0}>
                        <LineChart data={data} margin={{ top: 10, right: 24, bottom: 14, left: 8 }}>
                            <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                            <XAxis
                                dataKey="logViewers"
                                type="number"
                                domain={[0, 'dataMax']}
                                tick={{ fill: '#a3e635', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v: number) => Math.round(Math.pow(10, v) - 1).toLocaleString()}
                            />
                            <YAxis
                                tick={{ fill: '#a3e635', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <ReTooltip content={<ChartTooltip />} />
                            <ReferenceLine y={0} stroke="#a3e635" strokeOpacity={0.45} strokeWidth={1} />
                            <ReferenceLine
                                x={floorLog}
                                stroke="#a3e635"
                                strokeDasharray="4 4"
                                strokeOpacity={0.5}
                                label={{ value: 'floor', fill: '#a3e635', fontSize: 9, position: 'top' }}
                            />
                            <ReferenceLine
                                x={capLog}
                                stroke="#facc15"
                                strokeDasharray="4 4"
                                strokeOpacity={0.5}
                                label={{ value: 'capacity', fill: '#facc15', fontSize: 9, position: 'top' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="drift"
                                stroke="#a3e635"
                                strokeWidth={2.4}
                                dot={false}
                                name="drift"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {crossings.length > 0 && (
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide mb-2">
                        zero crossings (candidate attractors)
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        {crossings.map((c, i) => (
                            <div key={i} className="border border-lime-500/10 px-2 py-1">
                                <span className="text-lime-200/40">viewers:</span>{' '}
                                <span className="text-lime-400 font-mono">
                                    {Math.round(c.viewers).toLocaleString()}
                                </span>
                                <span className="ml-3 text-lime-200/40">slope:</span>{' '}
                                <span
                                    className={`font-mono ${
                                        c.slope < 0 ? 'text-lime-400' : 'text-orange-400'
                                    }`}
                                >
                                    {c.slope.toFixed(3)} {c.slope < 0 ? '(stable)' : '(unstable)'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
