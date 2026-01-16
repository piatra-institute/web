'use client';

import { useMemo } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';

import type { SimulationState, TimeSeriesPoint, Metrics } from '../../logic';
import { kuramotoOrder, meanAngle, fmtPct, getLevelName, getLevelColor } from '../../logic';

interface ViewerProps {
    state: SimulationState;
    metrics: Metrics;
    series: TimeSeriesPoint[];
    showTimeSeries: boolean;
}

const LIME = '#84cc16';

interface WindowVisualizationProps {
    phases: number[];
    label: string;
    color: string;
    size?: number;
}

function WindowVisualization({ phases, label, color, size = 70 }: WindowVisualizationProps) {
    const order = kuramotoOrder(phases);
    const mean = meanAngle(phases);
    const r = size / 2 - 6;

    return (
        <div className="flex flex-col items-center gap-1">
            <svg width={size} height={size} className="bg-black/40 border border-lime-500/20">
                {/* Unit circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke="#333"
                    strokeWidth={1}
                />
                {/* Oscillator dots */}
                {phases.map((phase, i) => (
                    <circle
                        key={i}
                        cx={size / 2 + Math.cos(phase) * r * 0.85}
                        cy={size / 2 + Math.sin(phase) * r * 0.85}
                        r={3}
                        fill={color}
                        opacity={0.8}
                    />
                ))}
                {/* Mean vector */}
                <line
                    x1={size / 2}
                    y1={size / 2}
                    x2={size / 2 + Math.cos(mean) * r * order}
                    y2={size / 2 + Math.sin(mean) * r * order}
                    stroke={color}
                    strokeWidth={2}
                    opacity={0.9}
                />
                {/* Center dot */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={2}
                    fill={color}
                />
            </svg>
            <div className="text-[10px] text-lime-200/70">{label}</div>
            <div className="text-[10px] text-lime-400 font-mono">{fmtPct(order)}</div>
        </div>
    );
}

export default function Viewer({
    state,
    metrics,
    series,
    showTimeSeries,
}: ViewerProps) {
    const chartData = useMemo(() => {
        return series.map(p => ({
            ...p,
            t: p.t.toFixed(1),
        }));
    }, [series]);

    const numLevels = state.levels.length;

    // Calculate window size based on number of windows
    const getWindowSize = (levelIndex: number) => {
        const numWindows = state.levels[levelIndex].windows.length;
        if (numWindows <= 2) return 80;
        if (numWindows <= 4) return 65;
        return 55;
    };

    return (
        <div className="w-[90vw] h-[90vh] flex flex-col gap-4 p-4 overflow-auto text-lime-100 outline-none [&_*]:outline-none">
            {/* Hierarchy visualization */}
            <div className="text-center">
                <h2 className="text-lime-400 text-sm font-semibold">
                    Nested Observer Windows
                </h2>
                <p className="text-xs text-lime-200/50">
                    {numLevels} levels, phase synchrony (Kuramoto order)
                </p>
            </div>

            <div className="bg-black/40 border border-lime-500/25 p-4 flex-1 overflow-auto">
                <div className="flex flex-col items-center gap-3">
                    {state.levels.map((level, lvlIdx) => {
                        const color = getLevelColor(lvlIdx, numLevels);
                        const levelName = getLevelName(lvlIdx, numLevels);
                        const windowSize = getWindowSize(lvlIdx);

                        return (
                            <div key={lvlIdx} className="flex flex-col items-center gap-2">
                                <div className="text-xs text-lime-200/60 uppercase tracking-wide">
                                    {levelName}
                                </div>
                                <div className="flex flex-wrap justify-center gap-3">
                                    {level.windows.map((window, wIdx) => (
                                        <WindowVisualization
                                            key={`${lvlIdx}-${wIdx}`}
                                            phases={window.phases}
                                            label={lvlIdx === 0 ? 'Apex' : `W${wIdx + 1}`}
                                            color={color}
                                            size={windowSize}
                                        />
                                    ))}
                                </div>
                                {metrics.cohByLevel[lvlIdx] !== undefined && level.windows.length > 1 && (
                                    <div className="text-xs text-lime-200/50">
                                        Peer coherence: {fmtPct(metrics.cohByLevel[lvlIdx])}
                                    </div>
                                )}
                                {lvlIdx < numLevels - 1 && (
                                    <div className="w-px h-4 bg-lime-500/30" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Summary metrics */}
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-black/40 border border-lime-500/25 p-3 text-center">
                    <div className="text-xs text-lime-200/60">Apex sync</div>
                    <div className="text-lg text-lime-400 font-mono">
                        {fmtPct(metrics.syncByLevel[0] || 0)}
                    </div>
                </div>
                <div className="bg-black/40 border border-lime-500/25 p-3 text-center">
                    <div className="text-xs text-lime-200/60">CFC</div>
                    <div className="text-lg text-lime-400 font-mono">{fmtPct(metrics.cfc)}</div>
                </div>
                <div className="bg-black/40 border border-lime-500/30 p-3 text-center">
                    <div className="text-xs text-lime-200/60">Report stability</div>
                    <div className="text-xl text-lime-400 font-mono">{fmtPct(metrics.reportStability)}</div>
                </div>
            </div>

            {/* Time series chart */}
            {showTimeSeries && series.length > 0 && (
                <>
                    <div className="text-center">
                        <h2 className="text-lime-400 text-sm font-semibold">
                            Metric time series
                        </h2>
                    </div>
                    <div className="bg-black/40 border border-lime-500/25 p-2">
                        <ResponsiveContainer width="100%" height={180}>
                            <LineChart
                                data={chartData}
                                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis
                                    dataKey="t"
                                    stroke="#666"
                                    tick={{ fill: '#888', fontSize: 10 }}
                                    tickFormatter={(v) => `${v}s`}
                                />
                                <YAxis
                                    domain={[0, 1]}
                                    stroke="#666"
                                    tick={{ fill: '#888', fontSize: 10 }}
                                    tickFormatter={(v) => `${Math.round(v * 100)}%`}
                                />
                                <Tooltip
                                    formatter={(value) => [`${Math.round(Number(value) * 100)}%`, '']}
                                    contentStyle={{
                                        backgroundColor: '#000',
                                        border: '1px solid #333',
                                        borderRadius: 0,
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="syncApex"
                                    name="Apex sync"
                                    stroke="#f472b6"
                                    strokeWidth={2}
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="cfc"
                                    name="CFC"
                                    stroke="#22d3ee"
                                    strokeWidth={2}
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="reportStability"
                                    name="Report stability"
                                    stroke={LIME}
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </div>
    );
}
