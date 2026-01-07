'use client';

import { useMemo, useState, useEffect, ReactNode } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
} from 'recharts';

import type {
    MicroTrajectory,
    LocalSection,
    GlueResult,
    ReducedModel,
    OverlapStats,
    Interval,
    MutualInformationDiagnostic,
    CommuteDiagnostic,
    MacroStats,
    MemoryKernelEstimate,
    MarkovTestResult,
} from '../../logic';

interface ChartPoint {
    t: number;
    micro?: number;
    local?: number;
    glued?: number;
    macro?: number;
    pred?: number;
}

interface PanelProps {
    title: string;
    description?: string;
    footer?: ReactNode;
    children: ReactNode;
    className?: string;
}

function Panel({ title, description, footer, children, className }: PanelProps) {
    return (
        <div className={`bg-black/40 border border-lime-500/25 p-2 flex flex-col gap-1 ${className ?? ''}`}>
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-xs font-semibold text-lime-300 uppercase tracking-wide">{title}</div>
                    {description && <div className="text-[10px] text-lime-200/70">{description}</div>}
                </div>
                {footer}
            </div>
            <div className="flex-1 min-h-0">{children}</div>
        </div>
    );
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
    mutualInfo: MutualInformationDiagnostic[];
    commuteDiagnostics: CommuteDiagnostic[];
    macroStats: MacroStats;
    memoryKernel: MemoryKernelEstimate;
    markovTest: MarkovTestResult;
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
    mutualInfo,
    commuteDiagnostics,
    macroStats,
    memoryKernel,
    markovTest,
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

    const macroTrackData = useMemo(() => {
        const data: ChartPoint[] = [];
        for (let i = 0; i < micro.t.length; i++) {
            const within = i <= currentIndex;
            data.push({
                t: micro.t[i],
                macro: within && Number.isFinite(macro[i]) ? macro[i] : undefined,
                pred: within && Number.isFinite(reduced.pred[i]) ? reduced.pred[i] : undefined,
            });
        }
        return data;
    }, [micro.t, macro, reduced.pred, currentIndex]);

    const kernelData = useMemo(() => {
        return memoryKernel.lags.map((lag, idx) => ({
            lag,
            weight: memoryKernel.weights[idx] ?? 0,
        }));
    }, [memoryKernel]);

    const autocorrData = useMemo(() => {
        return macroStats.autocorrelation.map(({ lag, value }) => ({
            lag,
            value,
        }));
    }, [macroStats.autocorrelation]);

    const pairDiagnostics = useMemo(() => {
        return overlapStats.pairwise.slice(0, 4);
    }, [overlapStats.pairwise]);

    const tripleDiagnostics = useMemo(() => {
        return overlapStats.triple.slice(0, 3);
    }, [overlapStats.triple]);

    const topMutualInfo = useMemo(() => {
        return [...mutualInfo].sort((a, b) => b.bits - a.bits).slice(0, 4);
    }, [mutualInfo]);

    const commuteHighlights = useMemo(() => {
        return [...commuteDiagnostics]
            .sort((a, b) => b.meanDiff - a.meanDiff)
            .slice(0, 4);
    }, [commuteDiagnostics]);

    const selectedInterval = cover[selectedSection];

    const sheafVerdict = glueResult.ok ? 'GLUED' : 'FAIL';
    const closureRMSE = reduced.rmse;

    if (!mounted) {
        return <div className="w-full h-full" />;
    }

    return (
        <div className="w-full h-full flex flex-col gap-2 p-2 outline-none [&_*]:outline-none text-lime-100 overflow-y-auto" tabIndex={-1}>
            {/* Row 1: Main charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                <Panel title="Micro vs gluing" description="Global trajectory against glued section">
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={chartData} margin={{ top: 5, right: 12, left: 0, bottom: 2 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                            <XAxis dataKey="t" tickFormatter={(v) => Number(v).toFixed(1)} stroke="#555" tick={{ fill: '#999', fontSize: 9 }} />
                            <YAxis stroke="#555" tick={{ fill: '#999', fontSize: 9 }} width={35} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#050505', border: '1px solid #262626' }}
                                labelStyle={{ color: '#ccc' }}
                                formatter={(value: number) => value?.toFixed(4)}
                                labelFormatter={(label: number) => `t = ${label?.toFixed(2)}`}
                            />
                            <Legend wrapperStyle={{ fontSize: 9 }} />
                            <Line type="monotone" dataKey="micro" name="micro X(t)" stroke="#737373" dot={false} strokeWidth={1} isAnimationActive={false} />
                            <Line type="monotone" dataKey="glued" name="glued" stroke="#84cc16" dot={false} strokeWidth={2} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </Panel>

                <Panel title="Macro vs reduced" description="Coarse-grained and closure prediction">
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={macroTrackData} margin={{ top: 5, right: 12, left: 0, bottom: 2 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                            <XAxis dataKey="t" tickFormatter={(v) => Number(v).toFixed(1)} stroke="#555" tick={{ fill: '#999', fontSize: 9 }} />
                            <YAxis stroke="#555" tick={{ fill: '#999', fontSize: 9 }} width={35} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#050505', border: '1px solid #262626' }}
                                labelStyle={{ color: '#ccc' }}
                                formatter={(value: number) => value?.toFixed(4)}
                                labelFormatter={(label: number) => `t = ${label?.toFixed(2)}`}
                            />
                            <Legend wrapperStyle={{ fontSize: 9 }} />
                            <Line type="monotone" dataKey="macro" name="macro M(t)" stroke="#22d3ee" dot={false} strokeWidth={2} isAnimationActive={false} />
                            <Line type="monotone" dataKey="pred" name="reduced" stroke="#f472b6" dot={false} strokeWidth={1.5} strokeDasharray="4 2" isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </Panel>
            </div>

            {/* Row 2: Local section + kernel/autocorr */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                <Panel
                    title={`Local I${selectedSection}`}
                    description={selectedInterval ? `[${selectedInterval.a.toFixed(1)}, ${selectedInterval.b.toFixed(1)}]` : undefined}
                >
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={localOverlay} margin={{ top: 4, right: 12, left: 0, bottom: 2 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                            <XAxis dataKey="t" tickFormatter={(v) => Number(v).toFixed(1)} stroke="#555" tick={{ fill: '#999', fontSize: 9 }} />
                            <YAxis stroke="#555" tick={{ fill: '#999', fontSize: 9 }} width={35} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#050505', border: '1px solid #262626' }}
                                labelStyle={{ color: '#ccc' }}
                                formatter={(value: number) => value?.toFixed(4)}
                                labelFormatter={(label: number) => `t = ${label?.toFixed(2)}`}
                            />
                            <Legend wrapperStyle={{ fontSize: 9 }} />
                            <Line type="monotone" dataKey="micro" name="micro" stroke="#737373" dot={false} strokeWidth={1} isAnimationActive={false} />
                            <Line type="monotone" dataKey="local" name="local" stroke="#a3e635" dot={false} strokeWidth={2} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </Panel>

                <Panel title="Memory kernel" description="FIR weights">
                    {kernelData.length ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={kernelData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                <XAxis dataKey="lag" tickFormatter={(v) => `${v.toFixed(1)}s`} stroke="#555" tick={{ fill: '#999', fontSize: 8 }} />
                                <YAxis stroke="#555" tick={{ fill: '#999', fontSize: 8 }} width={30} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#050505', border: '1px solid #262626' }}
                                    labelFormatter={(label: number) => `lag ${label.toFixed(2)}s`}
                                    formatter={(value: number) => value?.toFixed(4)}
                                />
                                <Bar dataKey="weight" fill="#84cc16" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-[10px] text-lime-200/60 italic">No kernel data</div>
                    )}
                </Panel>

                <Panel title="Autocorrelation" description="M(t) at lags">
                    {autocorrData.length ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={autocorrData} margin={{ top: 4, right: 8, left: 0, bottom: 2 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                <XAxis dataKey="lag" stroke="#555" tick={{ fill: '#999', fontSize: 8 }} />
                                <YAxis domain={[-1, 1]} stroke="#555" tick={{ fill: '#999', fontSize: 8 }} width={25} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#050505', border: '1px solid #262626' }}
                                    labelFormatter={(label: number) => `lag ${label}`}
                                    formatter={(value: number) => value?.toFixed(3)}
                                />
                                <Line type="monotone" dataKey="value" stroke="#fbbf24" strokeWidth={1.5} dot={{ r: 1.5 }} isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-[10px] text-lime-200/60 italic">No data</div>
                    )}
                </Panel>
            </div>

            {/* Row 3: Diagnostics + Stats + Playback */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
                <Panel title="Sheaf diagnostics">
                    <div className="space-y-2 text-[10px]">
                        <div>
                            <div className="text-lime-200/70 uppercase text-[9px] mb-0.5">Pairs</div>
                            {pairDiagnostics.length ? (
                                <dl className="space-y-0.5 font-mono">
                                    {pairDiagnostics.slice(0, 3).map((diag, idx) => (
                                        <div key={`${diag.intervals.join('-')}-${idx}`} className="flex justify-between">
                                            <dt>I{diag.intervals[0]}↔I{diag.intervals[1]}</dt>
                                            <dd className={diag.ok ? 'text-lime-300' : 'text-red-400'}>{diag.maxAbs.toFixed(3)}</dd>
                                        </div>
                                    ))}
                                </dl>
                            ) : (
                                <div className="text-lime-200/60 italic">—</div>
                            )}
                        </div>
                        <div>
                            <div className="text-lime-200/70 uppercase text-[9px] mb-0.5">Čech</div>
                            {tripleDiagnostics.length ? (
                                <dl className="space-y-0.5 font-mono">
                                    {tripleDiagnostics.slice(0, 2).map((diag, idx) => (
                                        <div key={`${diag.intervals.join('-')}-${idx}`} className="flex justify-between">
                                            <dt>I{diag.intervals[0]}∩{diag.intervals[1]}∩{diag.intervals[2]}</dt>
                                            <dd className={diag.ok ? 'text-lime-300' : 'text-red-400'}>{diag.maxViolation.toFixed(3)}</dd>
                                        </div>
                                    ))}
                                </dl>
                            ) : (
                                <div className="text-lime-200/60 italic">—</div>
                            )}
                        </div>
                    </div>
                </Panel>

                <Panel title="Closure test">
                    <div className="space-y-2 text-[10px]">
                        <div>
                            <div className="text-lime-200/70 uppercase text-[9px] mb-0.5">Ljung–Box</div>
                            <div className="font-mono text-lime-300">
                                Q={markovTest.statistic.toFixed(1)} p={markovTest.pValue.toFixed(3)}{' '}
                                <span className={markovTest.passed ? 'text-lime-300' : 'text-red-400'}>
                                    {markovTest.passed ? '✓' : '✗'}
                                </span>
                            </div>
                        </div>
                        <div>
                            <div className="text-lime-200/70 uppercase text-[9px] mb-0.5">Parameters</div>
                            <div className="font-mono text-lime-300 grid grid-cols-3 gap-1">
                                <span>a={reduced.a.toFixed(2)}</span>
                                <span>b={reduced.b.toFixed(2)}</span>
                                <span>c={reduced.c.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="font-mono">
                            <span className="text-lime-200/70">RMSE:</span> <span className="text-lime-300">{closureRMSE.toFixed(3)}</span>
                        </div>
                    </div>
                </Panel>

                <Panel title="Macro stats">
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                        <div><span className="text-lime-200/70">μ:</span> <span className="font-mono text-lime-300">{macroStats.mean.toFixed(3)}</span></div>
                        <div><span className="text-lime-200/70">σ²:</span> <span className="font-mono text-lime-300">{macroStats.variance.toFixed(3)}</span></div>
                        <div><span className="text-lime-200/70">skew:</span> <span className="font-mono text-lime-300">{macroStats.skewness.toFixed(2)}</span></div>
                        <div><span className="text-lime-200/70">kurt:</span> <span className="font-mono text-lime-300">{macroStats.kurtosis.toFixed(2)}</span></div>
                    </div>
                    <div className="text-[10px] mt-1">
                        <span className="text-lime-200/70">t½:</span> <span className="font-mono text-lime-300">{memoryKernel.halfLife.toFixed(2)}s</span>
                    </div>
                </Panel>

                <Panel title="Status">
                    <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                        <div className="flex items-center gap-1">
                            <span className="text-lime-200/60">Sheaf:</span>
                            <span className={glueResult.ok ? 'text-lime-300' : 'text-red-400'}>{sheafVerdict}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-lime-200/60">Δmax:</span>
                            <span className="text-lime-300">{overlapStats.maxAbs.toFixed(3)}</span>
                        </div>
                    </div>
                </Panel>
            </div>

            {/* Playback bar */}
            <div className="flex-shrink-0 flex flex-wrap items-center gap-3 px-2 py-1.5 bg-black/40 border border-lime-500/25">
                <div className="flex items-center gap-1">
                    <button
                        onClick={handlePlayPause}
                        className="px-2 py-0.5 text-xs border border-lime-500/50 text-lime-400 hover:bg-lime-500/10 transition-colors"
                    >
                        {isPlaying ? '⏸' : '▶'}
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-2 py-0.5 text-xs border border-lime-500/50 text-lime-400 hover:bg-lime-500/10 transition-colors"
                    >
                        ⏮
                    </button>
                </div>

                <div className="flex-1 flex items-center gap-2 min-w-[150px]">
                    <span className="text-[10px] text-lime-200/60 w-14">t={currentTime.toFixed(2)}</span>
                    <input
                        type="range"
                        min={0}
                        max={maxTime}
                        step={0.02}
                        value={currentTime}
                        onChange={handleTimeChange}
                        className="flex-1 h-1 bg-lime-500/20 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-lime-500 [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <span className="text-[10px] text-lime-200/60 w-8">{maxTime.toFixed(0)}</span>
                </div>

                <div className="flex items-center gap-0.5">
                    {[0.5, 1, 2, 4].map((s) => (
                        <button
                            key={s}
                            onClick={() => handleSpeedChange(s)}
                            className={`px-1.5 py-0.5 text-[10px] border transition-colors ${
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
        </div>
    );
}
