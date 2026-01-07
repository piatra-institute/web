'use client';

import { useMemo, useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

import type {
    MicroTrajectory,
    LocalSection,
    GlueResult,
    ReducedModel,
    OverlapStats,
    Interval,
} from '../../logic';

interface ChartPoint {
    t: number;
    micro?: number;
    local?: number;
    glued?: number;
    macro?: number;
    pred?: number;
}

export interface PlaybackState {
    isPlaying: boolean;
    currentTime: number;
    speed: number;
}

interface ViewerProps {
    micro: MicroTrajectory;
    sections: LocalSection[];
    cover: Interval[];
    glueResult: GlueResult;
    macro: number[];
    reduced: ReducedModel;
    overlapStats: OverlapStats;
    playback: PlaybackState;
    onPlaybackChange: (playback: PlaybackState) => void;
    selectedSection: number;
    maxTime: number;
}

export default function Viewer({
    micro,
    sections,
    cover,
    glueResult,
    macro,
    reduced,
    overlapStats,
    playback,
    onPlaybackChange,
    selectedSection,
    maxTime,
}: ViewerProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { currentTime, isPlaying, speed } = playback;

    // Find the index corresponding to currentTime
    const currentIndex = useMemo(() => {
        for (let i = 0; i < micro.t.length; i++) {
            if (micro.t[i] >= currentTime) return i;
        }
        return micro.t.length - 1;
    }, [micro.t, currentTime]);

    const handlePlayPause = () => {
        if (isPlaying) {
            onPlaybackChange({ ...playback, isPlaying: false });
        } else {
            // If at the end, reset to beginning before playing
            if (currentTime >= maxTime - 0.01) {
                onPlaybackChange({ ...playback, isPlaying: true, currentTime: 0 });
            } else {
                onPlaybackChange({ ...playback, isPlaying: true });
            }
        }
    };

    const handleReset = () => {
        onPlaybackChange({ ...playback, isPlaying: false, currentTime: 0 });
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onPlaybackChange({ ...playback, currentTime: parseFloat(e.target.value), isPlaying: false });
    };

    const handleSpeedChange = (newSpeed: number) => {
        onPlaybackChange({ ...playback, speed: newSpeed });
    };

    const chartData: ChartPoint[] = useMemo(() => {
        const data: ChartPoint[] = [];
        for (let i = 0; i < micro.t.length; i++) {
            const withinWindow = i <= currentIndex;
            data.push({
                t: micro.t[i],
                micro: withinWindow ? micro.x[i] : undefined,
                glued:
                    withinWindow && Number.isFinite(glueResult.glued[i])
                        ? glueResult.glued[i]
                        : undefined,
                macro:
                    withinWindow && Number.isFinite(macro[i]) ? macro[i] : undefined,
                pred:
                    withinWindow && Number.isFinite(reduced.pred[i])
                        ? reduced.pred[i]
                        : undefined,
            });
        }
        return data;
    }, [micro, glueResult.glued, macro, reduced.pred, currentIndex]);

    const section = sections[selectedSection];
    const localOverlay: ChartPoint[] = useMemo(() => {
        const data: ChartPoint[] = micro.t.map((tVal, i) => ({
            t: tVal,
            micro: i <= currentIndex ? micro.x[i] : undefined,
        }));

        if (!section) {
            return data;
        }

        for (let j = 0; j < section.indices.length; j++) {
            const gi = section.indices[j];
            if (gi <= currentIndex && Number.isFinite(section.values[j])) {
                data[gi].local = section.values[j];
                data[gi].micro = micro.x[gi];
            }
        }

        return data;
    }, [micro, section, currentIndex]);

    const selectedInterval = cover[selectedSection];

    const sheafVerdict = glueResult.ok ? 'GLUED' : 'FAIL';
    const closureRMSE = reduced.rmse;

    if (!mounted) {
        return <div className="w-full h-full" />;
    }

    return (
        <div className="w-full h-full flex flex-col gap-4 p-4 outline-none [&_*]:outline-none" tabIndex={-1}>
            {/* Main chart */}
            <div className="flex-[3] min-h-0 outline-none" tabIndex={-1}>
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis
                            dataKey="t"
                            tickFormatter={(v) => Number(v).toFixed(1)}
                            stroke="#666"
                            tick={{ fill: '#888', fontSize: 11 }}
                        />
                        <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 11 }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                            labelStyle={{ color: '#888' }}
                            formatter={(value: number) => value?.toFixed(4)}
                            labelFormatter={(label: number) => `t = ${label?.toFixed(2)}`}
                        />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Line
                            type="monotone"
                            dataKey="micro"
                            name="micro X(t)"
                            stroke="#666"
                            dot={false}
                            strokeWidth={1}
                            isAnimationActive={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="glued"
                            name="glued"
                            stroke="#84cc16"
                            dot={false}
                            strokeWidth={2}
                            isAnimationActive={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="macro"
                            name="macro M(t)"
                            stroke="#22d3ee"
                            dot={false}
                            strokeWidth={2}
                            isAnimationActive={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="pred"
                            name="reduced pred"
                            stroke="#f472b6"
                            dot={false}
                            strokeWidth={1.5}
                            strokeDasharray="4 2"
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Local section overlay */}
            <div className="flex-[1] flex flex-col min-h-0 outline-none" tabIndex={-1}>
                <div className="text-xs text-lime-200/60 mb-2">
                    Local section I{selectedSection}
                    {selectedInterval && (
                        <span className="ml-2 text-lime-400">
                            [{selectedInterval.a.toFixed(1)}, {selectedInterval.b.toFixed(1)}]
                        </span>
                    )}
                </div>
                <div className="flex-1 min-h-0 outline-none" tabIndex={-1}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <LineChart data={localOverlay} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis
                            dataKey="t"
                            tickFormatter={(v) => Number(v).toFixed(1)}
                            stroke="#666"
                            tick={{ fill: '#888', fontSize: 10 }}
                        />
                        <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 10 }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                            labelStyle={{ color: '#888' }}
                            formatter={(value: number) => value?.toFixed(4)}
                            labelFormatter={(label: number) => `t = ${label?.toFixed(2)}`}
                        />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line
                            type="monotone"
                            dataKey="micro"
                            name="global micro"
                            stroke="#666"
                            dot={false}
                            strokeWidth={1}
                            isAnimationActive={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="local"
                            name="local section"
                            stroke="#a3e635"
                            dot={false}
                            strokeWidth={2}
                            isAnimationActive={false}
                        />
                    </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Playback controls */}
            <div className="flex-shrink-0 flex items-center gap-4 px-2 py-2 border-t border-lime-500/20">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePlayPause}
                        className="px-3 py-1 text-sm border border-lime-500/50 text-lime-400 hover:bg-lime-500/10 transition-colors outline-none focus:outline-none"
                    >
                        {isPlaying ? '⏸ Pause' : '▶ Play'}
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-3 py-1 text-sm border border-lime-500/50 text-lime-400 hover:bg-lime-500/10 transition-colors outline-none focus:outline-none"
                    >
                        ⏮ Reset
                    </button>
                </div>

                <div className="flex-1 flex items-center gap-2">
                    <span className="text-xs text-lime-200/60 w-16">t = {currentTime.toFixed(2)}</span>
                    <input
                        type="range"
                        min={0}
                        max={maxTime}
                        step={0.02}
                        value={currentTime}
                        onChange={handleTimeChange}
                        className="flex-1 h-1 bg-lime-500/20 appearance-none cursor-pointer outline-none focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-lime-500 [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <span className="text-xs text-lime-200/60 w-12">{maxTime.toFixed(1)}</span>
                </div>

                <div className="flex items-center gap-1">
                    <span className="text-xs text-lime-200/60">Speed:</span>
                    {[0.5, 1, 2, 4].map((s) => (
                        <button
                            key={s}
                            onClick={() => handleSpeedChange(s)}
                            className={`px-2 py-0.5 text-xs border transition-colors outline-none focus:outline-none ${
                                speed === s
                                    ? 'bg-lime-500/20 border-lime-500 text-lime-400'
                                    : 'border-lime-500/30 text-lime-200/60 hover:border-lime-500/50'
                            }`}
                        >
                            {s}x
                        </button>
                    ))}
                </div>
            </div>

            {/* Metrics */}
            <div className="flex-shrink-0 flex flex-wrap gap-4 text-sm font-mono px-2">
                <div className="flex items-center gap-2 border border-lime-500/30 px-3 py-1">
                    <span className="text-lime-200/60">Sheaf gluing:</span>
                    <span className={glueResult.ok ? 'text-lime-400' : 'text-red-400'}>
                        {sheafVerdict}
                    </span>
                </div>
                <div className="flex items-center gap-2 border border-lime-500/30 px-3 py-1">
                    <span className="text-lime-200/60">Max overlap mismatch:</span>
                    <span className="text-lime-400">{overlapStats.maxAbs.toFixed(3)}</span>
                </div>
                <div className="flex items-center gap-2 border border-lime-500/30 px-3 py-1">
                    <span className="text-lime-200/60">Closure RMSE:</span>
                    <span className="text-lime-400">{closureRMSE.toFixed(3)}</span>
                </div>
            </div>
        </div>
    );
}
