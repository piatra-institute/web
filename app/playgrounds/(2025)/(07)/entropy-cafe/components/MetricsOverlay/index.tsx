'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis } from 'recharts';

import type { SimulationMetrics } from '../../types';

interface MetricsOverlayProps {
    metrics: SimulationMetrics;
    history: SimulationMetrics[];
}

const METRIC_LINES = [
    { key: 'entropy', label: 'entropy', color: '#84cc16', text: 'text-lime-400' },
    { key: 'mixedness', label: 'mixedness', color: '#d9f99d', text: 'text-lime-200' },
    { key: 'complexity', label: 'complexity', color: '#f59e0b', text: 'text-amber-400' },
    { key: 'kinetic', label: 'kinetic', color: '#38bdf8', text: 'text-sky-300' },
] as const;

export default function MetricsOverlay({ metrics, history }: MetricsOverlayProps) {
    const data = React.useMemo(() => (
        history.map((entry, index) => ({ index, ...entry }))
    ), [history]);

    return (
        <div className="absolute top-4 right-4 w-80 bg-black/70 border border-lime-500/30 p-4 pointer-events-none">
            <div className="space-y-4">
                {METRIC_LINES.map((metric) => (
                    <div key={metric.key}>
                        <div className="flex justify-between items-baseline mb-2">
                            <h3 className="text-xs uppercase tracking-[0.2em] text-lime-200/70">
                                {metric.label}
                            </h3>
                            <span className={`font-mono text-sm ${metric.text}`}>
                                {metrics[metric.key].toFixed(3)}
                            </span>
                        </div>
                        <div className="h-14">
                            <LineChart width={240} height={56} data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                <XAxis dataKey="index" hide />
                                <YAxis hide domain={[0, 'dataMax']} />
                                <Line
                                    type="monotone"
                                    dataKey={metric.key}
                                    stroke={metric.color}
                                    strokeWidth={2}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            </LineChart>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
