'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ReTooltip,
    ResponsiveContainer,
} from 'recharts';

import ChartTooltip from '@/components/ChartTooltip';

import { bandLabel, type DetectedBand, type Metrics } from '../../logic';


interface BandHistogramProps {
    bands: DetectedBand[];
    metrics: Metrics;
}

export default function BandHistogram({ bands, metrics }: BandHistogramProps) {
    const data = bands.map((b) => ({
        band: b.band,
        share: b.share,
        midpoint: b.midpoint,
    }));

    // colour the dominant band in lime, the others muted.
    const dominantBand = bands[0]?.band;

    return (
        <div className="w-full space-y-4">
            <div className="border border-lime-500/20 p-3">
                <div className="text-[10px] text-lime-200/40 uppercase tracking-wide mb-2">
                    dwell time by log-viewer band
                </div>
                <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer width="100%" height={280} minWidth={0}>
                        <BarChart data={data} margin={{ top: 10, right: 24, bottom: 36, left: 8 }}>
                            <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                            <XAxis
                                dataKey="band"
                                tick={{ fill: '#a3e635', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                angle={-15}
                                textAnchor="end"
                                interval={0}
                            />
                            <YAxis
                                tick={{ fill: '#a3e635', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
                            />
                            <ReTooltip
                                content={
                                    <ChartTooltip
                                        valueFormat={(v) => `${(Number(v) * 100).toFixed(1)}%`}
                                    />
                                }
                            />
                            <Bar dataKey="share" name="dwell share">
                                {data.map((d, i) => (
                                    <Cell
                                        key={i}
                                        fill={d.band === dominantBand ? '#a3e635' : '#65a30d'}
                                        fillOpacity={d.band === dominantBand ? 0.85 : 0.5}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">dominant band</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">
                        {bands[0]?.band ?? 'n/a'}
                    </div>
                    <div className="text-[10px] text-lime-200/40 mt-1">
                        {bands[0] ? bandLabel(bands[0].midpoint) : ''}
                    </div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">dwell share</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">
                        {(metrics.dwellShare * 100).toFixed(0)}%
                    </div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">log range</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">
                        {metrics.logRange.toFixed(2)}
                    </div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">core share</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">
                        {(metrics.coreShare * 100).toFixed(0)}%
                    </div>
                </div>
            </div>

            <div className="border border-lime-500/20 p-3 text-xs text-lime-200/60 leading-relaxed">
                a single high-share band is a candidate attractor. two roughly equal bands often mean the trajectory transitioned between basins. a flat distribution means the system is wandering rather than orbiting.
            </div>
        </div>
    );
}
