'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

import ChartTooltip from '@/components/ChartTooltip';

import type { MetricSample } from '../../types';


interface EntropyComplexityChartProps {
    history: MetricSample[];
    height?: number;
}

/**
 * The honest centerpiece. Entropy (bits, left axis, fixed 0-1) and apparent
 * complexity (right axis, auto-scaled to its own max so the hump is visible
 * without any cosmetic gain) on a shared time axis. Entropy climbs to a
 * plateau; complexity rises and then falls.
 */
export default function EntropyComplexityChart({
    history,
    height = 220,
}: EntropyComplexityChartProps) {
    return (
        <div className="w-[min(88vw,640px)]">
            <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-lime-200/70">
                    entropy and complexity over time
                </h3>
                <span className="text-[10px] text-lime-200/40 font-mono">
                    each axis auto-scaled: entropy rises, complexity peaks then falls
                </span>
            </div>
            <div style={{ width: '100%', height }}>
                <ResponsiveContainer width="100%" height={height} minWidth={0}>
                    <LineChart data={history} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                        <CartesianGrid stroke="#1f2a13" strokeDasharray="3 3" />
                        <XAxis dataKey="t" hide />
                        <YAxis
                            yAxisId="entropy"
                            domain={[0, 'dataMax']}
                            width={34}
                            tick={{ fill: '#84cc16', fontSize: 10 }}
                            tickLine={false}
                            axisLine={{ stroke: '#1f2a13' }}
                        />
                        <YAxis
                            yAxisId="complexity"
                            orientation="right"
                            domain={[0, 'dataMax']}
                            width={34}
                            tick={{ fill: '#f59e0b', fontSize: 10 }}
                            tickLine={false}
                            axisLine={{ stroke: '#1f2a13' }}
                        />
                        <Tooltip
                            content={
                                <ChartTooltip
                                    labelFormat={() => 'sample'}
                                    valueFormat={(v) => v.toFixed(3)}
                                />
                            }
                        />
                        <Line
                            yAxisId="entropy"
                            type="monotone"
                            dataKey="entropy"
                            name="entropy (bits)"
                            stroke="#84cc16"
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                        />
                        <Line
                            yAxisId="complexity"
                            type="monotone"
                            dataKey="complexity"
                            name="complexity (rel.)"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-1.5 text-[10px] font-mono">
                <span className="text-lime-400">entropy (left)</span>
                <span className="text-amber-400">apparent complexity (right)</span>
            </div>
        </div>
    );
}
