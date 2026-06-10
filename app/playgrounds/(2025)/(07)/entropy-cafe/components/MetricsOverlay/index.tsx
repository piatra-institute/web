'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis } from 'recharts';

import type { MetricSample, SimulationMetrics } from '../../types';

interface MetricsOverlayProps {
    metrics: SimulationMetrics;
    history: MetricSample[];
}

const METRIC_LINES = [
    { key: 'entropy', label: 'entropy', unit: 'bits', color: '#84cc16', text: 'text-lime-400' },
    { key: 'complexity', label: 'complexity', unit: 'apparent', color: '#f59e0b', text: 'text-amber-400' },
    { key: 'mixedness', label: 'mixedness', unit: '', color: '#d9f99d', text: 'text-lime-200' },
] as const;

// Coarse-grained values in this immiscible two-species cup are small in
// absolute terms (most voxels are a single species), so show enough precision
// to read them and auto-scale the sparklines to reveal the dynamics.
function fmt(v: number): string {
    if (!Number.isFinite(v) || v === 0) return '0';
    const abs = Math.abs(v);
    if (abs >= 0.1) return v.toFixed(3);
    if (abs >= 0.001) return v.toFixed(4);
    return v.toExponential(1);
}

export default function MetricsOverlay({ metrics, history }: MetricsOverlayProps) {
    const data = React.useMemo(() => history.map((entry) => ({ ...entry })), [history]);

    return (
        <div className="w-60 shrink-0 bg-black/70 border border-lime-500/30 p-4">
            <div className="space-y-4">
                {METRIC_LINES.map((metric) => (
                    <div key={metric.key}>
                        <div className="flex justify-between items-baseline mb-2">
                            <h3 className="text-[10px] uppercase tracking-[0.2em] text-lime-200/70">
                                {metric.label}
                                {metric.unit ? <span className="text-lime-200/30"> {metric.unit}</span> : null}
                            </h3>
                            <span className={`font-mono text-sm ${metric.text}`}>
                                {fmt(metrics[metric.key])}
                            </span>
                        </div>
                        <div className="h-12">
                            <LineChart
                                width={208}
                                height={48}
                                data={data}
                                margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
                            >
                                <XAxis dataKey="t" hide />
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
            <p className="mt-3 text-[10px] text-lime-200/40 leading-snug">
                absolute coarse-grained values are small (immiscible cream and coffee); the sparklines are auto-scaled so the rise of entropy and the rise-and-fall of complexity are visible.
            </p>
        </div>
    );
}
